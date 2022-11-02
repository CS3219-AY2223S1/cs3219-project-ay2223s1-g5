import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";

import { Center } from "src/components/Center";
import { StyledButton } from "src/components/StyledButton";
import { useLeaveRoom, useRoom } from "src/hooks/useRoom";

import { Difficulty, Language } from "~shared/types/base";

const languageToString = (language: Language) => {
  switch (language) {
    case Language.CPP: {
      return "C++";
    }
    case Language.PYTHON: {
      return "Python";
    }
    case Language.JAVASCRIPT: {
      return "JavaScript";
    }
    case Language.JAVA: {
      return "Java";
    }
  }
};

export const SelectionPage = () => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    Difficulty | undefined
  >(undefined);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | "">("");

  const { room, isRoomLoading } = useRoom();
  const { leaveRoom } = useLeaveRoom();
  const navigate = useNavigate();

  const handleDifficultyChange = (difficulty: Difficulty) => {
    setSelectedDifficulty(difficulty);
  };

  const handleLanguageChange = (language: Language) => {
    setSelectedLanguage(language);
  };

  return (
    <Center>
      {isRoomLoading ? (
        <CircularProgress />
      ) : room?.roomId ? (
        <Stack spacing={5}>
          <Typography
            sx={{ fontWeight: "bold", textAlign: "center" }}
            variant="h6"
          >
            You are already inside a room!
          </Typography>
          <Stack spacing={3}>
            <StyledButton
              label="Rejoin Room"
              onClick={() => navigate(`/room/${room.roomId}`)}
            />
            <StyledButton
              label="Leave Room"
              onClick={() => leaveRoom()}
              color="error"
            />
          </Stack>
        </Stack>
      ) : (
        <Stack spacing={10}>
          <Stack spacing={5}>
            <Typography
              sx={{ fontWeight: "bold", textAlign: "center" }}
              variant="h6"
            >
              Please select a difficulty
            </Typography>
            <Stack direction="row" spacing={3}>
              <StyledButton
                label="Easy"
                sx={{
                  color:
                    selectedDifficulty === Difficulty.EASY
                      ? "white"
                      : "green.600",
                  bgcolor:
                    selectedDifficulty === Difficulty.EASY
                      ? "green.600"
                      : "grey.50",
                  "&:hover": { color: "white", bgcolor: "green.600" },
                  width: 175,
                  height: 125,
                  fontSize: "1.5rem",
                  border: "solid",
                  borderWidth: "8px",
                  borderColor: "green.600",
                }}
                onClick={() => handleDifficultyChange(Difficulty.EASY)}
              />
              <StyledButton
                label="Medium"
                sx={{
                  color:
                    selectedDifficulty === Difficulty.MEDIUM
                      ? "white"
                      : "orange.800",
                  bgcolor:
                    selectedDifficulty === Difficulty.MEDIUM
                      ? "orange.800"
                      : "grey.50",
                  "&:hover": { color: "white", bgcolor: "orange.800" },
                  width: 175,
                  height: 125,
                  fontSize: "1.5rem",
                  border: "solid",
                  borderWidth: "8px",
                  borderColor: "orange.800",
                }}
                onClick={() => handleDifficultyChange(Difficulty.MEDIUM)}
              />
              <StyledButton
                label="Hard"
                sx={{
                  color:
                    selectedDifficulty === Difficulty.HARD
                      ? "white"
                      : "red.700",
                  bgcolor:
                    selectedDifficulty === Difficulty.HARD
                      ? "red.700"
                      : "grey.50",
                  "&:hover": { color: "white", bgcolor: "red.700" },
                  width: 175,
                  height: 125,
                  fontSize: "1.5rem",
                  border: "solid",
                  borderWidth: "8px",
                  borderColor: "red.700",
                }}
                onClick={() => handleDifficultyChange(Difficulty.HARD)}
              />
            </Stack>
          </Stack>
          <Stack spacing={5}>
            <Typography
              sx={{ fontWeight: "bold", textAlign: "center" }}
              variant="h6"
            >
              Please select a language
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Select a language</InputLabel>
              <Select
                value={selectedLanguage}
                label="Select a language"
                onChange={(event, _) =>
                  handleLanguageChange(event.target.value as Language)
                }
              >
                {Object.entries(Language).map((entry) => (
                  <MenuItem key={entry[0]} value={entry[1]}>
                    {languageToString(entry[1])}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
          <Container
            sx={{ width: "100%", display: "flex", justifyContent: "flex-end" }}
          >
            <StyledButton
              label="Match Me!"
              onClick={() =>
                navigate(
                  `/queue?difficulty=${selectedDifficulty}&language=${selectedLanguage}`,
                )
              }
              disabled={!selectedDifficulty || !selectedLanguage}
            />
          </Container>
        </Stack>
      )}
    </Center>
  );
};
