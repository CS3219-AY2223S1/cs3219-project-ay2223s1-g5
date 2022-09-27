import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  Client,
  ConnectionState,
  Conversation,
  Message,
} from "@twilio/conversations";

import { useCreateChatToken } from "src/hooks/useChat";

import { useAuth } from "./AuthContext";

type ChatContextProps = {
  connected: boolean;
  messages: Message[] | undefined;
  send: (content: string, callback: () => void) => Promise<void>;
  typing: () => void;
  isTyping: Set<string>;
};

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

export const ChatProvider = ({
  roomId,
  children,
}: PropsWithChildren & { roomId: string }): JSX.Element => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[] | undefined>(undefined);
  const [client, setClient] = useState<Client>();
  const { createChatTokenMutation } = useCreateChatToken();
  const [token, setToken] = useState<string>("");
  const [identity, setIdentity] = useState<string>("");
  const [isTyping, setIsTyping] = useState<Set<string>>(new Set());
  const [connected, setConnected] = useState<boolean>(false);
  const [activeConversation, setActiveConversation] = useState<
    Conversation | undefined
  >();

  useEffect(() => {
    const retrieveToken = async () => {
      const { token, identity } = await createChatTokenMutation();
      setToken(token);
      setIdentity(identity);
    };
    retrieveToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (client || !token || !identity || !user) {
      return;
    }
    const twilioClient = new Client(token);
    setClient(twilioClient);
    twilioClient.on("initialized", async () => {
      // Connect to room conversation.
      const activeConversation = await twilioClient.getConversationByUniqueName(
        roomId,
      );
      setActiveConversation(activeConversation);

      // Update display name in participant object.
      const self = await activeConversation.getParticipantByIdentity(identity);
      self?.updateAttributes({ name: user?.name || "" });

      // Retrieve existing messages and load them.
      const existingMessages = await activeConversation.getMessages();
      setMessages([...existingMessages.items]);

      // Listen for new messages.
      activeConversation.on("messageAdded", (message) => {
        setMessages((messages) =>
          messages ? [...messages, message] : [message],
        );
      });

      // Typing indicators.
      activeConversation.on("typingStarted", (participant) => {
        if (participant.identity === identity) {
          return;
        }
        const name = (participant.attributes as { name: string }).name;
        setIsTyping((isTyping) => {
          const set = new Set(isTyping);
          set.add(name);
          return set;
        });
      });
      activeConversation.on("typingEnded", (participant) => {
        if (participant.identity === identity) {
          return;
        }
        const name = (participant.attributes as { name: string }).name;
        setIsTyping((isTyping) => {
          const set = new Set(isTyping);
          set.delete(name);
          return set;
        });
      });
    });

    // Check connection state.
    twilioClient.on("connectionStateChanged", (state: ConnectionState) => {
      if (state === "connected") {
        setConnected(true);
      }
      if (state === "disconnected") {
        setConnected(false);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, identity, user]);

  const send = useCallback(
    async (content: string, callback: () => void) => {
      if (!activeConversation || !user) {
        return;
      }
      await activeConversation.sendMessage(content, {
        name: user.name,
      });
      callback();
    },
    [activeConversation, user],
  );

  const typing = useCallback(() => {
    if (!activeConversation) {
      return;
    }
    activeConversation.typing();
  }, [activeConversation]);

  return (
    <ChatContext.Provider
      value={{ connected, messages, send, typing, isTyping }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextProps => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error(`useChat must be used within a ChatProvider component`);
  }
  return context;
};
