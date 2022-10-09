import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { io, Socket } from "socket.io-client";

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
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

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
          // TODO: Can provide a way for the consumer to perform some action on error?
        });
        return new Map(sockets.set(namespace, client));
      });
    },
    [setSockets, enqueueSnackbar, navigate],
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
