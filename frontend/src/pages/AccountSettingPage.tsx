import { useCallback, useState } from "react";
import { Button } from "@mui/material";

import { UpdatePasswordModal } from "src/components/modals/UpdatePasswordModal";
import { useAuth } from "src/contexts/AuthContext";

export const AccountSettingPage = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const onOpen = useCallback(() => {
    setIsOpen(true);
  }, [setIsOpen]);

  const onClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  return (
    <>
      <UpdatePasswordModal
        userId={user?.userId || 0}
        open={isOpen}
        onClose={onClose}
      />
      <Button variant="contained" onClick={onOpen}>
        Update Password
      </Button>
    </>
  );
};
