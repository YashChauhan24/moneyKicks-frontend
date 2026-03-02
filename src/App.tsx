import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import { TwitterAuthProvider } from "./contexts/TwitterAuthContext";
import { NetworkProvider } from "./contexts/NetworkContext";
import Dashboard from "./pages/Dashboard";
import Jackpot from "./pages/Jackpot";
import BettingList from "./pages/BettingList";
import CreateBet from "./pages/CreateBet";
import BetDetail from "./pages/BetDetail";
import AdminPanel from "./pages/AdminPanel";
import TwitterCallback from "./pages/TwitterCallback";
import NotFound from "./pages/NotFound";
import Operations from "./pages/Operations";
import { AppKitProvider } from "./reown";

const queryClient = new QueryClient();

const App = () => (
  <AppKitProvider>
    <QueryClientProvider client={queryClient}>
      <NetworkProvider>
        <AdminAuthProvider>
          <TwitterAuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/jackpot" element={<Jackpot />} />
                  <Route path="/betting" element={<BettingList />} />
                  <Route path="/betting/create" element={<CreateBet />} />
                  <Route path="/betting/:id" element={<BetDetail />} />
                  <Route
                    path="/auth/twitter/callback"
                    element={<TwitterCallback />}
                  />
                  <Route path="/operations" element={<Operations />} />
                  <Route path="/admin" element={<AdminPanel />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </TwitterAuthProvider>
        </AdminAuthProvider>
      </NetworkProvider>
    </QueryClientProvider>
  </AppKitProvider>
);

export default App;
