import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { AuthProvider } from "@/lib/auth/context";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

// Pages
import LandingPage from "@/pages/LandingPage";
import NotFound from "@/pages/NotFound";
import LoginPage from "@/pages/auth/LoginPage";
import CallbackPage from "@/pages/auth/CallbackPage";
import PathwaysPage from "@/pages/dashboard/PathwaysPage";
import NewReactionPage from "@/pages/NewReactionPage";
import ImportPathwayPage from "@/pages/dashboard/ImportPathwayPage";
import PathwayDetailPage from "@/pages/dashboard/PathwayDetailPage";
import PathwayResultsPage from "@/pages/dashboard/PathwayResultsPage";
import HistoryPage from "@/pages/dashboard/HistoryPage";
import SettingsPage from "@/pages/dashboard/SettingsPage";
import ProfilePage from "@/pages/dashboard/ProfilePage";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/auth/callback" element={<CallbackPage />} />

              {/* Dashboard routes wrapped in DashboardLayout */}
              <Route element={<DashboardLayout />}>
                <Route path="/pathways" element={<PathwaysPage />} />
                <Route path="/pathways/new" element={<NewReactionPage />} />
                <Route path="/pathways/import" element={<ImportPathwayPage />} />
                <Route path="/pathways/:id" element={<PathwayDetailPage />} />
                <Route path="/pathways/:id/results" element={<PathwayResultsPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
