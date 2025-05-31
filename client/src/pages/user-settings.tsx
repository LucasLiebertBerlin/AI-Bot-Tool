import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ArrowLeft, User, Globe, Trash2, Shield, Key, Bell } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function UserSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [language, setLanguage] = useState("de");
  const [theme, setTheme] = useState("light");
  const [emailNotifications, setEmailNotifications] = useState(true);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", "/api/user/profile", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profil aktualisiert",
        description: "Ihre Profileinstellungen wurden erfolgreich gespeichert.",
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

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/user/account");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Account gelöscht",
        description: "Ihr Account wurde erfolgreich gelöscht.",
      });
      window.location.href = "/";
    },
    onError: (error: Error) => {
      toast({
        title: "Fehler beim Löschen",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      language,
      theme,
      emailNotifications,
    };
    updateProfileMutation.mutate(data);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="container mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück zum Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Benutzereinstellungen</h1>
            <p className="text-sm text-muted-foreground">Verwalten Sie Ihr Profil und Ihre Einstellungen</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 max-w-4xl">
        <div className="grid gap-6">
          {/* Profil Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profil Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Vorname</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      defaultValue={user.firstName || ""}
                      placeholder="Ihr Vorname"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nachname</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      defaultValue={user.lastName || ""}
                      placeholder="Ihr Nachname"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">E-Mail-Adresse</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={user.email || ""}
                    placeholder="ihre.email@beispiel.de"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={updateProfileMutation.isPending}
                  className="w-full md:w-auto"
                >
                  {updateProfileMutation.isPending ? "Wird gespeichert..." : "Profil speichern"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Sprach- und Anzeigeeinstellungen */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Sprach- und Anzeigeeinstellungen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="language">Sprache</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Wählen Sie eine Sprache" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="theme">Design</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger>
                    <SelectValue placeholder="Wählen Sie ein Design" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Hell</SelectItem>
                    <SelectItem value="dark">Dunkel</SelectItem>
                    <SelectItem value="system">System-Einstellung</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Benachrichtigungseinstellungen */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Benachrichtigungen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>E-Mail Benachrichtigungen</Label>
                  <p className="text-sm text-muted-foreground">
                    Erhalten Sie Updates über neue Features und wichtige Informationen
                  </p>
                </div>
                <Button
                  variant={emailNotifications ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEmailNotifications(!emailNotifications)}
                >
                  {emailNotifications ? "Aktiviert" : "Deaktiviert"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Benutzer-ID</Label>
                  <p className="text-sm text-muted-foreground font-mono">
                    {user.id}
                  </p>
                </div>
                <Badge variant="secondary">Aktiv</Badge>
              </div>

              <div>
                <Label>Mitglied seit</Label>
                <p className="text-sm text-muted-foreground">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('de-DE') : 'Unbekannt'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Passwort ändern */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Sicherheit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Passwort ändern</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Ändern Sie regelmäßig Ihr Passwort für optimale Sicherheit
                </p>
                <Button variant="outline">
                  Passwort ändern
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                Gefahrenbereich
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-red-600">Account löschen</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  <strong>Warnung:</strong> Diese Aktion kann nicht rückgängig gemacht werden. 
                  Alle Ihre Bots, Chat-Verläufe und Daten werden permanent gelöscht.
                </p>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      Account permanent löschen
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Account wirklich löschen?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Diese Aktion kann nicht rückgängig gemacht werden. Alle Ihre Daten, 
                        einschließlich Bots und Chat-Verläufe, werden permanent gelöscht.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => deleteAccountMutation.mutate()}
                        disabled={deleteAccountMutation.isPending}
                      >
                        {deleteAccountMutation.isPending ? "Wird gelöscht..." : "Ja, Account löschen"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}