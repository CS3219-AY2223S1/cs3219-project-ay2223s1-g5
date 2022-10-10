import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";

import { useAuth } from "src/contexts/AuthContext";
import {
  useCheckUserHasRoom,
  useJoinRoom,
  useLeaveRoom,
} from "src/hooks/useRoom";

import { Center } from "../components/Center";
import { StyledButton } from "../components/StyledButton";

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

export const DifficultySelectionPage = () => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    Difficulty | undefined
  >(undefined);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | "">("");

  const navigate = useNavigate();

  const handleDifficultyChange = (difficulty: Difficulty) => {
    setSelectedDifficulty(difficulty);
  };

  const handleLanguageChange = (language: Language) => {
    setSelectedLanguage(language);
  };

  const { user } = useAuth();
  const userId = user ? user.userId : 0;

  const userHasExistingRoom: boolean =
    useCheckUserHasRoom(userId).isUseCheckUserHasRoomLoading.valueOf();

  const { useJoinRoomMutation } = useJoinRoom(userId);
  const { useLeaveRoomMutation } = useLeaveRoom(userId);

  if (userHasExistingRoom) {
    return (
      <Center>
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
              // TODO
              // onClick={() => useJoinRoomMutation({ userId })}
            />
            <StyledButton
              label="Leave Room"
              // onClick={() =>
              //   navigate(
              //     `/room/${userId}/leave`,
              //   )
              // }
            />
          </Stack>
        </Stack>
      </Center>
    );
  }
  return (
    <Center>
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
                bgcolor:
                  selectedDifficulty === Difficulty.EASY
                    ? "green.800"
                    : "green.500",
                "&:hover": { bgcolor: "green.800" },
                p: 8,
                fontSize: "20px",
              }}
              onClick={() => handleDifficultyChange(Difficulty.EASY)}
            />
            <StyledButton
              label="Medium"
              sx={{
                bgcolor:
                  selectedDifficulty === Difficulty.MEDIUM
                    ? "yellow.800"
                    : "yellow.700",
                "&:hover": { bgcolor: "yellow.800" },
                py: 8,
                px: 6,
                fontSize: "20px",
              }}
              onClick={() => handleDifficultyChange(Difficulty.MEDIUM)}
            />
            <StyledButton
              label="Hard"
              sx={{
                bgcolor:
                  selectedDifficulty === Difficulty.HARD
                    ? "red.800"
                    : "red.500",
                "&:hover": { bgcolor: "red.800" },
                p: 8,
                fontSize: "20px",
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
                <MenuItem key={entry[0]} value={entry[0]}>
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
    </Center>
  );
};
