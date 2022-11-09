import { useCallback, useState } from "react";
import {
  Cancel,
  CheckCircle,
  Error,
  PendingOutlined,
  SvgIconComponent,
} from "@mui/icons-material";
import { Box, Typography } from "@mui/material";

import { DataTable } from "src/components/charts/DataTable";
import { useSubmissions } from "src/hooks/useSubmissions";
import { normaliseStatus } from "src/utils/string";

import { Center } from "../Center";
import { StyledButton } from "../StyledButton";

import { SubmissionDialog, SubmissionDialogContent } from "./SubmissionDialog";

import { Status } from "~shared/types/base";

const HEADERS = ["ID", "STATUS", "DETAILS"];

export type SubmissionsPanelProps = {
  roomId?: string;
};

export const Submissions = ({ roomId }: SubmissionsPanelProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [submission, setSubmission] = useState<
    SubmissionDialogContent | undefined
  >(undefined);
  const { submissions } = useSubmissions(roomId);

  const onClose = useCallback(() => {
    setIsOpen(false);
    setSubmission(undefined);
  }, [setIsOpen]);

  return (
    <Box sx={{ height: "100%", overflowY: "auto" }}>
      {submission && (
        <SubmissionDialog {...submission} isOpen={isOpen} onClose={onClose} />
      )}
      <DataTable
        headers={HEADERS}
        rows={(submissions || []).map((submission, index) => {
          const color =
            submission.status === Status.ACCEPTED
              ? "green.500"
              : submission.status === Status.PENDING
              ? undefined
              : "red.500";
          const status = normaliseStatus(submission.status);
          const Symbol: SvgIconComponent =
            submission.status === Status.ACCEPTED
              ? CheckCircle
              : submission.status === Status.PENDING
              ? PendingOutlined
              : submission.status === Status.INTERNAL_ERROR
              ? Error
              : Cancel;

          return [
            `${(submissions?.length || 0) - index}`,
            {
              sx: { color },
              child: (
                <Center>
                  <>
                    <Symbol sx={{ mr: 0.5 }} />
                    <Typography>{status}</Typography>
                  </>
                </Center>
              ),
            },
            {
              child: (
                <Center>
                  <StyledButton
                    disabled={submission.status === Status.PENDING}
                    onClick={() => {
                      setSubmission({
                        submitTime: new Date(submission.submitTime),
                        status: submission.status,
                        inputs: submission.inputs,
                        output: submission.expectedOutput,
                        runTime: submission.runTime || 0,
                        memoryUsage: submission.memoryUsage || 0,
                        code: submission.code,
                        standardOutput: submission.standardOutput,
                        errorOutput: submission.errorOutput,
                        compilationError: submission.compileOutput,
                      });
                      setIsOpen(true);
                    }}
                    label="View"
                  />
                </Center>
              ),
            },
          ];
        })}
      />
    </Box>
  );
};
