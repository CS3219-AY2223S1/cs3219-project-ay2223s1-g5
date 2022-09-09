import { Container, Skeleton } from "@mui/material";

export const DashboardPage = () => {
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
      <Skeleton variant="rounded" width="50%" height="30%" />
    </Container>
  );
};
