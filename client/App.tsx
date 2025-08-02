import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Chatbot from "./pages/Chatbot";
import Settings from "./pages/Settings";
import UpgradePlan from "./pages/UpgradePlan";
import Library from "./pages/Library";
import HelpFAQ from "./pages/HelpFAQ";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/chat" element={<Chatbot />} />
            <Route
              path="/settings"
              element={
                <Settings
                  onClose={() => window.history.back()}
                  isModal={false}
                />
              }
            />
            <Route path="/upgrade" element={<UpgradePlan />} />
            <Route path="/library" element={<Library />} />
            <Route path="/help" element={<HelpFAQ />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
