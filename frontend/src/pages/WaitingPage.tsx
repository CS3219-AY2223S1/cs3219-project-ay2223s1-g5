import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CircularProgress, Typography } from "@mui/material";
import { Stack } from "@mui/system";

import { useSocket } from "src/contexts/WsContext";
import { useGetUserName } from "src/hooks/useUsers";

import { MATCH_EVENTS, MATCH_NAMESPACE } from "~shared/constants";
import { MatchRes } from "~shared/types/api";

export const WaitingPage = () => {
  const navigate = useNavigate();
  const { socket, connect } = useSocket();
  const [userOne, setUserOne] = useState<number | undefined>(undefined);
  const [userTwo, setUserTwo] = useState<number | undefined>(undefined);
  const [roomId, setRoomId] = useState<string | undefined>(undefined);
  const { user: userNameOne } = useGetUserName(userOne);
  const { user: userNameTwo } = useGetUserName(userTwo);

  // We use a callback on the "connect" event to set a state here
  // so that we can be sure that we will have the socket ID.
  const [connected, setConnected] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("Loading...");

  // For identifying the type of disconnection
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLeaveRoom, setIsLeaveRoom] = useState<boolean>(false);

  useEffect(() => {
    if (roomId && userNameOne && userNameTwo) {
      setMessage(
        `Found a match between ${userNameOne.name} and ${userNameTwo.name}!
        Room ID: ${roomId}
        Loading...`,
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

    socket.on(MATCH_EVENTS.MATCH_FOUND, (match: MatchRes) => {
      setUserOne(match.result[0].userId);
      setUserTwo(match.result[1].userId);
      setRoomId(match.roomId);
      setMessage("Match found. Loading information...");
      clearTimeout(timeout);
      // TODO: Handle found match.
    });

    socket.on("endMatch", () => {
      setMessage("The other user has left the room. Ending match...");
      setTimeout(() => navigate("/dashboard"), 3000);
    });

    socket.on("disconnect", () => {
      // User has not been matched yet.
      if (!roomId) {
        // TODO: Update after difficulty selector is implemented
        socket.emit("disconnectWithoutMatch", "DummyDifficultyLevel");
        return;
      }

      if (isLeaveRoom) {
        socket.emit("leaveRoom");
      } else {
        socket.emit("endMatch");
      }
    });

    socket.on("userEndMatch", () => {
      setMessage(
        "The other user has disconnected. Waiting for reconnection...",
      );
      // TODO: Wait for reconnection
    });

    socket.on("userLeaveRoom", () => {
      setMessage("The other user has left the room");
    });

    // TODO: Update after difficulty selector is implemented
    socket.emit(MATCH_EVENTS.ENTER_QUEUE, "DummyDifficultyLevel");
    return () => {
      socket.off(MATCH_EVENTS.MATCH_FOUND);
    };
  }, [connected, isLeaveRoom, navigate, roomId, socket]);

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
