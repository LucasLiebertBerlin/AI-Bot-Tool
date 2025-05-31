import { Card, CardContent } from "@/components/ui/card";
import type { ChatMessage } from "@shared/schema";

interface ChatMessageProps {
  message: ChatMessage;
  isUser: boolean;
  botName: string;
}

export default function ChatMessage({ message, isUser, botName }: ChatMessageProps) {
  const formatTime = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return "gerade eben";
    } else if (diffInMinutes < 60) {
      return `vor ${diffInMinutes} Min.`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `vor ${hours} Std.`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (isUser) {
    return (
      <div className="flex items-start space-x-3 justify-end">
        <Card className="max-w-lg bg-blue-600 text-white">
          <CardContent className="p-4">
            <p>{message.content}</p>
            <span className="text-xs text-blue-100 mt-2 block">
              {message.createdAt ? formatTime(message.createdAt) : "gerade eben"}
            </span>
          </CardContent>
        </Card>
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-medium">U</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start space-x-3">
      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-blue-500 text-sm">🤖</span>
      </div>
      <Card className="max-w-lg">
        <CardContent className="p-4">
          <p className="text-slate-900 whitespace-pre-wrap">{message.content}</p>
          <span className="text-xs text-slate-500 mt-2 block">
            {message.createdAt ? formatTime(message.createdAt) : "gerade eben"}
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
