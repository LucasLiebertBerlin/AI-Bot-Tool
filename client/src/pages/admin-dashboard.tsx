import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User, Bot } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Trash2, Users, Bot as BotIcon, Shield, ArrowLeft, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deleteBotId, setDeleteBotId] = useState<number | null>(null);

  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: bots = [], isLoading: botsLoading } = useQuery<Bot[]>({
    queryKey: ["/api/admin/bots"],
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest("DELETE", `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Benutzer gelöscht",
        description: "Der Benutzer wurde erfolgreich entfernt.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteBotMutation = useMutation({
    mutationFn: async (botId: number) => {
      await apiRequest("DELETE", `/api/admin/bots/${botId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bots"] });
      toast({
        title: "Bot gelöscht",
        description: "Der Bot wurde erfolgreich entfernt.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const formatDate = (date: string | Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("de-DE");
  };

  const getUserBotCount = (userId: string) => {
    return bots.filter(bot => bot.userId === userId).length;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Zurück zum Dashboard
            </Button>
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Verwaltung aller Benutzer und Bots</p>
              </div>
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

      <div className="container mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Benutzer gesamt</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bots gesamt</CardTitle>
            <BotIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bots.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Bots</CardTitle>
            <BotIcon className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bots.filter(bot => bot.status === 'active').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">Benutzer</TabsTrigger>
          <TabsTrigger value="bots">Bots</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Benutzerverwaltung</CardTitle>
              <CardDescription>
                Alle registrierten Benutzer verwalten
              </CardDescription>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="text-center py-8">Lade Benutzer...</div>
              ) : (
                <div className="space-y-4">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{user.email}</h3>
                          {user.email?.includes("admin") && (
                            <Badge variant="secondary">Admin</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Name: {user.firstName || "-"} {user.lastName || "-"}</p>
                          <p>Registriert: {formatDate(user.createdAt)}</p>
                          <p>Bots: {getUserBotCount(user.id)}</p>
                        </div>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={user.email?.includes("admin")}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Benutzer löschen</AlertDialogTitle>
                            <AlertDialogDescription>
                              Sind Sie sicher, dass Sie den Benutzer "{user.email}" löschen möchten?
                              Diese Aktion kann nicht rückgängig gemacht werden.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteUserMutation.mutate(user.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Löschen
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bots" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bot-Verwaltung</CardTitle>
              <CardDescription>
                Alle erstellten Bots verwalten
              </CardDescription>
            </CardHeader>
            <CardContent>
              {botsLoading ? (
                <div className="text-center py-8">Lade Bots...</div>
              ) : (
                <div className="space-y-4">
                  {bots.map((bot) => {
                    const owner = users.find(u => u.id === bot.userId);
                    return (
                      <div
                        key={bot.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{bot.name}</h3>
                            <Badge variant={bot.status === 'active' ? 'default' : 'secondary'}>
                              {bot.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>Besitzer: {owner?.email || "Unbekannt"}</p>
                            <p>Typ: {bot.type}</p>
                            <p>Erstellt: {formatDate(bot.createdAt)}</p>
                            {bot.description && (
                              <p className="truncate max-w-md">Beschreibung: {bot.description}</p>
                            )}
                          </div>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Bot löschen</AlertDialogTitle>
                              <AlertDialogDescription>
                                Sind Sie sicher, dass Sie den Bot "{bot.name}" löschen möchten?
                                Diese Aktion kann nicht rückgängig gemacht werden.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteBotMutation.mutate(bot.id)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Löschen
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}