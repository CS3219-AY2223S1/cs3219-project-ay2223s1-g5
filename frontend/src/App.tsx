import { QueryClient, QueryClientProvider } from "react-query";

import { ReactQueryDevtools } from "react-query/devtools";

import { Login } from "./pages/Login";
// import { PasswordReset } from "./pages/PasswordReset";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <Login />
    </QueryClientProvider>
  );
};

export default App;
