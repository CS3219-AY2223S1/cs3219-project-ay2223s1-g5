import { Container, ContainerProps } from "@mui/material";

type CenterProps = ContainerProps;

export const Center = ({ children, sx, ...rest }: CenterProps) => {
  return (
    <Container
      sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Container>
  );
};
