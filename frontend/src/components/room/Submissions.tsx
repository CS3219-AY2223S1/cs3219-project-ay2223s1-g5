import { Cancel, CheckCircle } from "@mui/icons-material";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import { useGetSubmissions } from "src/hooks/useSubmissions";

import { Center } from "../Center";

/* Tabular Data */
const tableHeaders = ["DATE", "RUNTIME", "TEST CASE", "STATUS"];

export type SubmissionsPanelProps = {
  roomId?: string;
};

export const Submissions = ({ roomId }: SubmissionsPanelProps) => {
  const submissions = useGetSubmissions(roomId).submissions || [];

  return (
    <TableContainer sx={{ flex: 1 }} component={Paper}>
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
          {submissions.map((submission, idx) => {
            return (
              <TableRow key={idx}>
                <TableCell
                  key={submission.submitTime.toString()}
                  align="center"
                >
                  <Center>
                    {submission.submitTime.toLocaleString("en-US")}
                  </Center>
                </TableCell>
                <TableCell key={submission.timeTaken} align="center">
                  <Center>{submission.timeTaken}</Center>
                </TableCell>
                <TableCell key={submission.output} align="center">
                  <Center>
                    {submission.inputs}, {submission.expectedOutput}
                  </Center>
                </TableCell>
                <TableCell
                  key={submission.result}
                  align="center"
                  sx={{
                    color:
                      submission.result === "Pass" ? "green.500" : "red.500",
                    fontWeight: "bold",
                  }}
                >
                  <Center>
                    {submission.result === "Pass" ? (
                      <CheckCircle sx={{ mr: 0.5 }} />
                    ) : (
                      <Cancel sx={{ mr: 0.5 }} />
                    )}
                    {submission.result}
                  </Center>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
