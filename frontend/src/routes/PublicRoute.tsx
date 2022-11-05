import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "src/contexts/AuthContext";

export const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      return;
    }
    navigate("/dashboard");
  }, [user, navigate]);

  return children;
};
