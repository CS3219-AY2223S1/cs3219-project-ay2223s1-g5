import { Cancel, CheckCircle } from "@mui/icons-material";

import { DataTable } from "src/components/charts/DataTable";
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
    <DataTable
      headers={tableHeaders}
      rows={submissions.map((submission) => {
        return [
          `${submission.submitTime}`,
          `${submission.timeTaken}`,
          `${submission.inputs}, ${submission.expectedOutput}`,
          submission.result === "Pass"
            ? {
                sx: {
                  color: "green.500",
                  fontWeight: "bold",
                },
                child: (
                  <Center>
                    <CheckCircle sx={{ mr: 0.5 }} /> Pass
                  </Center>
                ),
              }
            : {
                sx: { color: "red.500", fontWeight: "bold" },
                child: (
                  <Center>
                    <Cancel sx={{ mr: 0.5 }} /> ${submission.result}
                  </Center>
                ),
              },
        ];
      })}
    />
  );
};
