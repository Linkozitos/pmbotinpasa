import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import ChatPage from "./pages/ChatPage";
import PortfolioPage from "./pages/PortfolioPage";
import RisksPage from "./pages/RisksPage";
import GovernancePage from "./pages/GovernancePage";
import ResourcesPage from "./pages/ResourcesPage";
import FinancialPage from "./pages/FinancialPage";
import TemplatesPage from "./pages/TemplatesPage";
import IntegrationsPage from "./pages/IntegrationsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/risks" element={<RisksPage />} />
            <Route path="/governance" element={<GovernancePage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/financial" element={<FinancialPage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/integrations" element={<IntegrationsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
