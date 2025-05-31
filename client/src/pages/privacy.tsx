import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function Privacy() {
  const [, setLocation] = useLocation();

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
            Zurück
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Datenschutzerklärung</h1>
            <p className="text-sm text-muted-foreground">Liebert IT - AI Bot Studio</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Datenschutzerklärung</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none">
            <h2>1. Verantwortlicher</h2>
            <p>
              Verantwortlicher für die Datenverarbeitung auf dieser Website ist:<br />
              <strong>Liebert IT</strong><br />
              E-Mail: lucas.liebert20@gmail.com
            </p>

            <h2>2. Erfassung und Verarbeitung personenbezogener Daten</h2>
            <p>
              Wir erheben und verarbeiten personenbezogene Daten nur in dem Umfang, 
              wie dies für die Bereitstellung unserer Dienste erforderlich ist.
            </p>

            <h3>2.1 Registrierung und Nutzung</h3>
            <p>Bei der Registrierung erfassen wir:</p>
            <ul>
              <li>E-Mail-Adresse</li>
              <li>Passwort (verschlüsselt gespeichert)</li>
              <li>Optional: Vor- und Nachname</li>
            </ul>

            <h3>2.2 Bot-Erstellung und Chat-Daten</h3>
            <p>Bei der Nutzung des Services speichern wir:</p>
            <ul>
              <li>Erstellte Bot-Konfigurationen</li>
              <li>Chat-Verläufe mit den Bots</li>
              <li>Nutzungsstatistiken</li>
            </ul>

            <h2>3. Rechtsgrundlage der Verarbeitung</h2>
            <p>
              Die Verarbeitung Ihrer personenbezogenen Daten erfolgt auf Grundlage von 
              Art. 6 Abs. 1 lit. b DSGVO zur Vertragserfüllung und lit. f DSGVO 
              zur Wahrung berechtigter Interessen.
            </p>

            <h2>4. Datensicherheit</h2>
            <p>
              Wir verwenden angemessene technische und organisatorische Maßnahmen, 
              um Ihre Daten vor unbefugtem Zugriff, Verlust oder Missbrauch zu schützen.
            </p>

            <h2>5. Ihre Rechte</h2>
            <p>Sie haben folgende Rechte bezüglich Ihrer personenbezogenen Daten:</p>
            <ul>
              <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
              <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
              <li>Recht auf Löschung (Art. 17 DSGVO)</li>
              <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
              <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
              <li>Widerspruchsrecht (Art. 21 DSGVO)</li>
            </ul>

            <h2>6. Kontakt</h2>
            <p>
              Bei Fragen zum Datenschutz kontaktieren Sie uns unter: 
              <a href="mailto:lucas.liebert20@gmail.com" className="text-blue-600 hover:underline">
                lucas.liebert20@gmail.com
              </a>
            </p>

            <h2>7. Änderungen der Datenschutzerklärung</h2>
            <p>
              Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf zu aktualisieren. 
              Die aktuelle Version ist stets auf unserer Website verfügbar.
            </p>

            <p className="text-sm text-gray-600 mt-8">
              Stand: {new Date().toLocaleDateString('de-DE')}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}