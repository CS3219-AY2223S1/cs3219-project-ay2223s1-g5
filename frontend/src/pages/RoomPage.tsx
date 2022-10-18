import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, CircularProgress, Divider, Stack } from "@mui/material";
import { useSnackbar } from "notistack";
import { Socket } from "socket.io-client";

import { Chat } from "src/components/room/chat/Chat";
import { Editor } from "src/components/room/Editor";
import { QuestionSubmissionPanel } from "src/components/room/QuestionSubmissionPanel";
import { RoomStatusBar } from "src/components/room/RoomStatusBar";
import { SubmitButton } from "src/components/room/SubmitButton";
import { SOCKET_IO_DISCONNECT_REASON } from "src/constants/socket.io";
import { useAuth } from "src/contexts/AuthContext";
import { ChatProvider } from "src/contexts/ChatContext";
import { EditorProvider } from "src/contexts/EditorContext";
import { useSockets } from "src/contexts/SocketsContext";
import { useRefreshSubmissions } from "src/hooks/useSubmissions";
import { useGetUsersName } from "src/hooks/useUsers";

import { ROOM_EVENTS, ROOM_NAMESPACE } from "~shared/constants";
import {
  JoinedPayload,
  PartnerDisconnectPayload,
  PartnerLeavePayload,
  SubmissionRejectedPayload,
} from "~shared/types/api";
import { SubmissionUpdatedPayload } from "~shared/types/api/room.dto";
import { Language } from "~shared/types/base";

type Participant = {
  userId: number;
  name?: string;
  isConnected: boolean;
};

export const RoomPage = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const { sockets, connect } = useSockets();
  const [roomSocket, setRoomSocket] = useState<Socket | undefined>(undefined);
  const { enqueueSnackbar } = useSnackbar();
  const [language, setLanguage] = useState<Language | undefined>(undefined);
  const [questionId, setQuestionId] = useState<number | undefined>(undefined);

  const [isSubmitLoading, setIsSubmitLoading] = useState<boolean>(false);
  const [hasNewSubmissions, setHasNewSubmissions] = useState<boolean>(false);
  const { refreshSubmissions } = useRefreshSubmissions(roomId);
  const clearHasNewSubmissions = useCallback(() => {
    setHasNewSubmissions(false);
  }, [setHasNewSubmissions]);

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
    if (!roomSocket) {
      return;
    }
    roomSocket.off(ROOM_EVENTS.PARTNER_DISCONNECT);
    roomSocket.off(ROOM_EVENTS.PARTNER_LEAVE);
    roomSocket.off(ROOM_EVENTS.JOINED);
    roomSocket.emit(ROOM_EVENTS.LEAVE, { roomId });
    // Room socket will be disconnected by server side.
  }, [roomSocket, roomId]);

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
    const socket = sockets.get(ROOM_NAMESPACE);
    if (!socket) {
      return;
    }
    setRoomSocket(socket);
  }, [sockets]);

  useEffect(() => {
    if (roomSocket && roomId) {
      // Joining a room is idempotent so this should be fine.
      roomSocket.emit(ROOM_EVENTS.JOIN, { roomId });

      // FIXME: socket.on(ROOM_EVENTS.CONNECT) should work.
      roomSocket.io.on("reconnect", () => {
        roomSocket.emit(ROOM_EVENTS.JOIN, { roomId });
      });
    }
  }, [roomSocket, roomId]);

  useEffect(() => {
    if (!roomSocket || !roomId) {
      return;
    }

    roomSocket.on(ROOM_EVENTS.DISCONNECT, (reason: string) => {
      if (reason === SOCKET_IO_DISCONNECT_REASON.SERVER_CLOSE) {
        navigate("/dashboard");
        return;
      }
      setSelf((self) => ({ ...self, isConnected: false }));
      enqueueSnackbar(`You have disconnected. Reconnecting...`, {
        variant: "error",
      });
    });

    roomSocket.on(
      ROOM_EVENTS.PARTNER_LEAVE,
      ({ userId }: PartnerLeavePayload) => {
        if (userId === user?.userId) {
          // Self disconnection would have been caught by DISCONNECT event.
          return;
        }
        const participantName = participants.find(
          (participant) => participant.userId === userId,
        )?.name;
        setParticipants((participants) => [
          ...participants.filter(
            (participant) => participant.userId !== userId,
          ),
        ]);
        if (participantName) {
          enqueueSnackbar(`${participantName} has left the room.`, {
            variant: "warning",
          });
        }
      },
    );

    roomSocket.on(
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

    roomSocket.on(
      ROOM_EVENTS.JOINED,
      ({
        userId,
        metadata: { members, language, questionId },
      }: JoinedPayload) => {
        setLanguage(language);
        setQuestionId(questionId);

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
      },
    );

    roomSocket.on(
      ROOM_EVENTS.SUBMISSION_REJECTED,
      ({ reason }: SubmissionRejectedPayload) => {
        enqueueSnackbar(`${reason}`, {
          variant: "error",
        });
        setIsSubmitLoading(false);
      },
    );

    roomSocket.on(ROOM_EVENTS.SUBMISSION_ACCEPTED, () => {
      enqueueSnackbar("Processing submission");
      setIsSubmitLoading(true);
    });

    roomSocket.on(
      ROOM_EVENTS.SUBMISSION_UPDATED,
      (_payload: SubmissionUpdatedPayload) => {
        enqueueSnackbar("Submission updated");
        refreshSubmissions();
        setHasNewSubmissions(true);
        setIsSubmitLoading(false);
      },
    );

    return () => {
      roomSocket.off(ROOM_EVENTS.CONNECT);
      roomSocket.off(ROOM_EVENTS.JOINED);
      roomSocket.off(ROOM_EVENTS.PARTNER_DISCONNECT);
      roomSocket.off(ROOM_EVENTS.PARTNER_LEAVE);
    };
  }, [
    roomSocket,
    roomId,
    navigate,
    user?.userId,
    enqueueSnackbar,
    participants,
    hasNewSubmissions,
    refreshSubmissions,
  ]);

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

  const onSubmit = useCallback(
    (code: string) => {
      if (!roomSocket || !questionId || !language) {
        return;
      }
      roomSocket.emit(ROOM_EVENTS.SUBMIT, {
        code: code,
        questionId,
        language,
      });
      setIsSubmitLoading(true);
    },
    [language, questionId, roomSocket],
  );

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
            sx={{ p: 3, pb: 2, flex: 1, minHeight: 0 }}
          >
            <Stack spacing={2} sx={{ minWidth: "40%", maxWidth: "40%" }}>
              <Box sx={{ height: "60%" }}>
                <QuestionSubmissionPanel
                  questionId={questionId}
                  roomId={roomId}
                  hasNewSubmissions={hasNewSubmissions}
                  clearHasNewSubmissions={clearHasNewSubmissions}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Chat />
              </Box>
            </Stack>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Editor language={language} />
            </Box>
          </Stack>
          <Stack
            direction="row"
            justifyContent="flex-end"
            sx={{ pb: 2, px: 3 }}
          >
            {language && roomSocket && questionId ? (
              <SubmitButton onSubmit={onSubmit} isLoading={isSubmitLoading} />
            ) : (
              <CircularProgress />
            )}
          </Stack>
        </Stack>
      </ChatProvider>
    </EditorProvider>
  );
};
