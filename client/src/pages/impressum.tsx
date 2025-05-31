import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function Impressum() {
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
            <h1 className="text-2xl font-bold">Impressum</h1>
            <p className="text-sm text-muted-foreground">Liebert IT - AI Bot Studio</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Impressum</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none">
            <h2>Angaben gemäß § 5 TMG</h2>
            <p>
              <strong>Liebert IT</strong><br />
              Lucas Liebert<br />
              [Ihre Adresse]<br />
              [PLZ Stadt]<br />
              Deutschland
            </p>

            <h2>Kontakt</h2>
            <p>
              E-Mail: <a href="mailto:lucas.liebert20@gmail.com" className="text-blue-600 hover:underline">
                lucas.liebert20@gmail.com
              </a>
            </p>

            <h2>Haftung für Inhalte</h2>
            <p>
              Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den 
              allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht 
              unter der Verpflichtung, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach 
              Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
            </p>

            <h2>Haftungsausschluss</h2>
            <p>
              Die Nutzung dieser AI Bot Studio Plattform erfolgt auf eigene Verantwortung. Wir übernehmen keine 
              Haftung für:
            </p>
            <ul>
              <li>Von Bots generierte Inhalte oder Antworten</li>
              <li>Schäden durch die Nutzung der erstellten Chatbots</li>
              <li>Datenverluste oder technische Ausfälle</li>
              <li>Indirekte oder Folgeschäden jeder Art</li>
            </ul>

            <h2>Urheberrecht</h2>
            <p>
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen 
              Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der 
              Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
            </p>

            <h2>Streitschlichtung</h2>
            <p>
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: 
              <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" 
                 className="text-blue-600 hover:underline">
                https://ec.europa.eu/consumers/odr/
              </a>
            </p>
            <p>
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer 
              Verbraucherschlichtungsstelle teilzunehmen.
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