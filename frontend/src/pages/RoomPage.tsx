import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSnackbar } from "notistack";

export const RoomPage = () => {
  const { roomId } = useParams();

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (!roomId) {
      enqueueSnackbar("Invalid room ID", {
        variant: "error",
        key: "missing-room",
      });
      navigate("/select-difficulty");
      return;
    }
  }, [roomId, navigate, enqueueSnackbar]);

  return <div>{roomId}</div>;
};
