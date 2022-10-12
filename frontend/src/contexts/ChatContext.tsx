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
import {
  connect,
  LocalParticipant,
  RemoteParticipant,
  Room,
} from "twilio-video";

import { useCreateChatToken } from "src/hooks/useChat";

import { useAuth } from "./AuthContext";

type ChatContextProps = {
  identity: string;
  isConnected: boolean;
  messages: Message[] | undefined;
  send: (content: string, callback: () => void) => Promise<void>;
  typing: () => void;
  isTyping: Set<string>;
  selfVideoParticipant: LocalParticipant | undefined;
  videoParticipants: Map<string, RemoteParticipant>;
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
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [activeConversation, setActiveConversation] = useState<
    Conversation | undefined
  >();

  const [videoRoom, setVideoRoom] = useState<Room>();
  const [selfVideoParticipant, setSelfVideoParticipant] = useState<
    LocalParticipant | undefined
  >(undefined);
  const [videoParticipants, setVideoParticipants] = useState<
    Map<string, RemoteParticipant>
  >(new Map());

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
    if (client || videoRoom || !token || !identity || !user) {
      return;
    }

    // Chat

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
      await self?.updateAttributes({ name: user?.name || "" });

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
        setIsConnected(true);
      }
      if (state === "disconnected") {
        setIsConnected(false);
      }
    });

    // Video Chat

    connect(token, { name: roomId, video: true, audio: true }).then((room) => {
      setVideoRoom(room);
      room.on("participantConnected", (participant) => {
        setVideoParticipants((participants) => {
          return new Map(participants).set(participant.identity, participant);
        });
      });
      room.on("participantDisconnected", (participant) => {
        setVideoParticipants((participants) => {
          const map = new Map(participants);
          map.delete(participant.identity);
          return map;
        });
      });
      const participants = new Map();
      for (const participant of room.participants.values()) {
        participants.set(participant.identity, participant);
      }
      setVideoParticipants(participants);
      setSelfVideoParticipant(room.localParticipant);

      return () => {
        setVideoRoom((room) => {
          if (room && room.localParticipant.state === "connected") {
            room.localParticipant.tracks.forEach((trackPublication) => {
              const track = trackPublication.track;
              if (Object.prototype.hasOwnProperty.call(track, "stop")) {
                // It is either a video or audio track.
                (track as { stop: () => void }).stop();
              }
            });
            room.disconnect();
          }
          return undefined;
        });
      };
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, identity, user, roomId]);

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
      value={{
        isConnected,
        messages,
        send,
        typing,
        isTyping,
        identity,
        selfVideoParticipant,
        videoParticipants,
      }}
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
