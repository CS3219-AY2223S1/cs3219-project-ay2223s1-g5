import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useMonaco } from "@monaco-editor/react";
import * as monacoType from "monaco-editor";
import { useSnackbar } from "notistack";
import { MonacoBinding } from "y-monaco";
import { SocketIOProvider } from "y-socket.io";
import { Doc, Text } from "yjs";

import { useAuth } from "src/contexts/AuthContext";

import { EDITOR_DOCUMENT_NAME } from "~shared/constants";
type EditorContextProps = {
  onMount: (editor: monacoType.editor.IStandaloneCodeEditor) => void;
};

const EditorContext = createContext<EditorContextProps | undefined>(undefined);

export const EditorProvider = ({
  roomId,
  children,
}: PropsWithChildren & { roomId: string }): JSX.Element => {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const monaco = useMonaco();
  const editor = useRef<monacoType.editor.IStandaloneCodeEditor | null>(null);
  // We use this state to trigger the useEffect that is required for binding.
  const [isEditorMounted, setIsEditorMounted] = useState<boolean>(false);
  const [document, setDocument] = useState<Doc | undefined>(undefined);
  const [type, setType] = useState<Text | undefined>(undefined);
  const [provider, setProvider] = useState<SocketIOProvider | undefined>(
    undefined,
  );
  const [_, setBinding] = useState<MonacoBinding | undefined>(undefined);

  const onMount = useCallback(
    (monacoEditor: monacoType.editor.IStandaloneCodeEditor) => {
      editor.current = monacoEditor;
      setIsEditorMounted(true);
    },
    [setIsEditorMounted],
  );

  // Create synchronized document.
  useEffect(() => {
    if (document) {
      return;
    }
    const doc = new Doc();
    const text = doc.getText(EDITOR_DOCUMENT_NAME);
    setDocument(doc);
    setType(text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Create and bind provider to document.
  useEffect(() => {
    if (!document || provider) {
      return;
    }
    const socketIOProvider = new SocketIOProvider(
      `${window.location.protocol}//${window.location.host}`,
      roomId,
      document,
      { autoConnect: true },
    );
    socketIOProvider.awareness.setLocalState({
      id: user?.userId,
      name: user?.name,
    });
    socketIOProvider.on("status", ({ status }: { status: string }) => {
      if (status === "connected") {
        enqueueSnackbar("Editor connected.", {
          variant: "info",
          key: "editor",
        });
      } else {
        enqueueSnackbar("Editor disconnected. Please wait...", {
          variant: "error",
          key: "editor",
          persist: true,
        });
      }
    });
    setProvider(socketIOProvider);
  }, [document, provider, user, roomId, enqueueSnackbar]);

  // Bind the editor to the provider.
  useEffect(() => {
    const editorModel = editor.current?.getModel();
    // We check for editorRef.current otherwise new Set([...]) will complain.
    if (!monaco || !type || !editor.current || !editorModel || !provider) {
      return;
    }
    const binding = new MonacoBinding(
      type,
      editorModel,
      new Set([editor.current]),
      provider.awareness,
    );
    setBinding(binding);
  }, [monaco, provider, type, isEditorMounted]);

  return (
    <EditorContext.Provider
      value={{
        onMount,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = (): EditorContextProps => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error(`useEditor must be used within a EditorProvider component`);
  }
  return context;
};
