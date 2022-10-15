import { useState } from "react";
import { DriveFolderUpload, Wysiwyg } from "@mui/icons-material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Paper, Stack, Tab } from "@mui/material";

import { Question } from "./Question";
import { Submissions } from "./Submissions";

type QuestionSubmissionPanelProps = {
  questionId?: number;
  roomId?: string;
  updateSubmissions?: boolean;
};

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
            <Question questionId={props.questionId} />
          </TabPanel>
          <TabPanel
            sx={{ p: 0, "&.MuiTabPanel-root": { mt: 0 } }}
            value="submissions"
          >
            <Submissions
              roomId={props.roomId}
              signal={props.updateSubmissions}
            />
          </TabPanel>
        </TabContext>
      </Stack>
    </Paper>
  );
};
