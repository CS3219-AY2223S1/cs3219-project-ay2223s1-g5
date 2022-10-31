import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useRef,
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

import { useAuth } from "src/contexts/AuthContext";
import { useCreateChatToken } from "src/hooks/useChat";

type ChatContextProps = {
  identity: string;

  // Chat
  isConnected: boolean;
  messages: Message[] | undefined;
  send: (content: string, callback: () => void) => Promise<void>;
  typing: () => void;
  isTyping: Set<string>;
  hasNewMessages: boolean;
  clearHasNewMessages: () => void;

  // Video
  isVideoChatEnabled: boolean;
  enableVideoChat: () => void;
  selfVideoParticipant: LocalParticipant | undefined;
  videoParticipants: Map<string, RemoteParticipant>;
  isVideoEnabled: boolean;
  setIsVideoEnabled: (value: boolean) => void;
  isAudioEnabled: boolean;
  setIsAudioEnabled: (value: boolean) => void;
};

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

export const ChatProvider = ({
  roomId,
  children,
}: PropsWithChildren & { roomId: string }): JSX.Element => {
  const { user } = useAuth();
  const { createChatToken } = useCreateChatToken();
  const [token, setToken] = useState<string>("");
  const [identity, setIdentity] = useState<string>("");

  // Chat
  const [client, setClient] = useState<Client>();
  const [messages, setMessages] = useState<Message[] | undefined>(undefined);
  const [isTyping, setIsTyping] = useState<Set<string>>(new Set());
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [activeConversation, setActiveConversation] = useState<
    Conversation | undefined
  >();
  const [hasNewMessages, setHasNewMessages] = useState<boolean>(false);
  const clearHasNewMessages = useCallback(() => {
    setHasNewMessages(false);
  }, [setHasNewMessages]);

  // Video
  const [isVideoChatEnabled, setIsVideoChatEnabled] = useState<boolean>(false);
  const videoRoom = useRef<Room | null>(null);
  const [selfVideoParticipant, setSelfVideoParticipant] = useState<
    LocalParticipant | undefined
  >(undefined);
  const [isVideoEnabled, setIsVideoEnabled] = useState<boolean>(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);
  const [videoParticipants, setVideoParticipants] = useState<
    Map<string, RemoteParticipant>
  >(new Map());

  const enableVideoChat = useCallback(() => {
    setIsVideoChatEnabled(true);
  }, [setIsVideoChatEnabled]);

  useEffect(() => {
    const retrieveToken = async () => {
      const { token, identity } = await createChatToken();
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
      await self?.updateAttributes({ name: user?.name || "" });

      // Retrieve existing messages and load them.
      const existingMessages = await activeConversation.getMessages();
      setMessages([...existingMessages.items]);

      // Listen for new messages.
      activeConversation.on("messageAdded", (message) => {
        setMessages((messages) =>
          messages ? [...messages, message] : [message],
        );
        setHasNewMessages(true);
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, identity, user, roomId, setHasNewMessages]);

  useEffect(() => {
    if (videoRoom.current || !isVideoChatEnabled || !token || !roomId) {
      return;
    }

    connect(token, { name: roomId, video: true, audio: true }).then((room) => {
      videoRoom.current = room;
      room.on("participantConnected", (participant) => {
        setVideoParticipants((participants) => {
          return new Map(participants).set(participant.identity, participant);
        });
      });
      room.on("participantDisconnected", (participant) => {
        setVideoParticipants((participants) => {
          participant.removeAllListeners();
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
    });

    const leaveVideoRoom = () => {
      if (videoRoom.current) {
        if (videoRoom.current.localParticipant.state === "connected") {
          videoRoom.current.localParticipant.tracks.forEach(
            (trackPublication) => {
              const track = trackPublication.track;
              if (Object.prototype.hasOwnProperty.call(track, "stop")) {
                // It is either a video or audio track.
                (track as { stop: () => void }).stop();
              }
              trackPublication.unpublish();
            },
          );
          videoRoom.current.disconnect();
        }
      }
    };

    window.addEventListener("beforeunload", leaveVideoRoom);

    return () => {
      window.removeEventListener("beforeunload", leaveVideoRoom);
      leaveVideoRoom();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user, roomId, isVideoChatEnabled]);

  useEffect(() => {
    if (!selfVideoParticipant) {
      return;
    }
    if (isVideoEnabled) {
      selfVideoParticipant.videoTracks.forEach((publication) => {
        publication.track.enable();
      });
    } else {
      selfVideoParticipant.videoTracks.forEach((publication) => {
        publication.track.disable();
      });
    }
  }, [selfVideoParticipant, isVideoEnabled]);

  useEffect(() => {
    if (!selfVideoParticipant) {
      return;
    }
    if (isAudioEnabled) {
      selfVideoParticipant.audioTracks.forEach((publication) => {
        publication.track.enable();
      });
    } else {
      selfVideoParticipant.audioTracks.forEach((publication) => {
        publication.track.disable();
      });
    }
  }, [selfVideoParticipant, isAudioEnabled]);

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
        hasNewMessages,
        clearHasNewMessages,
        isVideoChatEnabled,
        enableVideoChat,
        selfVideoParticipant,
        videoParticipants,
        isVideoEnabled,
        setIsVideoEnabled,
        isAudioEnabled,
        setIsAudioEnabled,
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
