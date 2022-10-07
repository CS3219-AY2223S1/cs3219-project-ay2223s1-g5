import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CloseOutlined } from "@mui/icons-material";
import { Box, CircularProgress, IconButton, Link } from "@mui/material";
import { blueGrey } from "@mui/material/colors";
import { useSnackbar } from "notistack";

import { Center } from "src/components/Center";
import { useVerifyEmail } from "src/hooks/useUsers";

export const VerificationPage = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const userId = params.get("userId");
  const code = params.get("code");
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { verifyEmailMutation } = useVerifyEmail();
  const navigate = useNavigate();
  const previousCode = useRef<string>("");

  useEffect(() => {
    if (userId === null || code === null) {
      enqueueSnackbar("Something went wrong", {
        variant: "error",
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
        enqueueSnackbar(
          <span>
            Failed to verify email.{" "}
            <Link
              component="button"
              variant="body2"
              sx={{
                color: "blueGrey.900",
                textDecorationColor: blueGrey[900],
              }}
              onClick={() => {
                navigate("/request-verify");
                // We have a limit of a single snackbar so closing all is no different.
                closeSnackbar();
              }}
            >
              Click here to resend email.
            </Link>
          </span>,
          {
            action: (id) => (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <IconButton sx={{ p: "4px" }} onClick={() => closeSnackbar(id)}>
                  <CloseOutlined fontSize="small" />
                </IconButton>
              </Box>
            ),
            variant: "warning",
            persist: true,
          },
        );
        navigate("/");
      }
    };
    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Center sx={{ height: "100vh" }}>
      <CircularProgress size="4rem" />
    </Center>
  );
};
