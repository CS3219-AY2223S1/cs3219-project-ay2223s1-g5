import { useState } from "react";
import { ChatBubbleOutline, VideoCallOutlined } from "@mui/icons-material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Paper, Stack, Tab } from "@mui/material";

import { Chat } from "./Chat";
import { VideoChat } from "./VideoChat";

export const ChatPanel = () => {
  const [selectedPanel, setSelectedPanel] = useState<"chat" | "video">("chat");

  const handleChange = (_: unknown, panel: "chat" | "video") => {
    setSelectedPanel(panel);
  };

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
              icon={<ChatBubbleOutline />}
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
          <Box hidden={selectedPanel !== "chat"} sx={{ height: "100%" }}>
            <Chat />
          </Box>
          {/* Keep video chat mounted so that audio plays in the background.*/}
          <Box hidden={selectedPanel !== "video"} sx={{ height: "100%" }}>
            <VideoChat />
          </Box>
        </TabContext>
      </Stack>
    </Paper>
  );
};
