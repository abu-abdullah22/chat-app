import { useEffect, useRef } from 'react';
import { Message } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface MessageHistoryProps {
  messages: Message[];
  currentUserId: string;
  isLoading: boolean;
  error: string | null;
}

export function MessageHistory({ messages, currentUserId, isLoading, error }: MessageHistoryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-muted/10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground mt-4">Loading messages...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-muted/10">
        <div className="p-4 rounded-md bg-destructive/10 text-destructive text-sm max-w-md text-center">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-muted/10 text-muted-foreground">
        <p>No messages yet.</p>
        <p className="mt-1 text-sm">Send a message to start the conversation!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10" ref={scrollRef}>
      {messages.map((msg) => {
        const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
        const senderName = typeof msg.sender === 'object' ? msg.sender.name : 'Unknown';
        const isMe = senderId === currentUserId;

        return (
          <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-full`}>
            {!isMe && (
              <span className="text-xs text-muted-foreground mb-1 ml-1">{senderName}</span>
            )}
            <div
              className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-2 ${
                isMe
                  ? 'bg-primary text-primary-foreground rounded-br-sm'
                  : 'bg-card text-foreground border border-border shadow-sm rounded-bl-sm'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
            </div>
            <span className="text-[10px] text-muted-foreground mt-1 mx-1">
              {format(new Date(msg.createdAt), 'h:mm a')}
            </span>
          </div>
        );
      })}
    </div>
  );
}
