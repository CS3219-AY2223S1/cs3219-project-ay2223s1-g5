import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Avatar, Divider, Grid, Stack } from "@mui/material";
import { useSnackbar } from "notistack";

import { Chat } from "src/components/Chat";
import { Editor } from "src/components/Editor";
import { Question } from "src/components/Question";
import { StyledButton } from "src/components/StyledButton";
import { SOCKET_IO_DISCONNECT_REASON } from "src/constants/socket.io";
import { useAuth } from "src/contexts/AuthContext";
import { ChatProvider } from "src/contexts/ChatContext";
import { EditorProvider } from "src/contexts/EditorContext";
import { useSocket } from "src/contexts/SocketContext";
import { useGetUserName } from "src/hooks/useUsers";
import { nameToInitials } from "src/utils/string";

import { ROOM_EVENTS, ROOM_NAMESPACE } from "~shared/constants";
import {
  JoinedPayload,
  PartnerDisconnectPayload,
  PartnerLeavePayload,
} from "~shared/types/api";

type participant = {
  userId: number;
  name?: string;
  isConnected: boolean;
};

export const RoomPage = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const { socket, connect } = useSocket();
  const [self, setSelf] = useState<participant>({
    // We know that if the page renders, user is not null.
    userId: user?.userId || NaN,
    name: user?.name || "",
    isConnected: false,
  });
  const [partner, setPartner] = useState<participant | undefined>(undefined);
  const { user: partnerInfo } = useGetUserName(partner?.userId);

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const leaveRoom = useCallback(() => {
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
      socket.emit(ROOM_EVENTS.JOIN, { roomId });
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
      setPartner(undefined);
      enqueueSnackbar(`${partner?.name} has left the room.`, {
        variant: "warning",
      });
    });

    socket.on(
      ROOM_EVENTS.PARTNER_DISCONNECT,
      ({ userId }: PartnerDisconnectPayload) => {
        if (userId === user?.userId) {
          // Self disconnection would have been caught by DISCONNECT event.
          return;
        }
        if (!partner) {
          return;
        }
        setPartner((partner) => {
          if (!partner) {
            return undefined;
          }
          return { ...partner, isConnected: false };
        });
        // TODO: If partner name does not exist, use generic term.
        enqueueSnackbar(`${partner?.name} has disconnected.`, {
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
        if (partner) {
          // We already have partner ID.
          return;
        }
        const other = members.filter(
          (userInfo) => userInfo.userId !== user.userId,
        )?.[0];
        if (!other) {
          // The other party has already left the room.
          return;
        }
        setPartner((partner) => {
          if (!partner) {
            return other;
          }
          return { ...other, name: partner.name };
        });
        return;
      }
      setPartner((partner) => {
        if (!partner) {
          return { userId: userId, isConnected: true };
        }
        if (partner.name) {
          enqueueSnackbar(`${partner.name} has connected.`, {
            variant: "info",
          });
        }
        return { ...partner, isConnected: true };
      });
    });

    return () => {
      socket.off(ROOM_EVENTS.JOINED);
      socket.off(ROOM_EVENTS.PARTNER_DISCONNECT);
      socket.off(ROOM_EVENTS.PARTNER_LEAVE);
    };
  }, [
    socket,
    roomId,
    navigate,
    user?.userId,
    partner?.name,
    enqueueSnackbar,
    partner,
  ]);

  useEffect(() => {
    if (partnerInfo) {
      setPartner((partner) => {
        if (!partner) {
          return undefined;
        }
        return {
          ...partner,
          name: partnerInfo.name,
        };
      });
      // FIXME: For user reconnecting, snackbar should not appear
      // for partner name.
      if (partner?.isConnected) {
        enqueueSnackbar(`${partnerInfo.name} has connected.`, {
          variant: "info",
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerInfo]);

  return (
    <Grid
      container
      sx={{ borderTop: "10px solid", borderColor: "primary.500" }}
    >
      <Grid item xs={12}>
        <Grid
          container
          item
          xs={12}
          sx={{ py: 2, px: 3, justifyContent: "space-between" }}
        >
          <Stack
            direction="row"
            spacing={1}
            sx={{ display: "flex", alignItems: "center" }}
          >
            <Avatar
              sx={{
                width: "36px",
                height: "36px",
                bgcolor: self.isConnected ? "secondary.A700" : "grey.500",
                fontSize: "14px",
              }}
            >
              {nameToInitials(self.name)}
            </Avatar>
            {partner && (
              <Avatar
                sx={{
                  width: "36px",
                  height: "36px",
                  bgcolor: partner?.isConnected ? "primary.A700" : "grey.500",
                  fontSize: "14px",
                }}
              >
                {nameToInitials(partner?.name)}
              </Avatar>
            )}
          </Stack>
          <StyledButton
            label={"Leave Room"}
            disabled={!socket}
            sx={{
              bgcolor: "red.500",
              "&:hover": {
                bgcolor: "red.700",
                boxShadow: "1",
              },
            }}
            onClick={leaveRoom}
          />
        </Grid>
        <Divider />
        <Stack direction="row" spacing={2} sx={{ p: 3 }}>
          <Grid item xs={4}>
            <Stack spacing={2}>
              <Question />
              <ChatProvider roomId={roomId || ""}>
                <Chat />
              </ChatProvider>
            </Stack>
          </Grid>
          <Grid item xs={8}>
            <EditorProvider roomId={roomId || ""}>
              <Editor language={"javascript"} />
            </EditorProvider>
          </Grid>
        </Stack>
      </Grid>
    </Grid>
  );
};
