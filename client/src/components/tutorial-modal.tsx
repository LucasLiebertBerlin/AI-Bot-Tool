import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Bot, MessageSquare, Settings, Users } from "lucide-react";

interface TutorialStep {
  title: string;
  content: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: "Willkommen bei Liebert IT - AI Bot Studio",
    content: "Herzlich willkommen! Dieses Tutorial zeigt Ihnen, wie Sie Ihre eigenen KI-Chatbots erstellen und verwalten können. Lassen Sie uns gemeinsam die wichtigsten Funktionen entdecken.",
    icon: Bot,
  },
  {
    title: "Bot erstellen",
    content: "Klicken Sie auf 'Bot erstellen', um Ihren ersten Chatbot zu konfigurieren. Sie können den Namen, Typ, Zielgruppe und Persönlichkeit anpassen. Jeder Bot kann einzigartige Fähigkeiten haben.",
    icon: Bot,
  },
  {
    title: "Chat-Interface",
    content: "Nachdem Sie einen Bot erstellt haben, können Sie direkt mit ihm chatten. Das Chat-Interface zeigt Ihnen alle Unterhaltungen und ermöglicht natürliche Gespräche mit Ihrem Bot.",
    icon: MessageSquare,
  },
  {
    title: "Bot-Verwaltung",
    content: "In der Übersicht sehen Sie alle Ihre Bots. Sie können sie bearbeiten, löschen oder deren Einstellungen anpassen. Jeder Bot kann individuell konfiguriert werden.",
    icon: Settings,
  },
  {
    title: "Support und Kontakt",
    content: "Bei Fragen oder Problemen steht Ihnen unser Support-Team zur Verfügung. Nutzen Sie das Kontaktformular oder schreiben Sie uns direkt eine E-Mail.",
    icon: Users,
  },
];

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TutorialModal({ isOpen, onClose }: TutorialModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTutorial = () => {
    localStorage.setItem("tutorialCompleted", "true");
    onClose();
  };

  const completeTutorial = () => {
    localStorage.setItem("tutorialCompleted", "true");
    onClose();
  };

  const currentStepData = tutorialSteps[currentStep];
  const IconComponent = currentStepData.icon;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && skipTutorial()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <IconComponent className="h-5 w-5 text-blue-600" />
              Tutorial
            </DialogTitle>
            <Badge variant="secondary">
              {currentStep + 1} / {tutorialSteps.length}
            </Badge>
          </div>
        </DialogHeader>

        <div className="py-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <IconComponent className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{currentStepData.title}</h3>
            <p className="text-muted-foreground leading-relaxed">{currentStepData.content}</p>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-200 rounded-full h-2 mb-6">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
            />
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Zurück
            </Button>

            <Button
              variant="ghost"
              onClick={skipTutorial}
              className="text-muted-foreground hover:text-foreground"
            >
              Überspringen
            </Button>

            {currentStep === tutorialSteps.length - 1 ? (
              <Button onClick={completeTutorial} className="flex items-center gap-2">
                Tutorial beenden
              </Button>
            ) : (
              <Button onClick={nextStep} className="flex items-center gap-2">
                Weiter
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}