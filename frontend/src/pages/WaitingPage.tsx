import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CircularProgress, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { useSnackbar } from "notistack";

import { useSocket } from "src/contexts/WsContext";
import { useGetUserName } from "src/hooks/useUsers";

import { MATCH_EVENTS, MATCH_NAMESPACE } from "~shared/constants";
import { MatchRes } from "~shared/types/api";
import { DifficultyLevel } from "~shared/types/base";

export const WaitingPage = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const difficulty = params.get("difficulty");

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (!difficulty) {
      enqueueSnackbar("No difficulty level specified", {
        variant: "error",
        key: "missing-difficulty",
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
        key: "invalid-difficulty",
      });
      navigate("/select-difficulty");
    }
  }, [difficulty, navigate, enqueueSnackbar]);

  const { socket, connect } = useSocket();
  const [userOne, setUserOne] = useState<number | undefined>(undefined);
  const [userTwo, setUserTwo] = useState<number | undefined>(undefined);
  const [roomId, setRoomId] = useState<string | undefined>(undefined);
  const [pageTimeout, setPageTimeout] = useState<number | undefined>(undefined);
  const { user: userNameOne } = useGetUserName(userOne);
  const { user: userNameTwo } = useGetUserName(userTwo);

  // We use a callback on the "connect" event to set a state here
  // so that we can be sure that we will have the socket ID.
  const [connected, setConnected] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("Loading...");

  useEffect(() => {
    if (roomId && userNameOne && userNameTwo) {
      setMessage(
        `Found a match between ${userNameOne.name} and ${userNameTwo.name}!
        Room ID: ${roomId}
        Navigating to room...`,
      );
    }
  }, [roomId, userNameOne, userNameTwo]);

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
    if (!socket || !pageTimeout || !connected) {
      return;
    }

    socket.on(MATCH_EVENTS.MATCH_FOUND, (match: MatchRes) => {
      setUserOne(match.result[0].userId);
      setUserTwo(match.result[1].userId);
      setRoomId(match.roomId);
      clearTimeout(pageTimeout);
      setTimeout(() => navigate(`/room/${match.roomId}`), 1000);
    });

    socket.on(MATCH_EVENTS.EXISTING_MATCH, (roomId: string) => {
      setMessage("Exsiting match found. Joining back...");
      clearTimeout(pageTimeout);
      setTimeout(() => navigate(`/room/${roomId}`), 1000);
    });

    socket.emit(MATCH_EVENTS.ENTER_QUEUE, difficulty?.toUpperCase());

    return () => {
      socket.off(MATCH_EVENTS.MATCH_FOUND);
    };
  }, [socket, pageTimeout, navigate, difficulty, connected]);

  useEffect(() => {
    // FIXME: If the socket disconnects from a connected state,
    // we should fail the search and return the user to the dashboard.
    if (!connected || !socket) {
      return;
    }
    setMessage("Finding a match...");

    const timeout = setTimeout(() => {
      setMessage("Unable to find a match. Returning to dashboard.");
      // TODO: Stop the loading spinner or change its color.
      // We give the user some time to read the message.
      setTimeout(() => navigate("/dashboard"), 3000);
    }, 30000);
    setPageTimeout(timeout);
  }, [connected, navigate, socket]);

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
      <Typography component={"span"}>
        {message.split("\n").map((value, key) => {
          return <div key={key}>{value}</div>;
        })}
      </Typography>
    </Stack>
  );
};
