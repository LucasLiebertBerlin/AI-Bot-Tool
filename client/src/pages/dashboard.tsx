import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Bot, MessageCircle, TrendingUp, Plus, Search, Shield, LogOut } from "lucide-react";
import BotCard from "@/components/bot-card";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import type { Bot as BotType } from "@shared/schema";

interface DashboardStats {
  activeBots: number;
  conversationsToday: number;
  successRate: number;
}

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const { isAdmin } = useAdmin();
  const [, setLocation] = useLocation();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    retry: false,
  });

  const { data: bots, isLoading: botsLoading, error: botsError } = useQuery<BotType[]>({
    queryKey: ["/api/bots"],
    retry: false,
  });

  // Handle unauthorized errors for bots
  useEffect(() => {
    if (botsError && isUnauthorizedError(botsError as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [botsError, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-slate-200">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo Section */}
          <div className="flex items-center h-16 px-6 bg-white border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-lg font-semibold text-slate-900">AI Bot Studio</h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg">
              <Bot className="mr-3 h-4 w-4" />
              Dashboard
            </button>
            <button 
              onClick={() => setLocation("/create-bot")}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg"
            >
              <Plus className="mr-3 h-4 w-4" />
              Bot erstellen
            </button>
            {isAdmin && (
              <button 
                onClick={() => setLocation("/admin")}
                className="flex items-center w-full px-3 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg"
              >
                <Shield className="mr-3 h-4 w-4" />
                Admin Panel
              </button>
            )}
          </nav>

          {/* User Profile */}
          <div className="flex-shrink-0 px-4 py-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-slate-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-slate-900">User</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={async () => {
                  try {
                    await apiRequest("POST", "/api/logout");
                    window.location.href = "/";
                  } catch (error) {
                    // Fallback to direct logout
                    window.location.href = "/api/logout";
                  }
                }}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Abmelden
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top Navigation */}
        <div className="flex items-center justify-between h-16 px-4 lg:px-8 bg-white border-b border-slate-200">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Dashboard</h2>
            <p className="text-sm text-slate-600">Verwalten Sie Ihre KI-Chatbots</p>
          </div>
          <Button onClick={() => setLocation("/create-bot")}>
            <Plus className="mr-2 h-4 w-4" />
            Neuen Bot erstellen
          </Button>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Bot className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-slate-600">Aktive Bots</p>
                    {statsLoading ? (
                      <Skeleton className="h-8 w-8" />
                    ) : (
                      <p className="text-2xl font-semibold text-slate-900">{stats?.activeBots || 0}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <MessageCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-slate-600">Gespräche heute</p>
                    {statsLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <p className="text-2xl font-semibold text-slate-900">{stats?.conversationsToday || 0}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-slate-600">Erfolgsrate</p>
                    {statsLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <p className="text-2xl font-semibold text-slate-900">{stats?.successRate || 0}%</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bots Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Meine Bots</h3>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Input placeholder="Bots durchsuchen..." className="pl-10" />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
                <Select>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Alle Typen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Typen</SelectItem>
                    <SelectItem value="assistant">Assistent</SelectItem>
                    <SelectItem value="storyteller">Storyteller</SelectItem>
                    <SelectItem value="helper">Helfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bots Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {botsLoading ? (
                // Loading skeletons
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Skeleton className="h-12 w-12 rounded-xl" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </div>
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-16 w-full mb-4" />
                      <div className="flex justify-between mb-4">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <div className="flex space-x-2">
                        <Skeleton className="h-10 flex-1" />
                        <Skeleton className="h-10 w-10" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : bots && bots.length > 0 ? (
                bots.map((bot) => (
                  <BotCard key={bot.id} bot={bot} />
                ))
              ) : (
                // Empty state
                <div className="col-span-full text-center py-12">
                  <Bot className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Keine Bots vorhanden</h3>
                  <p className="text-slate-600 mb-4">Erstellen Sie Ihren ersten Bot, um zu beginnen.</p>
                  <Button onClick={() => setLocation("/create-bot")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Bot erstellen
                  </Button>
                </div>
              )}

              {/* Create New Bot Card */}
              {bots && bots.length > 0 && (
                <Card 
                  className="border-2 border-dashed border-slate-300 hover:border-blue-400 transition-colors cursor-pointer group"
                  onClick={() => setLocation("/create-bot")}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-slate-100 group-hover:bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4 transition-colors">
                      <Plus className="h-6 w-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <h4 className="text-lg font-semibold text-slate-900 mb-2">Neuen Bot erstellen</h4>
                    <p className="text-sm text-slate-600 mb-4">Erstellen Sie einen neuen personalisierten KI-Chatbot mit eigenen Fähigkeiten und Persönlichkeit.</p>
                    <Button>
                      Jetzt erstellen
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
