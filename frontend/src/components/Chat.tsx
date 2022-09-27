import { useState } from "react";
import { Button, Paper, Stack, TextField, Typography } from "@mui/material";

import { useChat } from "src/contexts/ChatContext";

// TODO: Style this component.
export const Chat = () => {
  const [input, setInput] = useState<string>("");
  // TODO: Integrate connection status into some place.
  const { messages, send, typing, isTyping } = useChat();
  return (
    <Paper sx={{ p: 3 }}>
      {messages ? (
        <Stack>
          <Stack>
            {messages.map((message) => (
              <Typography key={message.sid}>{`${
                (message.attributes as { name: string }).name
              }: ${message.body}`}</Typography>
            ))}
          </Stack>
          {isTyping.size > 0 &&
            `${Array.from(isTyping).join(", ")} is typing...`}
          <Stack direction="row">
            <TextField
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
            <Button onClick={() => send(input, () => setInput(""))}>
              Send
            </Button>
          </Stack>
        </Stack>
      ) : (
        <Typography>Connecting to chat...</Typography>
      )}
    </Paper>
  );
};
