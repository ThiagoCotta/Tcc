import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import Index from "./pages/Index";
import QuickSearch from "./pages/QuickSearch";

const queryClient = new QueryClient();

const App = () => {
  const [activeTab, setActiveTab] = useState<'pc-builder' | 'quick-search'>('pc-builder');

  const renderContent = () => {
    switch (activeTab) {
      case 'pc-builder':
        return <Index />;
      case 'quick-search':
        return <QuickSearch />;
      default:
        return <Index />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="flex h-screen">
            <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
            <main className="flex-1 overflow-auto">
              {renderContent()}
            </main>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
