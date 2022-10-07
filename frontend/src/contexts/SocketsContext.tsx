import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";

type SocketsContextProps = {
  sockets: Map<string, Socket>;
  connect: (namespace: string) => void;
};

const SocketsContext = createContext<SocketsContextProps | undefined>(
  undefined,
);

export const SocketsProvider = ({
  children,
}: PropsWithChildren): JSX.Element => {
  const [sockets, setSockets] = useState<Map<string, Socket>>(new Map());

  const connect = useCallback(
    (namespace: string) => {
      setSockets((sockets) => {
        if (sockets.has(namespace)) {
          return sockets;
        }
        const client = io(`/${namespace}`, {
          withCredentials: true,
          transports: ["websocket"],
        });
        return new Map(sockets.set(namespace, client));
      });
    },
    [setSockets],
  );

  useEffect(() => {
    return () => {
      setSockets((sockets) => {
        for (const socket of sockets.values()) {
          socket.disconnect();
        }
        return new Map();
      });
    };
  }, []);

  return (
    <SocketsContext.Provider
      value={{
        sockets,
        connect,
      }}
    >
      {children}
    </SocketsContext.Provider>
  );
};

export const useSockets = (): SocketsContextProps => {
  const context = useContext(SocketsContext);
  if (!context) {
    throw new Error(
      `useSockets must be used within a SocketsProvider component`,
    );
  }
  return context;
};
