import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { io, Socket } from "socket.io-client";

import { SOCKET_IO_DISCONNECT_REASON } from "src/constants/socket.io";

import { CLIENT_EVENTS } from "~shared/constants/events";

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
  const socketMap = useRef<Map<string, Socket>>(sockets);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const connect = useCallback(
    (namespace: string) => {
      setSockets((sockets) => {
        if (sockets.has(namespace)) {
          if (!sockets.get(namespace)?.connected) {
            sockets.get(namespace)?.connect();
          }
          return sockets;
        }
        const client = io(`/${namespace}`, {
          withCredentials: true,
          transports: ["websocket"],
        });
        client.on(CLIENT_EVENTS.CONNECT_ERROR, (error: Error) => {
          enqueueSnackbar(
            error.message === "Unauthorized"
              ? "Unauthorized"
              : "Something went wrong",
            {
              variant: "error",
            },
          );
          if (error.message !== "Unauthorized") {
            // eslint-disable-next-line no-console
            console.warn(error.message);
          }
          // Go back to previous page.
          navigate(-1);
        });
        client.on(CLIENT_EVENTS.ERROR, (error: Error) => {
          // eslint-disable-next-line no-console
          console.warn(error);
          enqueueSnackbar(error.message, {
            variant: "error",
          });
        });
        client.on(CLIENT_EVENTS.DISCONNECT, (reason: string) => {
          if (reason === SOCKET_IO_DISCONNECT_REASON.SERVER_CLOSE) {
            navigate(-1);
          }
        });
        return new Map(sockets).set(namespace, client);
      });
    },
    [setSockets, enqueueSnackbar, navigate],
  );

  useEffect(() => {
    socketMap.current = sockets;
  }, [sockets]);

  useEffect(() => {
    return () => {
      for (const socket of socketMap.current.values()) {
        socket.disconnect();
      }
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
