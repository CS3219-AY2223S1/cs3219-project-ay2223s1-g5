import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Avatar, Divider, Grid, Paper, Stack, Typography } from "@mui/material";
import { useSnackbar } from "notistack";

import { useSocket } from "src/contexts/WsContext";

import { Editor } from "../components/Editor";
import { Question } from "../components/Question";
import { StyledButton } from "../components/StyledButton";

import { ROOM_EVENTS, ROOM_NAMESPACE } from "~shared/constants";

export const RoomPage = () => {
  const { roomId } = useParams();
  const { socket, connect } = useSocket();
  const [leaveRoom, setIsLeaveRoom] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (!roomId) {
      enqueueSnackbar("Invalid room ID", {
        variant: "error",
        key: "missing-room",
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
    if (leaveRoom && socket) {
      if (roomId) {
        socket.emit(ROOM_EVENTS.LEAVE, roomId);
      }
      navigate("/dashboard");
    }
  }, [leaveRoom, socket, roomId, navigate]);

  useEffect(() => {
    if (!socket || !roomId) {
      return;
    }
    socket.emit("join", roomId);

    socket.on(ROOM_EVENTS.END_MATCH, () => {
      setMessage("The other user has left the room. Ending match...");
      setTimeout(() => navigate("/dashboard"), 3000);
    });

    socket.on(ROOM_EVENTS.WAIT, () => {
      setMessage(
        "The other user has disconnected. Waiting for reconnection...",
      );
    });

    socket.on("reconnected", () => {
      setMessage("");
    });
  }, [socket, roomId, navigate]);

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
                bgcolor: "primary.A700",
              }}
            />
            <Avatar
              sx={{
                width: "36px",
                height: "36px",
                bgcolor: "primary.A700",
              }}
            />
          </Stack>
          <StyledButton
            label={"Leave Room"}
            sx={{
              bgcolor: "red.500",
              "&:hover": {
                bgcolor: "red.700",
                boxShadow: "1",
              },
            }}
            onClick={() => {
              setIsLeaveRoom(true);
            }}
          />
        </Grid>
        <Divider />
        <Stack direction="row" spacing={2} sx={{ p: 3 }}>
          <Grid item xs={4}>
            <Question />
          </Grid>
          <Grid item xs={8}>
            <Editor />
          </Grid>
        </Stack>
      </Grid>
      <div>{roomId}</div>
      <div>{message}</div>
    </Grid>
  );
};
