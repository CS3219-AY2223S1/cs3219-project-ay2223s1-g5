import { QueryClient, QueryClientProvider } from "react-query";
import { useRoutes } from "react-router-dom";
import { SnackbarProvider } from "notistack";

import { ReactQueryDevtools } from "react-query/devtools";

import { AppRoutes } from "./routes/app.routes";

const queryClient = new QueryClient();

const App = () => {
  return (
    <SnackbarProvider anchorOrigin={{ horizontal: "center", vertical: "top" }}>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        {useRoutes(AppRoutes)}
      </QueryClientProvider>
    </SnackbarProvider>
  );
};

export default App;
