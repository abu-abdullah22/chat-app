import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MessageInputProps {
  onSendMessage: (text: string) => Promise<void>;
}

export function MessageInput({ onSendMessage }: MessageInputProps) {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea logic
  const handleInput = () => {
    const el = inputRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }
  };

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    try {
      await onSendMessage(trimmed);
      setText('');
      if (inputRef.current) {
        inputRef.current.style.height = 'auto'; // Reset height
        inputRef.current.focus();
      }
    } catch (err) {
      // Error handled by parent
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="p-4 bg-card border-t border-border flex items-end gap-2"
    >
      <textarea
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        disabled={isSending}
        rows={1}
        className="flex-1 max-h-[120px] min-h-[40px] resize-none rounded-2xl bg-muted px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      />
      <Button 
        type="submit" 
        size="icon" 
        disabled={!text.trim() || isSending}
        className="rounded-full h-10 w-10 shrink-0 mb-0.5"
      >
        {isSending ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Send className="h-5 w-5 -ml-0.5" />
        )}
      </Button>
    </form>
  );
}
