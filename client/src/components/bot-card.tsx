import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Edit, Clock } from "lucide-react";
import { useLocation } from "wouter";
import type { Bot } from "@shared/schema";

interface BotCardProps {
  bot: Bot;
}

export default function BotCard({ bot }: BotCardProps) {
  const [, setLocation] = useLocation();

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

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Aktiv";
      case "draft":
        return "Entwurf";
      case "disabled":
        return "Deaktiviert";
      default:
        return status;
    }
  };

  const getBotIcon = (type: string) => {
    switch (type) {
      case "assistant":
        return "🤖";
      case "storyteller":
        return "📚";
      case "helper":
        return "🛠️";
      case "teacher":
        return "🎓";
      case "expert":
        return "💡";
      default:
        return "🤖";
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case "assistant":
        return "from-blue-400 to-blue-600";
      case "storyteller":
        return "from-purple-400 to-purple-600";
      case "helper":
        return "from-green-400 to-green-600";
      case "teacher":
        return "from-orange-400 to-orange-600";
      case "expert":
        return "from-indigo-400 to-indigo-600";
      default:
        return "from-gray-400 to-gray-600";
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 bg-gradient-to-br ${getIconColor(bot.type)} rounded-xl flex items-center justify-center`}>
            <span className="text-white text-xl">{getBotIcon(bot.type)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(bot.status)}>
              {getStatusText(bot.status)}
            </Badge>
            <Button variant="ghost" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <h4 className="text-lg font-semibold text-slate-900 mb-2">{bot.name}</h4>
        <p className="text-sm text-slate-600 mb-4 line-clamp-3">
          {bot.description || "Kein Beschreibung verfügbar."}
        </p>
        
        <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
          <span className="flex items-center">
            <MessageCircle className="mr-1 h-3 w-3" />
            {/* In a real app, this would come from chat statistics */}
            0 Gespräche
          </span>
          <span className="flex items-center">
            <Clock className="mr-1 h-3 w-3" />
            {bot.updatedAt ? `vor ${Math.floor((Date.now() - new Date(bot.updatedAt).getTime()) / (1000 * 60 * 60 * 24))} Tagen` : "Neu"}
          </span>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            className="flex-1"
            onClick={() => setLocation(`/bots/${bot.id}/chat`)}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Chat starten
          </Button>
          <Button 
            variant="outline"
            onClick={() => setLocation(`/bots/${bot.id}/edit`)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
