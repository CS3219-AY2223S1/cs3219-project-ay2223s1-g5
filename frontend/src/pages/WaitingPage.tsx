import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CircularProgress, Typography } from "@mui/material";
import { Stack } from "@mui/system";

import { useSocket } from "src/contexts/WsContext";
import { useGetUsername } from "src/hooks/useUsers";

import { Match } from "~shared/types/api/match.dto";

export const WaitingPage = () => {
  const navigate = useNavigate();
  const { socket, connect } = useSocket();
  const { getUsername } = useGetUsername();

  // We use a callback on the "connect" event to set a state here
  // so that we can be sure that we will have the socket ID.
  const [connected, setConnected] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("Loading...");

  useEffect(() => {
    connect("match");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!socket) {
      return;
    }
    socket.on("connect", () => {
      setConnected(true);
    });
    return () => {
      socket.disconnect();
    };
  }, [socket]);

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

    socket.on("found", async (match: Match) => {
      const username1 = await getUsername(match.result[0].userId);
      const username2 = await getUsername(match.result[1].userId);
      setMessage(
        `Found a match between ${username1} and ${username2}!
        Room ID: ${match.roomId}
        Loading...`,
      );
      clearTimeout(timeout);
      // TODO: Handle found match.
    });

    // TODO: Update after difficulty selector is implemented
    socket.emit("find", "DummyDifficultyLevel");
    return () => {
      socket.off("found");
    };
  }, [connected, getUsername, navigate, socket]);

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
      <Typography>
        {message.split("\n").map((value, key) => {
          return <div key={key}>{value}</div>;
        })}
      </Typography>
    </Stack>
  );
};
