import { QueryClient, QueryClientProvider } from "react-query";
import { useRoutes } from "react-router-dom";

import { ReactQueryDevtools } from "react-query/devtools";

import { AppRoutes } from "./routes/app.routes";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      {useRoutes(AppRoutes)}
    </QueryClientProvider>
  );
};

export default App;
