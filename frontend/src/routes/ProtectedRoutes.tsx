import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CircularProgress, Container } from "@mui/material";
import { useSnackbar } from "notistack";

import { useAuth } from "src/contexts/AuthContext";

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      enqueueSnackbar("Unauthorized", {
        variant: "error",
        // Prevent double snackbar during development caused by
        // React.StrictMode's double invocation
        key: "unauthorized",
        preventDuplicate: true,
      });
      navigate("/");
    }
  }, [user, navigate, enqueueSnackbar]);

  return (
    <>
      {user ? (
        children
      ) : (
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
      )}
    </>
  );
};
