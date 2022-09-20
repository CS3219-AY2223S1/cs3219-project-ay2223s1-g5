import "src/styles/editor.css";

import EditorComponent from "@monaco-editor/react";
import { Paper } from "@mui/material";

import { useEditor } from "src/contexts/EditorContext";

type EditorLanguage = "javascript" | "c++" | "python" | "java";

type EditorProps = {
  language: EditorLanguage;
};

export const Editor = (props: EditorProps) => {
  const { onMount } = useEditor();

  return (
    <Paper elevation={1} sx={{ p: 3, pl: 1, height: "100%" }}>
      <EditorComponent
        height="100%"
        defaultValue=""
        defaultLanguage={props.language}
        theme="light"
        onMount={onMount}
      />
    </Paper>
  );
};
