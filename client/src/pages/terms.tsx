import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function Terms() {
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
            <h1 className="text-2xl font-bold">Allgemeine Geschäftsbedingungen</h1>
            <p className="text-sm text-muted-foreground">Liebert IT - AI Bot Studio</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Allgemeine Geschäftsbedingungen (AGB)</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none">
            <h2>§ 1 Geltungsbereich</h2>
            <p>
              Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Leistungen der 
              Liebert IT im Bereich des AI Bot Studios. Mit der Nutzung der Plattform 
              erkennen Sie diese Bedingungen an.
            </p>

            <h2>§ 2 Leistungsbeschreibung</h2>
            <p>
              Liebert IT stellt eine Plattform zur Verfügung, mit der Nutzer eigene AI-Chatbots 
              erstellen, konfigurieren und verwalten können. Die Plattform umfasst:
            </p>
            <ul>
              <li>Bot-Erstellung und -Konfiguration</li>
              <li>Chat-Interface für Bot-Interaktionen</li>
              <li>Verwaltungsfunktionen für erstellte Bots</li>
              <li>Grundlegende Analysefunktionen</li>
            </ul>

            <h2>§ 3 Registrierung und Nutzerkonto</h2>
            <p>
              Für die Nutzung der Plattform ist eine Registrierung erforderlich. 
              Der Nutzer verpflichtet sich, wahrheitsgemäße Angaben zu machen und 
              sein Passwort geheim zu halten.
            </p>

            <h2>§ 4 Haftungsausschluss</h2>
            <p>
              <strong>WICHTIGER HINWEIS:</strong> Die Nutzung der Plattform erfolgt ausschließlich 
              auf eigene Verantwortung und eigenes Risiko. Liebert IT schließt jegliche Haftung aus für:
            </p>
            <ul>
              <li>Von AI-Bots generierte Inhalte, Aussagen oder Empfehlungen</li>
              <li>Schäden, die durch die Nutzung der erstellten Bots entstehen</li>
              <li>Datenverluste oder technische Ausfälle</li>
              <li>Direkte, indirekte oder Folgeschäden jeder Art</li>
              <li>Geschäftsverluste oder entgangene Gewinne</li>
              <li>Rechtsverletzungen durch Bot-Inhalte</li>
            </ul>

            <h2>§ 5 Verantwortung des Nutzers</h2>
            <p>Der Nutzer ist vollständig verantwortlich für:</p>
            <ul>
              <li>Die Konfiguration und das Training seiner Bots</li>
              <li>Die Inhalte und Aussagen seiner Bots</li>
              <li>Die Einhaltung geltender Gesetze bei der Bot-Nutzung</li>
              <li>Die Überprüfung von Bot-Antworten vor deren Verwendung</li>
            </ul>

            <h2>§ 6 Verbotene Nutzung</h2>
            <p>Folgende Nutzungen sind untersagt:</p>
            <ul>
              <li>Erstellung von Bots mit illegalen oder schädlichen Inhalten</li>
              <li>Verwendung für Spam, Betrug oder andere rechtswidrige Zwecke</li>
              <li>Verletzung von Urheberrechten oder anderen Rechten Dritter</li>
              <li>Umgehung von Sicherheitsmaßnahmen</li>
            </ul>

            <h2>§ 7 Verfügbarkeit</h2>
            <p>
              Eine ständige Verfügbarkeit der Plattform wird nicht garantiert. 
              Wartungsarbeiten können zu temporären Unterbrechungen führen.
            </p>

            <h2>§ 8 Beendigung</h2>
            <p>
              Beide Parteien können die Nutzung jederzeit ohne Angabe von Gründen beenden. 
              Bei Verstößen gegen diese AGB kann der Zugang sofort gesperrt werden.
            </p>

            <h2>§ 9 Änderungen der AGB</h2>
            <p>
              Liebert IT behält sich vor, diese AGB jederzeit zu ändern. 
              Nutzer werden über Änderungen informiert.
            </p>

            <h2>§ 10 Schlussbestimmungen</h2>
            <p>
              Es gilt deutsches Recht. Sollten einzelne Bestimmungen unwirksam sein, 
              bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.
            </p>

            <h2>§ 11 Kontakt</h2>
            <p>
              Bei Fragen zu diesen AGB wenden Sie sich an: 
              <a href="mailto:lucas.liebert20@gmail.com" className="text-blue-600 hover:underline">
                lucas.liebert20@gmail.com
              </a>
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