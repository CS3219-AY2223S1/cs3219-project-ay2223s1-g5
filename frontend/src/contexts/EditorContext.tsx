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
import { MonacoBinding } from "y-monaco";
import { SocketIOProvider } from "y-socket.io";
import { WebrtcProvider } from "y-webrtc";
import { Doc, Text } from "yjs";

import { useAuth } from "src/contexts/AuthContext";
import { Awareness } from "y-protocols/awareness";

import { EDITOR_DOCUMENT_NAME } from "~shared/constants";

type EditorContextProps = {
  onMount: (editor: monacoType.editor.IStandaloneCodeEditor) => void;
  isReady: boolean;
  isConnected: boolean;
  onSubmit: (callback: (code: string) => void) => void;
};

const EditorContext = createContext<EditorContextProps | undefined>(undefined);

export const EditorProvider = ({
  roomId,
  roomPassword,
  children,
}: PropsWithChildren & {
  roomId: string;
  roomPassword: string;
}): JSX.Element => {
  const { user } = useAuth();
  const monaco = useMonaco();
  const editor = useRef<monacoType.editor.IStandaloneCodeEditor | null>(null);
  // We use this state to trigger the useEffect that is required for binding.
  const [isEditorMounted, setIsEditorMounted] = useState<boolean>(false);
  const [document, setDocument] = useState<Doc | undefined>(undefined);
  const [type, setType] = useState<Text | undefined>(undefined);
  const [awareness, setAwareness] = useState<Awareness | undefined>(undefined);
  const [socketIOProvider, setSocketIOProvider] = useState<
    SocketIOProvider | undefined
  >(undefined);
  const [webRTCProvider, setWebRTCProvider] = useState<
    WebrtcProvider | undefined
  >(undefined);
  const [isSocketIOSynced, setIsSocketIOSynced] = useState<boolean>(false);
  const [isSocketIOConnected, setIsSocketIOConnected] =
    useState<boolean>(false);
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
    if (!document || socketIOProvider || webRTCProvider || awareness) {
      return;
    }
    const awarenessInstance = new Awareness(document);
    const socketIOProviderInstance = new SocketIOProvider(
      `${window.location.protocol}//${window.location.host}`,
      roomId,
      document,
      { autoConnect: true, awareness: awarenessInstance },
    );
    setSocketIOProvider(socketIOProviderInstance);

    const webRTCProviderInstance = new WebrtcProvider(roomId, document, {
      signaling: [
        "wss://y-webrtc-signaling-eu.herokuapp.com",
        "wss://y-webrtc-signaling-us.herokuapp.com",
      ],
      password: roomPassword,
      awareness: awarenessInstance,
      maxConns: 10,
      filterBcConns: false,
      peerOpts: {},
    });
    setWebRTCProvider(webRTCProviderInstance);

    setAwareness(awarenessInstance);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document, roomId]);

  useEffect(() => {
    if (!socketIOProvider) {
      return;
    }
    socketIOProvider.on("status", ({ status }: { status: string }) => {
      if (status === "connected") {
        setIsSocketIOConnected(true);
      } else {
        setIsSocketIOConnected(false);
      }
    });
    socketIOProvider.on("synced", (synced: boolean) => {
      setIsSocketIOSynced(synced);
    });
  }, [socketIOProvider, setIsSocketIOConnected, setIsSocketIOSynced]);

  useEffect(() => {
    if (!awareness || !user) {
      return;
    }
    awareness.setLocalState({
      id: user.userId,
      name: user.name,
    });
  }, [user, awareness]);

  useEffect(() => {
    if (!socketIOProvider) {
      return;
    }
    return () => {
      socketIOProvider.disconnect();
      socketIOProvider.destroy();
    };
  }, [socketIOProvider]);

  useEffect(() => {
    if (!webRTCProvider) {
      return;
    }
    return () => {
      webRTCProvider.disconnect();
      webRTCProvider.destroy();
    };
  }, [webRTCProvider]);

  // Bind the editor to the provider.
  useEffect(() => {
    const editorModel = editor.current?.getModel();
    // We check for editorRef.current otherwise new Set([...]) will complain.
    if (
      !isSocketIOSynced ||
      !webRTCProvider ||
      !monaco ||
      !type ||
      !editor.current ||
      !editorModel ||
      !awareness
    ) {
      return;
    }
    const binding = new MonacoBinding(
      type,
      editorModel,
      new Set([editor.current]),
      awareness,
    );
    setBinding(binding);
  }, [
    monaco,
    type,
    isEditorMounted,
    isSocketIOSynced,
    awareness,
    webRTCProvider,
  ]);

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
        isReady: !!webRTCProvider && !!socketIOProvider,
        isConnected: !!webRTCProvider && isSocketIOConnected,
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
