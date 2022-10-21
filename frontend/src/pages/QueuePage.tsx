import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CircularProgress, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { useSnackbar } from "notistack";
import { Socket } from "socket.io-client";

import { StyledButton } from "src/components/StyledButton";
import { Timer } from "src/components/Timer";
import { useSockets } from "src/contexts/SocketsContext";

import { QUEUE_EVENTS, QUEUE_NAMESPACE } from "~shared/constants";
import { CLIENT_EVENTS } from "~shared/constants/events";
import { FoundRoomPayload } from "~shared/types/api";
import { Difficulty, Language } from "~shared/types/base";

const TIMEOUT = 30;

export const QueuePage = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const difficulty = params.get("difficulty");
  const language = params.get("language");
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | undefined>(
    undefined,
  );
  const [timer, setTimer] = useState<number>(TIMEOUT);
  const [timerVariant, setTimerVariant] = useState<
    "determinate" | "indeterminate"
  >("determinate");

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (!difficulty || !language) {
      enqueueSnackbar("No difficulty level or language specified", {
        variant: "error",
      });
      navigate("/select");
      return;
    }

    const normalizedDifficulty = difficulty.toUpperCase();
    if (
      Object.values(Difficulty).filter(
        (value) => normalizedDifficulty === value,
      ).length === 0
    ) {
      enqueueSnackbar("Invalid difficulty level", {
        variant: "error",
      });
      navigate("/select");
    }

    const normalizedLanguage = language.toUpperCase();
    if (
      Object.values(Language).filter(
        (value) => normalizedLanguage === value.toUpperCase(),
      ).length === 0
    ) {
      enqueueSnackbar("Invalid language", {
        variant: "error",
      });
      navigate("/select");
    }
  }, [difficulty, language, navigate, enqueueSnackbar]);

  const { sockets, connect } = useSockets();
  const [queueSocket, setQueueSocket] = useState<Socket | undefined>(undefined);

  // We use a callback on the "connect" event to set a state here
  // so that we can be sure that we will have the socket ID.
  const [connected, setConnected] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("Loading...");

  useEffect(() => {
    connect(QUEUE_NAMESPACE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const socket = sockets.get(QUEUE_NAMESPACE);
    if (!socket) {
      return;
    }
    // Replace error handler
    socket.on(CLIENT_EVENTS.ERROR, (error: Error) => {
      enqueueSnackbar(error.message, { variant: "error" });
      navigate("/select");
    });
    setQueueSocket(socket);
  }, [enqueueSnackbar, navigate, sockets]);

  useEffect(() => {
    if (!queueSocket) {
      return;
    }
    queueSocket.on(QUEUE_EVENTS.CONNECT, () => {
      setMessage("Finding a match...");
      setConnected(true);
    });
    return () => {
      queueSocket.disconnect();
    };
  }, [queueSocket]);

  useEffect(() => {
    if (!queueSocket || !connected) {
      return;
    }
    queueSocket.emit(QUEUE_EVENTS.ENTER_QUEUE, { difficulty, language });
  }, [queueSocket, connected, difficulty, language]);

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
    if (!queueSocket || !connected) {
      return;
    }

    queueSocket.on(QUEUE_EVENTS.MATCH_FOUND, () => {
      setMessage("Match found. Preparing room...");
      setTimerVariant("indeterminate");
      clearTimeout(timeoutId);
    });

    queueSocket.on(QUEUE_EVENTS.ROOM_READY, (match: FoundRoomPayload) => {
      setMessage("Room ready. Joining...");
      clearTimeout(timeoutId);
      queueSocket.disconnect();
      setTimeout(() => navigate(`/room/${match.roomId}`), 1000);
    });

    queueSocket.on(QUEUE_EVENTS.EXISTING_MATCH, (roomId: string) => {
      setMessage("Existing match found. Rejoining...");
      clearTimeout(timeoutId);
      queueSocket.disconnect();
      setTimeout(() => navigate(`/room/${roomId}`), 1000);
    });

    return () => {
      queueSocket.off(QUEUE_EVENTS.ROOM_READY);
      queueSocket.off(QUEUE_EVENTS.MATCH_FOUND);
      queueSocket.off(QUEUE_EVENTS.EXISTING_MATCH);
    };
  }, [queueSocket, navigate, difficulty, connected, timeoutId]);

  return (
    <Stack
      spacing={12}
      sx={{
        height: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Stack
        spacing={4}
        sx={{
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
      <StyledButton
        label="Exit"
        color="error"
        disabled={timerVariant === "indeterminate"}
        onClick={() => navigate(-1)}
      />
    </Stack>
  );
};
