import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Grid, Stack, Typography } from "@mui/material";

import { Center } from "../components/Center";
import { StyledButton } from "../components/StyledButton";

import { DifficultyLevel } from "~shared/types/base";

export const DifficultySelectionPage = () => {
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<DifficultyLevel | null>(null);

  const navigate = useNavigate();

  const handleChange = (selectedDifficulty: DifficultyLevel) => {
    setSelectedDifficulty(selectedDifficulty);
  };

  return (
    <Center>
      <Stack spacing={10}>
        <Typography
          sx={{ fontWeight: "bold", textAlign: "center" }}
          variant="h6"
        >
          Please select difficulty
        </Typography>
        <Stack direction="row" spacing={3}>
          <StyledButton
            label="Easy"
            sx={{
              bgcolor:
                selectedDifficulty === DifficultyLevel.EASY
                  ? "green.800"
                  : "green.500",
              "&:hover": { bgcolor: "green.800" },
              p: 8,
              fontSize: "20px",
            }}
            onClick={() => handleChange(DifficultyLevel.EASY)}
          />
          <StyledButton
            label="Medium"
            sx={{
              bgcolor:
                selectedDifficulty === DifficultyLevel.MEDIUM
                  ? "yellow.800"
                  : "yellow.700",
              "&:hover": { bgcolor: "yellow.800" },
              py: 8,
              px: 6,
              fontSize: "20px",
            }}
            onClick={() => handleChange(DifficultyLevel.MEDIUM)}
          />
          <StyledButton
            label="Hard"
            sx={{
              bgcolor:
                selectedDifficulty === DifficultyLevel.HARD
                  ? "red.800"
                  : "red.500",
              "&:hover": { bgcolor: "red.800" },
              p: 8,
              fontSize: "20px",
            }}
            onClick={() => handleChange(DifficultyLevel.HARD)}
          />
        </Stack>
        <Grid container sx={{ justifyContent: "flex-end" }}>
          <StyledButton
            label="Match Me!"
            onClick={() => navigate("/matching")}
            disabled={selectedDifficulty === null}
          />
        </Grid>
      </Stack>
    </Center>
  );
};
