import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";

type SocketContextProps = {
  socket: Socket | undefined;
  connect: (namespace: string) => void;
};

const SocketContext = createContext<SocketContextProps | undefined>(undefined);

export const SocketProvider = ({
  children,
}: PropsWithChildren): JSX.Element => {
  const [socket, setSocket] = useState<Socket | undefined>(undefined);
  const [name, setName] = useState<string | undefined>(undefined);

  const connect = useCallback((namespace: string) => {
    setSocket((socket) => {
      if (socket && namespace == name) {
        return socket;
      }
      // TODO: Manually configure path for development vs production.
      const client = io(`http://localhost:8080/${namespace}`, {
        withCredentials: true,
        transports: ["websocket"],
      });
      return client;
    });
    setName(namespace);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => setSocket(undefined);
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        connect,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextProps => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error(`useSocket must be used within a SocketProvider component`);
  }
  return context;
};
