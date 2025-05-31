import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import PersonalitySlider from "@/components/personality-slider";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

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
  status: z.string().default("active"),
});

type BotFormData = z.infer<typeof botSchema>;

export default function BotCreator() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
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

  const createBotMutation = useMutation({
    mutationFn: async (data: BotFormData) => {
      await apiRequest("POST", "/api/bots", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Bot created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bots"] });
      setLocation("/");
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
        description: "Failed to create bot. Please try again.",
        variant: "destructive",
      });
    },
  });

  const saveDraftMutation = useMutation({
    mutationFn: async (data: BotFormData) => {
      await apiRequest("POST", "/api/bots", { ...data, status: "draft" });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Bot saved as draft!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bots"] });
      setLocation("/");
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
        description: "Failed to save draft. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BotFormData) => {
    createBotMutation.mutate({ ...data, examples });
  };

  const onSaveDraft = () => {
    const data = form.getValues();
    saveDraftMutation.mutate({ ...data, examples });
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

  if (isLoading) {
    return <div>Loading...</div>;
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
              <div>
                <h1 className="text-xl font-bold text-slate-900">Bot erstellen</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={onSaveDraft}
                disabled={saveDraftMutation.isPending}
              >
                <Save className="mr-2 h-4 w-4" />
                Als Entwurf speichern
              </Button>
              <Button 
                onClick={form.handleSubmit(onSubmit)}
                disabled={createBotMutation.isPending}
              >
                Bot erstellen
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Creator Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Grundinformationen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bot Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="z.B. Dr. Health" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bot-Typ</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Bot-Typ auswählen" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="assistant">Assistent</SelectItem>
                            <SelectItem value="storyteller">Storyteller</SelectItem>
                            <SelectItem value="helper">Helfer</SelectItem>
                            <SelectItem value="teacher">Lehrbot</SelectItem>
                            <SelectItem value="expert">Fachexperte</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Beschreibung</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Beschreibe kurz, was dein Bot können soll..."
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="targetAudience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zielgruppe</FormLabel>
                      <FormControl>
                        <Input placeholder="z.B. Patienten, Studenten, Kinder..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Personality Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Persönlichkeit</CardTitle>
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

            {/* Capabilities */}
            <Card>
              <CardHeader>
                <CardTitle>Fähigkeiten</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="capabilities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Was soll der Bot können?</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Beschreibe die Fähigkeiten deines Bots...&#10;z.B. Medizinische Fragen beantworten, Symptome bewerten, Erste-Hilfe-Tipps geben"
                          className="min-h-[100px]"
                          {...field} 
                        />
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
                      <FormLabel>Wissensbasis</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Gib spezifisches Wissen für deinen Bot ein...&#10;z.B. Medizinische Grundlagen, häufige Krankheiten, Behandlungsmethoden"
                          className="min-h-[150px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Example Conversations */}
            <Card>
              <CardHeader>
                <CardTitle>Beispielgespräche</CardTitle>
                <p className="text-sm text-slate-600">Füge Beispielgespräche hinzu, um deinem Bot beizubringen, wie er antworten soll.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {examples.map((example, index) => (
                  <div key={index} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-slate-900">Beispiel {index + 1}</h4>
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
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Benutzer:</label>
                        <Input
                          placeholder="Beispielfrage des Benutzers"
                          value={example.userMessage}
                          onChange={(e) => updateExample(index, "userMessage", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Bot-Antwort:</label>
                        <Textarea
                          placeholder="Gewünschte Antwort des Bots"
                          value={example.botResponse}
                          onChange={(e) => updateExample(index, "botResponse", e.target.value)}
                          className="min-h-[60px]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={addExample}
                  className="w-full border-2 border-dashed"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Weiteres Beispiel hinzufügen
                </Button>
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>
    </div>
  );
}
