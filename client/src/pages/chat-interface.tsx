import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Send, Edit, Trash2 } from "lucide-react";
import ChatMessage from "@/components/chat-message";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Bot, ChatMessage as ChatMessageType, ChatSession } from "@shared/schema";

export default function ChatInterface() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams();
  const queryClient = useQueryClient();
  const botId = parseInt(params.id || "0");
  const [message, setMessage] = useState("");
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [localMessages, setLocalMessages] = useState<ChatMessageType[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const { data: bot, isLoading: botLoading, error: botError } = useQuery<Bot>({
    queryKey: ["/api/bots", botId],
    retry: false,
  });

  const { data: sessions } = useQuery<ChatSession[]>({
    queryKey: ["/api/bots", botId, "sessions"],
    retry: false,
    enabled: !!bot,
  });

  const { data: messages, isLoading: messagesLoading } = useQuery<ChatMessageType[]>({
    queryKey: ["/api/sessions", currentSessionId, "messages"],
    retry: false,
    enabled: !!currentSessionId,
  });

  // Handle unauthorized errors
  useEffect(() => {
    if (botError && isUnauthorizedError(botError as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [botError, toast]);

  // Create session when component loads
  useEffect(() => {
    if (bot && sessions !== undefined && currentSessionId === null) {
      if (sessions.length > 0) {
        // Use the most recent session
        setCurrentSessionId(sessions[0].id);
      } else {
        // Create a new session
        createSessionMutation.mutate({
          botId,
          title: `Chat with ${bot.name}`,
        });
      }
    }
  }, [bot, sessions, currentSessionId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [localMessages]);

  const createSessionMutation = useMutation({
    mutationFn: async (data: { botId: number; title: string }) => {
      const response = await apiRequest("POST", `/api/bots/${data.botId}/sessions`, data);
      return response.json();
    },
    onSuccess: (session) => {
      setCurrentSessionId(session.id);
      queryClient.invalidateQueries({ queryKey: ["/api/bots", botId, "sessions"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to create chat session.",
        variant: "destructive",
      });
    },
  });



  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      // Use botId directly since we're not using sessions
      const response = await apiRequest("POST", `/api/sessions/${botId}/messages`, { content });
      return response.json();
    },
    onSuccess: (data) => {
      // Add both user and bot messages to local state
      setLocalMessages(prev => [...prev, data.userMessage, data.botMessage]);
      setMessage("");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !sendMessageMutation.isPending) {
      sendMessageMutation.mutate(message.trim());
    }
  };

  const clearChat = () => {
    setLocalMessages([]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "disabled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading || botLoading) {
    return <div>Loading...</div>;
  }

  if (!bot) {
    return <div>Bot not found</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => setLocation("/")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-500">🤖</span>
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-slate-900">{bot.name}</h1>
                  <div className="flex items-center space-x-2">
                    <Badge className={`text-xs ${getStatusColor(bot.status)}`}>
                      {bot.status === "active" ? "Online" : bot.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={clearChat}>
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setLocation(`/bots/${botId}/edit`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Bot bearbeiten
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto h-[calc(100vh-4rem)] flex flex-col">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Welcome Message */}
          {(!messages || messages.length === 0) && !messagesLoading && bot && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-500 text-sm">🤖</span>
              </div>
              <Card className="max-w-lg">
                <CardContent className="p-4">
                  <p className="text-slate-900">
                    Hallo! Ich bin {bot.name}. {bot.description ? bot.description : "Wie kann ich Ihnen heute helfen?"}
                  </p>
                  <span className="text-xs text-slate-500 mt-2 block">gerade eben</span>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Loading Messages */}
          {messagesLoading && (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start space-x-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Chat Messages */}
          {localMessages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              isUser={msg.role === "user"}
              botName={bot?.name || "Bot"}
            />
          ))}

          {/* Typing Indicator */}
          {sendMessageMutation.isPending && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-500 text-sm">🤖</span>
              </div>
              <Card className="max-w-lg">
                <CardContent className="p-4">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="border-t border-slate-200 p-6">
          <form onSubmit={handleSendMessage} className="flex space-x-4">
            <div className="flex-1">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Schreiben Sie Ihre Nachricht..."
                disabled={sendMessageMutation.isPending || !currentSessionId}
                className="w-full"
              />
            </div>
            <Button 
              type="submit" 
              disabled={!message.trim() || sendMessageMutation.isPending || !currentSessionId}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <div className="flex justify-between items-center mt-3 text-sm text-slate-500">
            <span>Drücken Sie Enter zum Senden</span>
            <span>{messages?.length || 0} Nachrichten in diesem Gespräch</span>
          </div>
        </div>
      </div>
    </div>
  );
}
