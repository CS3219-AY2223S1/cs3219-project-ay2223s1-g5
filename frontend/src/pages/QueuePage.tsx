import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CircularProgress, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { useSnackbar } from "notistack";

import { Timer } from "src/components/Timer";
import { useSocket } from "src/contexts/SocketContext";

import { QUEUE_EVENTS, QUEUE_NAMESPACE } from "~shared/constants";
import { MatchRes } from "~shared/types/api";
import { DifficultyLevel } from "~shared/types/base";

const TIMEOUT = 30;

export const QueuePage = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const difficulty = params.get("difficulty");
  const [timeoutId, setTimeoutId] = useState<number | undefined>(undefined);
  const [timer, setTimer] = useState<number>(TIMEOUT);
  const [timerVariant, setTimerVariant] = useState<
    "determinate" | "indeterminate"
  >("determinate");

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
    connect(QUEUE_NAMESPACE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!socket) {
      return;
    }
    socket.on(QUEUE_EVENTS.CONNECT, () => {
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
    socket.emit(QUEUE_EVENTS.ENTER_QUEUE, difficulty?.toUpperCase());
  }, [socket, connected, difficulty]);

  useEffect(() => {
    if (timer === 0) {
      setTimerVariant("indeterminate");
      setMessage("Unable to find a match. Returning to dashboard.");
      // We give the user some time to read the message.
      setTimeout(() => navigate("/dashboard"), 3000);
      return;
    }
    const timeoutId = setTimeout(() => setTimer(timer - 1), 1000);
    setTimeoutId(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer]);

  useEffect(() => {
    if (!socket || !connected) {
      return;
    }

    setMessage("Finding a match...");

    socket.on(QUEUE_EVENTS.MATCH_FOUND, (match: MatchRes) => {
      setMessage("Match found. Joining...");
      clearTimeout(timeoutId);
      setTimeout(() => navigate(`/room/${match.roomId}`), 1000);
    });

    socket.on(QUEUE_EVENTS.EXISTING_MATCH, (roomId: string) => {
      setMessage("Existing match found. Rejoining...");
      clearTimeout(timeoutId);
      setTimeout(() => navigate(`/room/${roomId}`), 1000);
    });

    return () => {
      socket.off(QUEUE_EVENTS.MATCH_FOUND);
      socket.off(QUEUE_EVENTS.EXISTING_MATCH);
    };
  }, [socket, navigate, difficulty, connected, timeoutId]);

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
      {timerVariant === "determinate" ? (
        <Timer size="4rem" state={timer} total={TIMEOUT} />
      ) : (
        <CircularProgress size="4rem" />
      )}
      <Typography component={"span"}>{message}</Typography>
    </Stack>
  );
};
