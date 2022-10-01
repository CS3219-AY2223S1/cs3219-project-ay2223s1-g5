import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Divider, Stack } from "@mui/material";
import { useSnackbar } from "notistack";

import { Chat } from "src/components/chat/Chat";
import { Editor } from "src/components/Editor";
import { Question } from "src/components/Question";
import { RoomStatusBar } from "src/components/RoomStatusBar";
import { SOCKET_IO_DISCONNECT_REASON } from "src/constants/socket.io";
import { useAuth } from "src/contexts/AuthContext";
import { ChatProvider } from "src/contexts/ChatContext";
import { EditorProvider } from "src/contexts/EditorContext";
import { useSocket } from "src/contexts/SocketContext";
import { useGetUsersName } from "src/hooks/useUsers";

import { ROOM_EVENTS, ROOM_NAMESPACE } from "~shared/constants";
import {
  JoinedPayload,
  PartnerDisconnectPayload,
  PartnerLeavePayload,
} from "~shared/types/api";

type Participant = {
  userId: number;
  name?: string;
  isConnected: boolean;
};

export const RoomPage = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const { socket, connect } = useSocket();
  const { enqueueSnackbar } = useSnackbar();
  const [self, setSelf] = useState<Participant>({
    // We know that if the page renders, user is not null.
    userId: user?.userId || NaN,
    name: user?.name || "",
    isConnected: false,
  });
  const [participants, setParticipants] = useState<Participant[]>([]);
  const userInfos = useGetUsersName(
    participants.map((participant) => participant.userId),
  );

  const navigate = useNavigate();

  const onLeaveRoom = useCallback(() => {
    if (!socket) {
      return;
    }
    socket.off(ROOM_EVENTS.PARTNER_DISCONNECT);
    socket.off(ROOM_EVENTS.PARTNER_LEAVE);
    socket.off(ROOM_EVENTS.JOINED);
    socket.emit(ROOM_EVENTS.LEAVE, { roomId });
  }, [socket, roomId]);

  useEffect(() => {
    if (!roomId) {
      enqueueSnackbar("Invalid room ID", {
        variant: "error",
      });
      navigate("/select-difficulty");
      return;
    }
  }, [roomId, navigate, enqueueSnackbar]);

  useEffect(() => {
    connect(ROOM_NAMESPACE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (socket && roomId) {
      // Joining a room is idempotent so this should be fine.
      socket.emit(ROOM_EVENTS.JOIN, { roomId });

      // To handle reconnections.
      socket.on(ROOM_EVENTS.CONNECT, () => {
        socket.emit(ROOM_EVENTS.JOIN, { roomId });
      });
    }
  }, [socket, roomId]);

  useEffect(() => {
    if (!socket || !roomId) {
      return;
    }

    socket.on(ROOM_EVENTS.DISCONNECT, (reason: string) => {
      if (reason === SOCKET_IO_DISCONNECT_REASON.SERVER_CLOSE) {
        navigate("/dashboard");
        return;
      }
      setSelf((self) => ({ ...self, isConnected: false }));
      enqueueSnackbar(`You have disconnected. Reconnecting...`, {
        variant: "error",
      });
    });

    socket.on(ROOM_EVENTS.PARTNER_LEAVE, ({ userId }: PartnerLeavePayload) => {
      if (userId === user?.userId) {
        // Self disconnection would have been caught by DISCONNECT event.
        return;
      }
      const participantName = participants.find(
        (participant) => participant.userId === userId,
      )?.name;
      setParticipants((participants) => [
        ...participants.filter((participant) => participant.userId !== userId),
      ]);
      if (participantName) {
        enqueueSnackbar(`${participantName} has left the room.`, {
          variant: "warning",
        });
      }
    });

    socket.on(
      ROOM_EVENTS.PARTNER_DISCONNECT,
      ({ userId }: PartnerDisconnectPayload) => {
        if (userId === user?.userId) {
          // Self disconnection would have been caught by DISCONNECT event.
          return;
        }
        const participantName = participants.find(
          (participant) => participant.userId === userId,
        )?.name;

        setParticipants((participants) => {
          const participant = participants.find(
            (participant) => participant.userId === userId,
          );
          if (!participant) {
            return participants;
          }
          participant.isConnected = false;
          return [...participants];
        });
        enqueueSnackbar(`${participantName || "A user"} has disconnected.`, {
          variant: "info",
        });
      },
    );

    socket.on(ROOM_EVENTS.JOINED, ({ userId, members }: JoinedPayload) => {
      if (userId === user?.userId) {
        setSelf((self) => ({ ...self, isConnected: true }));
        enqueueSnackbar(`You are connected.`, {
          variant: "success",
        });
      } else {
        const participant = participants.find(
          (participant) => participant.userId === userId,
        );
        if (participant?.name) {
          enqueueSnackbar(`${participant.name} has connected.`, {
            variant: "info",
          });
        }
      }

      members = members.filter((member) => member.userId !== user?.userId);

      // Update the state of all participants in case we were disconnected when one of them updated.
      setParticipants((participants) => {
        // In the bootstrap case or the rare case that a partner leaves while we were disconnected,
        // just reinitalize the entire state of the group.
        if (members.length !== participants.length) {
          return [...members];
        }
        for (const member of members) {
          const participant = participants.find(
            (participant) => participant.userId === member.userId,
          );
          if (participant) {
            participant.isConnected = member.isConnected;
          } else {
            participants.push(member);
          }
        }
        return [...participants];
      });

      return;
    });

    return () => {
      socket.off(ROOM_EVENTS.CONNECT);
      socket.off(ROOM_EVENTS.JOINED);
      socket.off(ROOM_EVENTS.PARTNER_DISCONNECT);
      socket.off(ROOM_EVENTS.PARTNER_LEAVE);
    };
  }, [socket, roomId, navigate, user?.userId, enqueueSnackbar, participants]);

  useEffect(() => {
    if (userInfos.length === 0) {
      return;
    }
    setParticipants((participants) => {
      let changed = false;
      for (const participant of participants) {
        if (participant.name) {
          continue;
        }
        participant.name = userInfos.find((info) => info.userId)?.name || "?";
        changed = true;
      }
      if (!changed) {
        // No change in state.
        return participants;
      }
      return [...participants];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfos]);

  return (
    <EditorProvider roomId={roomId || ""}>
      <ChatProvider roomId={roomId || ""}>
        <Stack
          sx={{
            borderTop: "10px solid",
            borderColor: "primary.500",
            height: "100vh",
            maxWidth: "100vw",
            display: "flex",
          }}
        >
          <RoomStatusBar
            self={self}
            participants={participants}
            onLeaveRoom={onLeaveRoom}
          />
          <Divider />
          <Stack
            direction="row"
            spacing={2}
            sx={{ width: "100%", flex: 1, minHeight: 0, p: 3 }}
          >
            <Stack spacing={2} sx={{ minWidth: "40%", maxWidth: "40%" }}>
              <Box sx={{ flex: 1, minHeight: 0 }}>
                <Question />
              </Box>
              <Box sx={{ height: "40%" }}>
                <Chat />
              </Box>
            </Stack>
            <Box sx={{ height: "100%", flex: 1, minWidth: 0 }}>
              <Editor language={"javascript"} />
            </Box>
          </Stack>
        </Stack>
      </ChatProvider>
    </EditorProvider>
  );
};
