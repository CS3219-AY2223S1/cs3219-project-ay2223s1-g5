import { ExpandMore } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import DOMPurify from "dompurify";
import parse from "html-react-parser";

import { useGetQuestion } from "src/hooks/useQuestion";

import { Center } from "../Center";

export type QuestionPanelProps = {
  questionId?: number;
};

export const Question = (props: QuestionPanelProps) => {
  const { question } = useGetQuestion(props.questionId);

  return question ? (
    <Stack
      direction="column"
      spacing={2}
      sx={{
        px: 1, // Padding between scrollbar and content.
        flex: 1,
        height: "100%",
        minHeight: 0,
        overflowX: "hidden",
        overflowY: "auto",
      }}
    >
      <Typography variant="h5" sx={{ textAlign: "center" }}>
        {question.title}
      </Typography>
      <Divider />
      <Container
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        {question.topics.map((topic) => (
          <Chip key={topic} label={topic} />
        ))}
      </Container>
      <Typography
        component={"span"}
        variant="body2"
        sx={{ textAlign: "justify" }}
      >
        {parse(DOMPurify.sanitize(question.description))}
      </Typography>
      <Stack direction="column">
        {question.hints.map((hint, number) => (
          <Accordion
            key={number}
            sx={{
              boxShadow: "none",
              "& .MuiAccordionSummary-root": { p: 0 },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography>Hint {number + 1}</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <Typography component={"span"} variant="body2">
                {parse(DOMPurify.sanitize(hint))}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Stack>
    </Stack>
  ) : (
    <Center>
      <CircularProgress />
    </Center>
  );
};
