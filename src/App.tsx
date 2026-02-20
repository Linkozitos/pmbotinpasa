import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import ChatPage from "./pages/ChatPage";
import PortfolioPage from "./pages/PortfolioPage";
import RisksPage from "./pages/RisksPage";
import GovernancePage from "./pages/GovernancePage";
import ResourcesPage from "./pages/ResourcesPage";
import FinancialPage from "./pages/FinancialPage";
import TemplatesPage from "./pages/TemplatesPage";
import IntegrationsPage from "./pages/IntegrationsPage";
import KnowledgeBasePage from "./pages/KnowledgeBasePage";
import CalculationMemoryPage from "./pages/CalculationMemoryPage";
import SetupPage from "./pages/SetupPage";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function ProtectedRoutes() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 size={24} className="animate-spin text-accent" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  return (
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
        <Route path="/knowledge" element={<KnowledgeBasePage />} />
        <Route path="/memorial/*" element={<CalculationMemoryPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

function AuthGuard() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 size={24} className="animate-spin text-accent" />
      </div>
    );
  }

  if (session) {
    return <Navigate to="/" replace />;
  }

  return <AuthPage />;
}

const App = () => {
  const hasConfig = !!supabase;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/setup" element={<SetupPage />} />
              {!hasConfig && <Route path="*" element={<Navigate to="/setup" replace />} />}
              <Route path="/auth" element={<AuthGuard />} />
              <Route path="/*" element={<ProtectedRoutes />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
