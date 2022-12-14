import "src/styles/editor.css";

import EditorComponent from "@monaco-editor/react";
import { LinearProgress, Paper } from "@mui/material";

import { Center } from "src/components/Center";
import { useEditor } from "src/contexts/EditorContext";

import { Language } from "~shared/types/base";

type EditorProps = {
  language?: Language;
};

const languageToEditorLanguage = (language?: Language) => {
  if (!language) {
    return "plaintext";
  }
  switch (language) {
    case Language.CPP:
      return "cpp";
    case Language.JAVA:
      return "java";
    case Language.JAVASCRIPT:
      return "javascript";
    case Language.PYTHON:
      return "python";
  }
};

export const Editor = (props: EditorProps) => {
  const { onMount, isReady } = useEditor();
  return (
    <Paper elevation={1} sx={{ p: 3, pl: 1, height: "100%" }}>
      {isReady ? (
        <EditorComponent
          height="100%"
          defaultValue=""
          language={languageToEditorLanguage(props.language)}
          theme="light"
          onMount={onMount}
        />
      ) : (
        <Center>
          <LinearProgress />
        </Center>
      )}
    </Paper>
  );
};
