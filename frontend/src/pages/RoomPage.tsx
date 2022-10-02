import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Cancel,
  CheckCircle,
  DriveFolderUpload,
  Wysiwyg,
} from "@mui/icons-material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import {
  Avatar,
  Box,
  Divider,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useSnackbar } from "notistack";

import { Center } from "src/components/Center";
import { Chat } from "src/components/chat/Chat";
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
  const [formType, setFormType] = useState<"description" | "submission">(
    "description",
  );

  const handleChange = (
    _: React.SyntheticEvent | undefined,
    formType: "description" | "submission",
  ) => {
    setFormType(formType);
  };

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

  /* Tabular Data */
  const tableHeaders = ["DATE", "RUNTIME", "TEST CASE", "STATUS"];
  const tableCells = ["2020-04-26 00:26:55", "0.13s", "[2,7,11,15], 9", "Fail"];
  enum Status {
    PASS = "Pass",
    COMPILATION_ERROR = "Compilation Error",
    FAIL = "Fail",
    TIME_LIMIT_EXCEED = "Time Limit Exceed",
  }

  return (
    <Stack
      sx={{
        borderTop: "10px solid",
        borderColor: "primary.500",
        height: "100vh",
        maxWidth: "100vw",
        display: "flex",
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        sx={{ py: 2, px: 3 }}
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
      </Stack>
      <Divider />
      <TabContext value={formType}>
        <TabList
          centered
          onChange={handleChange}
          sx={{
            "& .MuiTabs-indicator": {
              height: "0px",
            },
          }}
        >
          <Tab
            label="Description"
            value="description"
            sx={{
              fontWeight: "bold",
              fontSize: "1.2rem",
              textTransform: "none",
            }}
            icon={<Wysiwyg />}
            iconPosition="start"
          />
          <Tab
            label="Submission"
            value="submission"
            sx={{
              fontWeight: "bold",
              fontSize: "1.2rem",
              textTransform: "none",
            }}
            icon={<DriveFolderUpload />}
            iconPosition="start"
          />
        </TabList>
        <TabPanel sx={{ p: 0 }} value="description">
          <Stack
            direction="row"
            spacing={2}
            sx={{ width: "100%", flex: 1, minHeight: 0, p: 3 }}
          >
            <Stack spacing={2} sx={{ minWidth: "40%", maxWidth: "40%" }}>
              <Box sx={{ flex: 1, minHeight: 0 }}>
                <Question />
              </Box>
              <ChatProvider roomId={roomId || ""}>
                <Box sx={{ height: "40%" }}>
                  <Chat />
                </Box>
              </ChatProvider>
            </Stack>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <EditorProvider roomId={roomId || ""}>
                <Editor language={"javascript"} />
              </EditorProvider>
            </Box>
          </Stack>
          <Stack
            direction="row"
            justifyContent="flex-end"
            sx={{ py: 2, px: 3 }}
          >
            <StyledButton
              label={"Submit Code"}
              sx={{ "&:hover": { boxShadow: "1" } }}
            />
          </Stack>
        </TabPanel>
        <TabPanel sx={{ p: 0 }} value="submission">
          <Stack
            direction="row"
            spacing={2}
            sx={{ width: "100%", flex: 1, minHeight: 0, p: 3 }}
          >
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: "100%" }}>
                <TableHead sx={{ bgcolor: "primary.500" }}>
                  <TableRow>
                    {tableHeaders.map((tableHeader) => (
                      <TableCell
                        key={tableHeader}
                        align="center"
                        sx={{
                          fontWeight: "bold",
                          color: "white",
                        }}
                      >
                        {tableHeader}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    {tableCells.map((tableCell) => (
                      <TableCell
                        key={tableCell}
                        align="center"
                        sx={{
                          color:
                            Object.values<string>(Status).includes(tableCell) &&
                            tableCell === "Pass"
                              ? "green.500"
                              : Object.values<string>(Status).includes(
                                  tableCell,
                                )
                              ? "red.500"
                              : "black",
                          fontWeight: Object.values<string>(Status).includes(
                            tableCell,
                          )
                            ? "bold"
                            : "normal",
                        }}
                      >
                        <Center>
                          {Object.values<string>(Status).includes(tableCell) &&
                          tableCell === "Pass" ? (
                            <CheckCircle sx={{ mr: 0.5 }} />
                          ) : Object.values<string>(Status).includes(
                              tableCell,
                            ) ? (
                            <Cancel sx={{ mr: 0.5 }} />
                          ) : null}
                          {tableCell}
                        </Center>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </TabPanel>
      </TabContext>
    </Stack>
  );
};
