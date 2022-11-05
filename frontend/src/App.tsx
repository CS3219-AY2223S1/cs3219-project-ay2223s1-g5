import { QueryClient, QueryClientProvider } from "react-query";
import { useRoutes } from "react-router-dom";
import { SnackbarProvider } from "notistack";

import { ReactQueryDevtools } from "react-query/devtools";
import { AuthProvider } from "src/contexts/AuthContext";
import { AppRoutes } from "src/routes/app.routes";

const queryClient = new QueryClient();

const App = () => {
  return (
    <SnackbarProvider
      anchorOrigin={{ horizontal: "center", vertical: "top" }}
      preventDuplicate={true}
      autoHideDuration={2000}
      maxSnack={1}
    >
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <AuthProvider>{useRoutes(AppRoutes)}</AuthProvider>
      </QueryClientProvider>
    </SnackbarProvider>
  );
};

export default App;
