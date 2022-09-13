import "src/styles/editor.css";

import { useEffect, useRef, useState } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import * as monacoType from "monaco-editor";
import { MonacoBinding } from "y-monaco";
import { SocketIOProvider } from "y-socket.io";
import { Doc, Text } from "yjs";

export const EditorPage = () => {
  const monaco = useMonaco();
  const editorRef = useRef<monacoType.editor.IStandaloneCodeEditor | null>(
    null,
  );
  // We use this state to trigger the useEffect that is required for binding.
  const [isEditorMounted, setIsEditorMounted] = useState<boolean>(false);
  const [document, setDocument] = useState<Doc | undefined>(undefined);
  const [type, setType] = useState<Text | undefined>(undefined);
  const [provider, setProvider] = useState<SocketIOProvider | undefined>(
    undefined,
  );
  const [_, setBinding] = useState<MonacoBinding | undefined>(undefined);
  // TODO: Handle disconnect.
  const [_connected, setConnected] = useState<boolean>(false);

  useEffect(() => {
    if (!document) {
      const doc = new Doc();
      const text = doc.getText("data");
      setDocument(doc);
      setType(text);
    }
  }, [document]);

  useEffect(() => {
    if (!!document && !provider) {
      const socketIOProvider = new SocketIOProvider(
        `${window.location.protocol}//${window.location.host}`,
        // TODO: Replace with room name
        "testing",
        document,
        { autoConnect: true },
      );
      socketIOProvider.awareness.setLocalState({
        // TODO: Populate with user information
        id: Math.random(),
        name: "User Name",
      });
      socketIOProvider.on("status", ({ status }: { status: string }) => {
        if (status === "connected") {
          setConnected(true);
        } else {
          setConnected(false);
        }
      });
      setProvider(socketIOProvider);
    }
  }, [document, provider]);

  useEffect(() => {
    const editorModel = editorRef.current?.getModel();
    // We check for editorRef.current otherwise new Set([...]) will complain.
    if (!monaco || !type || !editorRef.current || !editorModel || !provider) {
      return;
    }
    const binding = new MonacoBinding(
      type,
      editorModel,
      new Set([editorRef.current]),
      provider.awareness,
    );
    setBinding(binding);
  }, [monaco, provider, type, isEditorMounted]);

  return (
    <Editor
      height="90vh"
      defaultValue=""
      defaultLanguage="javascript"
      theme="light"
      onMount={(editor) => {
        setIsEditorMounted(true);
        editorRef.current = editor;
      }}
    />
  );
};
