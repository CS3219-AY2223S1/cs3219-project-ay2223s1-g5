import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CircularProgress, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { useSnackbar } from "notistack";

import { useSocket } from "src/contexts/WsContext";

import { MATCH_EVENTS, MATCH_NAMESPACE } from "~shared/constants";
import { MatchRes } from "~shared/types/api";
import { DifficultyLevel } from "~shared/types/base";

export const QueuePage = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const difficulty = params.get("difficulty");

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (!difficulty) {
      enqueueSnackbar("No difficulty level specified", {
        variant: "error",
      });
      navigate("/select-difficulty");
      return;
    }

    const normalized = difficulty.toUpperCase();
    if (
      Object.values(DifficultyLevel).filter((value) => normalized === value)
        .length === 0
    ) {
      enqueueSnackbar("Invalid difficulty level", {
        variant: "error",
      });
      navigate("/select-difficulty");
    }
  }, [difficulty, navigate, enqueueSnackbar]);

  const { socket, connect } = useSocket();

  // We use a callback on the "connect" event to set a state here
  // so that we can be sure that we will have the socket ID.
  const [connected, setConnected] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("Loading...");

  useEffect(() => {
    connect(MATCH_NAMESPACE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!socket) {
      return;
    }
    socket.on(MATCH_EVENTS.CONNECT, () => {
      setConnected(true);
    });
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  useEffect(() => {
    if (!socket || !connected) {
      return;
    }

    setMessage("Finding a match...");

    const timeout = setTimeout(() => {
      setMessage("Unable to find a match. Returning to dashboard.");
      // TODO: Stop the loading spinner or change its color.
      // We give the user some time to read the message.
      setTimeout(() => navigate("/dashboard"), 3000);
    }, 30000);

    socket.on(MATCH_EVENTS.MATCH_FOUND, (match: MatchRes) => {
      setMessage("Match found. Joining...");
      clearTimeout(timeout);
      setTimeout(() => navigate(`/room/${match.roomId}`), 1000);
    });

    socket.on(MATCH_EVENTS.EXISTING_MATCH, (roomId: string) => {
      setMessage("Existing match found. Rejoining...");
      clearTimeout(timeout);
      setTimeout(() => navigate(`/room/${roomId}`), 1000);
    });

    socket.emit(MATCH_EVENTS.ENTER_QUEUE, difficulty?.toUpperCase());

    return () => {
      socket.off(MATCH_EVENTS.MATCH_FOUND);
    };
  }, [socket, navigate, difficulty, connected]);

  return (
    <Stack
      spacing={4}
      sx={{
        height: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <CircularProgress size="4rem" />
      <Typography component={"span"}>{message}</Typography>
    </Stack>
  );
};
