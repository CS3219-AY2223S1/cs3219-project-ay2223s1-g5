import { memo, useEffect, useState } from "react";
import { ChatBubbleOutline, VideoCallOutlined } from "@mui/icons-material";
import { TabContext, TabList } from "@mui/lab";
import { Badge, Box, Paper, Stack, Tab } from "@mui/material";

import { Chat } from "src/components/room/chat/Chat";
import { VideoChat } from "src/components/room/chat/VideoChat";
import { useChat } from "src/contexts/ChatContext";

// eslint-disable-next-line react/display-name
export const ChatPanel = memo(
  (props: { name?: string; partnerName?: string }) => {
    const { hasNewMessages, clearHasNewMessages } = useChat();
    const [selectedPanel, setSelectedPanel] = useState<"chat" | "video">(
      "chat",
    );

    const handleChange = (_: unknown, panel: "chat" | "video") => {
      setSelectedPanel(panel);
    };

    useEffect(() => {
      if (selectedPanel === "chat") {
        clearHasNewMessages();
      }
    }, [clearHasNewMessages, hasNewMessages, selectedPanel]);

    return (
      <Paper elevation={1} sx={{ pb: 3, px: 2, height: "100%" }}>
        <Stack spacing={1} sx={{ p: 0, height: "100%" }}>
          <TabContext value={selectedPanel}>
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
                label="Chat"
                value="chat"
                sx={{
                  fontWeight: "bold",
                  textTransform: "none",
                }}
                icon={
                  <Badge
                    variant="dot"
                    color="secondary"
                    anchorOrigin={{ vertical: "top", horizontal: "left" }}
                    invisible={!hasNewMessages}
                  >
                    <ChatBubbleOutline />
                  </Badge>
                }
                iconPosition="start"
              />
              <Tab
                label="Video"
                value="video"
                sx={{
                  fontWeight: "bold",
                  textTransform: "none",
                }}
                icon={<VideoCallOutlined />}
                iconPosition="start"
              />
            </TabList>
            <Box
              hidden={selectedPanel !== "chat"}
              sx={{
                flex: 1,
                overflow: "hidden",
              }}
            >
              <Chat />
            </Box>
            {/* Keep video chat mounted so that audio plays in the background.*/}
            <Box
              hidden={selectedPanel !== "video"}
              sx={{ p: 0, flex: 1, height: "100%" }}
            >
              <VideoChat {...props} />
            </Box>
          </TabContext>
        </Stack>
      </Paper>
    );
  },
);
