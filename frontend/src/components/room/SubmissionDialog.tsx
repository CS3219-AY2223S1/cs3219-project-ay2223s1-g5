import { Close, ExpandMore } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";

import { formatDate, normaliseStatus } from "src/utils/string";

import { Status } from "~shared/types/base";

export type SubmissionDialogContent = {
  submitTime: Date;
  status: Status;
  code: string;
  inputs: string[];
  output: string;
  runTime?: number;
  memoryUsage?: number;
  standardOutput?: string;
  compilationError?: string;
};

export const SubmissionDialog = (
  props: SubmissionDialogContent & { isOpen: boolean; onClose: () => void },
) => {
  return (
    <Dialog open={props.isOpen} scroll="paper" onClose={props.onClose}>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        Submission Details
        <IconButton onClick={props.onClose}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={1}>
          <Typography>
            Submission Time: {formatDate(props.submitTime)}
          </Typography>
          <Typography>Status: {normaliseStatus(props.status)}</Typography>
          <Typography>
            Inputs: <code>{props.inputs.join(", ")}</code>
          </Typography>
          <Typography>
            Expected Output: <code>{props.output}</code>
          </Typography>
          <Typography>Run Time: {props.runTime || NaN} ms</Typography>
          <Typography>
            Memory Usage: {props.memoryUsage || NaN} bytes
          </Typography>
          <Typography>
            Standard Output: {props.standardOutput || "N/A"}
          </Typography>
          <Typography>
            Compilation Message: {props.compilationError || "N/A"}
          </Typography>

          <Accordion
            sx={{
              boxShadow: "none",
              "& .MuiAccordionSummary-root": { p: 0 },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography>Code</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <pre>{props.code}</pre>
            </AccordionDetails>
          </Accordion>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};
