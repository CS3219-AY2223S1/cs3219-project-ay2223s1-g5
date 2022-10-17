import { useEffect, useRef, useState } from "react";
import { SendOutlined } from "@mui/icons-material";
import { IconButton, Paper, Stack, TextField, Typography } from "@mui/material";

import { Center } from "src/components/Center";
import { ChatBubble } from "src/components/room/chat/ChatBubble";
import { useChat } from "src/contexts/ChatContext";

export const Chat = () => {
  const [input, setInput] = useState<string>("");
  const { identity: self, messages, send, typing, isTyping } = useChat();

  const latestMessage = useRef<HTMLDivElement | null>(null);

  // Automatically scroll to newest message.
  useEffect(() => {
    latestMessage.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Paper elevation={1} sx={{ py: 3, px: 2, height: "100%" }}>
      {messages ? (
        <Stack spacing={1} sx={{ height: "100%" }}>
          <Stack
            spacing={1}
            sx={{ px: 1, flex: 1, overflowX: "hidden", overflowY: "scroll" }}
          >
            {messages
              .filter((message) => !!message.body)
              .map((message, index) => (
                <ChatBubble
                  ref={
                    index === messages.length - 1 ? latestMessage : undefined
                  }
                  key={message.sid}
                  content={message.body || ""}
                  color={message.author === self ? "primary" : "secondary"}
                  author={(message.attributes as { name: string }).name}
                  align={message.author === self ? "flex-end" : "flex-start"}
                />
              ))}
          </Stack>
          <Typography fontSize="0.8rem" sx={{ px: 1 }}>
            {
              isTyping.size > 0
                ? `${Array.from(isTyping).join(", ")} ${
                    isTyping.size > 1 ? "are" : "is"
                  } typing...`
                : "\u00A0" // Nonbreaking space for consistent spacing
            }
          </Typography>
          <Stack direction="row" spacing={1} sx={{ pl: 1 }}>
            <TextField
              hiddenLabel
              value={input}
              size="small"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  send(input, () => setInput(""));
                  return;
                }
                typing();
              }}
              sx={{ flex: 1 }}
            />
            <IconButton
              onClick={() => send(input, () => setInput(""))}
              sx={{ color: "primary.500" }}
            >
              <SendOutlined />
            </IconButton>
          </Stack>
        </Stack>
      ) : (
        <Center>
          <Typography>Connecting to chat...</Typography>
        </Center>
      )}
    </Paper>
  );
};
