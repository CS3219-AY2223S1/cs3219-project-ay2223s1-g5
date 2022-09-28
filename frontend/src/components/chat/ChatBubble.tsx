import { forwardRef } from "react";
import { Box, Stack, Typography } from "@mui/material";

type ChatBubbleProps = {
  author: string;
  content: string;
  color: "primary" | "secondary";
  align: "flex-start" | "flex-end";
};

// eslint-disable-next-line react/display-name
export const ChatBubble = forwardRef<HTMLDivElement, ChatBubbleProps>(
  ({ author, content, color, align }: ChatBubbleProps, ref) => {
    return (
      <Box
        sx={{
          p: 1,
          bgcolor: `${color}.200`,
          borderRadius: "10px",
          maxWidth: "70%",
          alignSelf: align,
        }}
        ref={ref}
      >
        <Stack>
          <Typography fontWeight="bold" fontSize="0.8rem">
            {author}
          </Typography>
          <Typography fontSize="0.8rem">{content}</Typography>
        </Stack>
      </Box>
    );
  },
);
