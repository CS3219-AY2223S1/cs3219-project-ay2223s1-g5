import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { CircularProgress, Container } from "@mui/material";
import { useSnackbar } from "notistack";

import { useLogout, useWhoAmI } from "src/hooks/useAuth";
import { ApiResponseError } from "src/services/ApiService";

import { LoginRes } from "~shared/types/api";

type AuthContextProps = {
  user: LoginRes | null | undefined;
  getUser: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren): JSX.Element => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { whoAmI } = useWhoAmI();
  const { logout } = useLogout();
  // We set adminUser to undefined to denote an uninitialized state.
  const [user, setUser] = useState<LoginRes | null | undefined>(undefined);

  const getUser = useCallback(async () => {
    try {
      const retrievedUser = await whoAmI();
      if (retrievedUser) {
        setUser(retrievedUser);
      } else {
        setUser(null);
      }
    } catch (e: unknown) {
      // eslint-disable-next-line no-console
      console.error(e);
      enqueueSnackbar((e as ApiResponseError).message);
      navigate("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logoutCallback = useCallback(async () => {
    try {
      await logout();
    } catch (e: unknown) {
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      setUser(null);
      navigate("/");
      enqueueSnackbar("Logged out", {
        variant: "success",
      });
    }
  }, [enqueueSnackbar, logout, navigate]);

  // Initialize states
  useEffect(() => {
    getUser();
  }, [getUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        getUser,
        logout: logoutCallback,
      }}
    >
      {user === undefined ? (
        <Container
          sx={{
            height: "100vh",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress size="4rem" />
        </Container>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

/**
 * Hook for components nested in ProvideAuth component to get the current auth object.
 */
export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(`useAuth must be used within a AuthProvider component`);
  }
  return context;
};
