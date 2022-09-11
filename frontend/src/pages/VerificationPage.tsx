import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CircularProgress, Container } from "@mui/material";
import { useSnackbar } from "notistack";

import { useVerifyEmail } from "src/hooks/useAuth";
import { ApiResponseError } from "src/services/ApiService";

export const VerificationPage = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const userId = params.get("userId");
  const code = params.get("code");
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const previousCode = useRef<string>("");

  const { verifyEmailMutation } = useVerifyEmail();

  useEffect(() => {
    if (userId === null || code === null) {
      enqueueSnackbar("Something went wrong", {
        variant: "error",
        // Prevent double snackbar during development caused by
        // React.StrictMode's double invocation
        key: "Generic Error",
        preventDuplicate: true,
      });
      navigate("/");
      return;
    }
    // We use a ref to bypass React.StrictMode's double invocation
    // as it would cause the second verification call to fail.
    if (code == previousCode.current) {
      return;
    }
    previousCode.current = code;
    const verify = async () => {
      try {
        await verifyEmailMutation({ userId: Number(userId), code: code });
        enqueueSnackbar("Successfully verified email! Please login.", {
          variant: "success",
        });
        navigate("/");
        return;
      } catch (e: unknown) {
        enqueueSnackbar((e as ApiResponseError).message, {
          variant: "error",
        });
        // TODO: Redirect to request resend verification email page.
        navigate("/");
      }
    };
    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
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
  );
};
