import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, MessageCircle, Download, History, Plus, Trash2 } from "lucide-react";
import PersonalitySlider from "@/components/personality-slider";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Bot } from "@shared/schema";

const botSchema = z.object({
  name: z.string().min(1, "Bot name is required"),
  description: z.string().optional(),
  type: z.string().min(1, "Bot type is required"),
  targetAudience: z.string().optional(),
  capabilities: z.string().optional(),
  knowledgeBase: z.string().optional(),
  personality: z.object({
    friendliness: z.number().min(1).max(10),
    humor: z.number().min(1).max(10),
    formality: z.number().min(1).max(10),
    detailLevel: z.number().min(1).max(10),
  }),
  examples: z.array(z.object({
    userMessage: z.string(),
    botResponse: z.string(),
  })),
  status: z.string(),
});

type BotFormData = z.infer<typeof botSchema>;

export default function BotEditor() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams();
  const queryClient = useQueryClient();
  const botId = parseInt(params.id);
  const [examples, setExamples] = useState<{ userMessage: string; botResponse: string }[]>([]);

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

  const form = useForm<BotFormData>({
    resolver: zodResolver(botSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "assistant",
      targetAudience: "",
      capabilities: "",
      knowledgeBase: "",
      personality: {
        friendliness: 7,
        humor: 4,
        formality: 6,
        detailLevel: 5,
      },
      examples: [],
      status: "active",
    },
  });

  // Update form when bot data loads
  useEffect(() => {
    if (bot) {
      form.reset({
        name: bot.name,
        description: bot.description || "",
        type: bot.type,
        targetAudience: bot.targetAudience || "",
        capabilities: bot.capabilities || "",
        knowledgeBase: bot.knowledgeBase || "",
        personality: bot.personality || {
          friendliness: 7,
          humor: 4,
          formality: 6,
          detailLevel: 5,
        },
        examples: bot.examples || [],
        status: bot.status,
      });
      setExamples(bot.examples || []);
    }
  }, [bot, form]);

  const updateBotMutation = useMutation({
    mutationFn: async (data: BotFormData) => {
      await apiRequest("PUT", `/api/bots/${botId}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Bot updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bots"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bots", botId] });
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
        description: "Failed to update bot. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BotFormData) => {
    updateBotMutation.mutate({ ...data, examples });
  };

  const addExample = () => {
    setExamples([...examples, { userMessage: "", botResponse: "" }]);
  };

  const removeExample = (index: number) => {
    setExamples(examples.filter((_, i) => i !== index));
  };

  const updateExample = (index: number, field: "userMessage" | "botResponse", value: string) => {
    const updated = [...examples];
    updated[index][field] = value;
    setExamples(updated);
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
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-500 text-sm">🤖</span>
                </div>
                <span className="text-xl font-bold text-slate-900">{bot.name} bearbeiten</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => setLocation(`/bots/${botId}/chat`)}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Bot testen
              </Button>
              <Button 
                onClick={form.handleSubmit(onSubmit)}
                disabled={updateBotMutation.isPending}
              >
                <Save className="mr-2 h-4 w-4" />
                Änderungen speichern
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Editor Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Bot Settings */}
          <div className="lg:col-span-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <Tabs defaultValue="basics" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="basics">Grundlagen</TabsTrigger>
                    <TabsTrigger value="personality">Persönlichkeit</TabsTrigger>
                    <TabsTrigger value="knowledge">Wissensbasis</TabsTrigger>
                    <TabsTrigger value="examples">Beispiele</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basics">
                    <Card>
                      <CardHeader>
                        <CardTitle>Grundeinstellungen</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Beschreibung</FormLabel>
                              <FormControl>
                                <Textarea className="min-h-[80px]" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="active">Aktiv</SelectItem>
                                  <SelectItem value="draft">Entwurf</SelectItem>
                                  <SelectItem value="disabled">Deaktiviert</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="personality">
                    <Card>
                      <CardHeader>
                        <CardTitle>Persönlichkeitsmerkmale</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <FormField
                          control={form.control}
                          name="personality.friendliness"
                          render={({ field }) => (
                            <PersonalitySlider
                              label="Freundlichkeit"
                              value={field.value}
                              onChange={field.onChange}
                              min="Sachlich"
                              max="Sehr freundlich"
                            />
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="personality.humor"
                          render={({ field }) => (
                            <PersonalitySlider
                              label="Humor"
                              value={field.value}
                              onChange={field.onChange}
                              min="Ernst"
                              max="Humorvoll"
                            />
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="personality.formality"
                          render={({ field }) => (
                            <PersonalitySlider
                              label="Formalität"
                              value={field.value}
                              onChange={field.onChange}
                              min="Locker"
                              max="Sehr formal"
                            />
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="personality.detailLevel"
                          render={({ field }) => (
                            <PersonalitySlider
                              label="Detailgrad"
                              value={field.value}
                              onChange={field.onChange}
                              min="Kurz"
                              max="Sehr detailliert"
                            />
                          )}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="knowledge">
                    <Card>
                      <CardHeader>
                        <CardTitle>Wissensbasis</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="capabilities"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fähigkeiten</FormLabel>
                              <FormControl>
                                <Textarea className="min-h-[100px]" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="knowledgeBase"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Spezialwissen</FormLabel>
                              <FormControl>
                                <Textarea className="min-h-[150px]" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="examples">
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle>Trainingsdaten</CardTitle>
                          <Button type="button" onClick={addExample}>
                            <Plus className="mr-2 h-4 w-4" />
                            Beispiel hinzufügen
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {examples.map((example, index) => (
                          <div key={index} className="border rounded-lg p-4 bg-slate-50">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-sm font-medium text-slate-600">Beispiel {index + 1}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeExample(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="space-y-2">
                              <div>
                                <span className="text-xs font-medium text-slate-600">Benutzer:</span>
                                <Input
                                  value={example.userMessage}
                                  onChange={(e) => updateExample(index, "userMessage", e.target.value)}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <span className="text-xs font-medium text-slate-600">Bot:</span>
                                <Textarea
                                  value={example.botResponse}
                                  onChange={(e) => updateExample(index, "botResponse", e.target.value)}
                                  className="mt-1 min-h-[60px]"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {examples.length === 0 && (
                          <div className="text-center py-8 text-slate-500">
                            Noch keine Beispiele hinzugefügt. Klicken Sie auf "Beispiel hinzufügen", um zu beginnen.
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </form>
            </Form>
          </div>

          {/* Right: Bot Preview & Stats */}
          <div className="space-y-6">
            {/* Bot Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bot-Vorschau</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <h4 className="font-semibold text-slate-900">{bot.name}</h4>
                  <p className="text-sm text-slate-600 mt-1">{bot.type}</p>
                  <Badge className={`mt-2 ${getStatusColor(bot.status)}`}>
                    {bot.status === "active" ? "Aktiv" : bot.status === "draft" ? "Entwurf" : "Deaktiviert"}
                  </Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Freundlichkeit:</span>
                    <div className="flex space-x-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${
                            i < Math.ceil((bot.personality?.friendliness || 5) / 2)
                              ? "bg-blue-500"
                              : "bg-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Formalität:</span>
                    <div className="flex space-x-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${
                            i < Math.ceil((bot.personality?.formality || 5) / 2)
                              ? "bg-blue-500"
                              : "bg-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Statistiken</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Erstellt:</span>
                    <span className="font-semibold text-slate-900">
                      {bot.createdAt ? new Date(bot.createdAt).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Letzte Änderung:</span>
                    <span className="font-semibold text-slate-900">
                      {bot.updatedAt ? new Date(bot.updatedAt).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Schnellaktionen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    className="w-full" 
                    onClick={() => setLocation(`/bots/${botId}/chat`)}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Bot testen
                  </Button>
                  <Button variant="outline" className="w-full">
                    <History className="mr-2 h-4 w-4" />
                    Chat-Verlauf
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Bot exportieren
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
