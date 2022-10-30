import { useEffect, useState } from "react";
import { DriveFolderUpload, Wysiwyg } from "@mui/icons-material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Badge, Paper, Stack, Tab } from "@mui/material";

import { Question } from "./Question";
import { Submissions } from "./Submissions";

type QuestionSubmissionPanelProps = {
  questionId?: number;
  roomId?: string;
  hasNewSubmissions: boolean;
  clearHasNewSubmissions: () => void;
};

export const QuestionSubmissionPanel = ({
  questionId,
  roomId,
  hasNewSubmissions,
  clearHasNewSubmissions,
}: QuestionSubmissionPanelProps) => {
  const [selectedPanel, setSelectedPanel] = useState<
    "description" | "submissions"
  >("description");

  useEffect(() => {
    if (hasNewSubmissions && selectedPanel === "submissions") {
      clearHasNewSubmissions();
    }
  }, [clearHasNewSubmissions, hasNewSubmissions, selectedPanel]);

  const handleChange = (
    _: React.SyntheticEvent | undefined,
    panel: "description" | "submissions",
  ) => {
    setSelectedPanel(panel);
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
              icon={
                <Badge
                  variant="dot"
                  color="secondary"
                  anchorOrigin={{ vertical: "top", horizontal: "left" }}
                  invisible={!hasNewSubmissions}
                >
                  <DriveFolderUpload />
                </Badge>
              }
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
            <Question questionId={questionId} />
          </TabPanel>
          <TabPanel
            sx={{
              p: 0,
              minHeight: 0,
              flex: 1,
              overflow: "hidden",
            }}
            value="submissions"
          >
            <Submissions roomId={roomId} />
          </TabPanel>
        </TabContext>
      </Stack>
    </Paper>
  );
};
