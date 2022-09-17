import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Stack, Typography } from "@mui/material";

import { DifficultyLevel } from "~shared/types/base";

export const DifficultySelectionPage = () => {
  const navigate = useNavigate();
  const [difficultyLevel, setDifficultyLevel] = useState("");
  const handleChangeDifficulty = (difficultyLevel: DifficultyLevel) => {
    setDifficultyLevel(difficultyLevel);
  };

  return (
    <Box>
      <Stack>
        <Typography>Select Difficulty</Typography>

        <Button
          onClick={() => {
            handleChangeDifficulty(DifficultyLevel.EASY);
            navigate("/waiting-page");
          }}
        >
          Easy
        </Button>

        <Button
          onClick={() => {
            handleChangeDifficulty(DifficultyLevel.MEDIUM);
            navigate("/waiting-page");
          }}
        >
          Medium
        </Button>

        <Button
          onClick={() => {
            handleChangeDifficulty(DifficultyLevel.HARD);
            navigate("/waiting-page");
          }}
        >
          Hard
        </Button>
      </Stack>
    </Box>
  );
  // return <div>Difficulty Selection Page</div>;
};
