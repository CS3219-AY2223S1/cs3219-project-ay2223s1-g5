import { useState } from "react";
import { CheckCircle, DriveFolderUpload, Wysiwyg } from "@mui/icons-material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Paper, Stack, Tab } from "@mui/material";

import { Center } from "src/components/Center";
import { DataTable } from "src/components/charts/DataTable";
import { Question, QuestionPanelProps } from "src/components/room/Question";

type QuestionSubmissionPanelProps = QuestionPanelProps;

export const QuestionSubmissionPanel = (
  props: QuestionSubmissionPanelProps,
) => {
  const [selectedPanel, setSelectedPanel] = useState<
    "description" | "submissions"
  >("description");

  const handleChange = (
    _: React.SyntheticEvent | undefined,
    formType: "description" | "submissions",
  ) => {
    setSelectedPanel(formType);
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
              label="Description"
              value="description"
              sx={{
                fontWeight: "bold",
                textTransform: "none",
              }}
              icon={<Wysiwyg />}
              iconPosition="start"
            />
            <Tab
              label="Submissions"
              value="submissions"
              sx={{
                fontWeight: "bold",
                textTransform: "none",
              }}
              icon={<DriveFolderUpload />}
              iconPosition="start"
            />
          </TabList>
          <TabPanel
            sx={{
              p: 0,
              minHeight: 0,
              flex: 1,
              overflow: "hidden",
            }}
            value="description"
          >
            <Question {...props} />
          </TabPanel>
          <TabPanel
            sx={{ p: 0, "&.MuiTabPanel-root": { mt: 0 } }}
            value="submissions"
          >
            <DataTable
              headers={["DATE", "RUNTIME", "TEST CASE", "STATUS"]}
              rows={[
                [
                  "2020-04-26 00:26:55",
                  "0.13s",
                  "[2,7,11,15], 9",
                  {
                    sx: { color: "green.500", fontWeight: "bold" },
                    child: (
                      <Center>
                        <CheckCircle sx={{ mr: 0.5 }} /> Pass
                      </Center>
                    ),
                  },
                ],
              ]}
            />
          </TabPanel>
        </TabContext>
      </Stack>
    </Paper>
  );
};
