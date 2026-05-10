import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import WalletLogin from "./pages/WalletLogin";
import Onboarding from "./pages/Onboarding";
import Discover from "./pages/Discover";
import Matches from "./pages/Matches";
import Chat from "./pages/Chat";
import Agent from "./pages/Agent";
import Community from "./pages/Community";
import Profile from "./pages/Profile";
import Membership from "./pages/Membership";
import Notifications from "./pages/Notifications";
import { RequireStage } from "./components/RequireStage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<WalletLogin />} />
          <Route path="/onboarding" element={<RequireStage need="onboarding"><Onboarding /></RequireStage>} />
          <Route path="/discover" element={<RequireStage need="app"><Discover /></RequireStage>} />
          <Route path="/matches" element={<RequireStage need="app"><Matches /></RequireStage>} />
          <Route path="/chat/:id" element={<RequireStage need="app"><Chat /></RequireStage>} />
          <Route path="/agent" element={<RequireStage need="app"><Agent /></RequireStage>} />
          <Route path="/community" element={<RequireStage need="app"><Community /></RequireStage>} />
          <Route path="/profile" element={<RequireStage need="app"><Profile /></RequireStage>} />
          <Route path="/membership" element={<RequireStage need="app"><Membership /></RequireStage>} />
          <Route path="/notifications" element={<RequireStage need="app"><Notifications /></RequireStage>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
