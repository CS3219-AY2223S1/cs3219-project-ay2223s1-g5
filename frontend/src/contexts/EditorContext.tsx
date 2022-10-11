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
import { Socket } from "socket.io-client";
import { MonacoBinding } from "y-monaco";
import { SocketIOProvider } from "y-socket.io";
import { Doc, Text } from "yjs";

import { useAuth } from "src/contexts/AuthContext";

import { EDITOR_DOCUMENT_NAME } from "~shared/constants";

type EditorContextProps = {
  onMount: (editor: monacoType.editor.IStandaloneCodeEditor) => void;
  isConnected: boolean;
  onSubmit: (callback: (code: string) => void) => void;
};

const EditorContext = createContext<EditorContextProps | undefined>(undefined);

export const EditorProvider = ({
  roomId,
  children,
}: PropsWithChildren & { roomId: string }): JSX.Element => {
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
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [binding, setBinding] = useState<MonacoBinding | undefined>(undefined);

  const onSubmit = useCallback(
    (callback: (code: string) => void) => {
      if (!document) {
        // TODO: Show a "Not ready" snackbar.
        return;
      }
      callback(document.getText(EDITOR_DOCUMENT_NAME).toJSON());
    },
    [document],
  );

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
    setProvider(socketIOProvider);
  }, [document, provider, roomId]);

  useEffect(() => {
    if (!provider) {
      return;
    }
    provider.awareness.setLocalState({
      id: user?.userId,
      name: user?.name,
    });
    provider.on("status", ({ status }: { status: string }) => {
      if (status === "connected") {
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    });
  }, [provider, user, setIsConnected]);

  useEffect(() => {
    if (!provider) {
      return;
    }
    return () => provider.destroy();
  }, [provider]);

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

  useEffect(() => {
    if (!binding) {
      return;
    }
    return () => binding.destroy();
  }, [binding]);

  return (
    <EditorContext.Provider
      value={{
        onMount,
        isConnected,
        onSubmit,
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
