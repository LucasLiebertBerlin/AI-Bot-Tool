import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import BotCreator from "@/pages/bot-creator";
import BotEditor from "@/pages/bot-editor";
import ChatInterface from "@/pages/chat-interface";
import AdminDashboard from "@/pages/admin-dashboard";
import Privacy from "@/pages/privacy";
import Impressum from "@/pages/impressum";
import Terms from "@/pages/terms";
import Contact from "@/pages/contact";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={AuthPage} />
          <Route path="/auth" component={AuthPage} />
        </>
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/create-bot" component={BotCreator} />
          <Route path="/bots/:id/edit" component={BotEditor} />
          <Route path="/bots/:id/chat" component={ChatInterface} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/privacy" component={Privacy} />
          <Route path="/impressum" component={Impressum} />
          <Route path="/terms" component={Terms} />
          <Route path="/contact" component={Contact} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
