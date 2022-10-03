import { Box, Dialog, DialogTitle } from "@mui/material";

import { UpdatePasswordForm } from "../forms/UpdatePasswordForm";

type UpdatePasswordModalProps = {
  userId: number;
  open: boolean;
  onClose: () => void;
};

export const UpdatePasswordModal = ({
  userId,
  open,
  onClose,
}: UpdatePasswordModalProps) => {
  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle>Update Password</DialogTitle>
      <Box sx={{ px: 3, pb: 3, pt: 2, minWidth: "400px" }}>
        <UpdatePasswordForm onSubmit={onClose} userId={userId} />
      </Box>
    </Dialog>
  );
};
