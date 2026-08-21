'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Conversation } from '@/lib/api';
import { NewChatDialog } from '@/components/chat/NewChatDialog';
import { NewGroupDialog } from '@/components/chat/NewGroupDialog';
import { MessageSquarePlus, Users, LogOut } from 'lucide-react';

export default function ChatPage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 flex-shrink-0 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
          <h2 className="font-semibold text-lg truncate">Chats</h2>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" title="New Group" onClick={() => setIsNewGroupOpen(true)}>
              <Users className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" title="New Chat" onClick={() => setIsNewChatOpen(true)}>
              <MessageSquarePlus className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" title="Logout" onClick={logout} className="ml-1 text-muted-foreground hover:text-destructive">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="flex-1 p-4 text-center text-sm text-muted-foreground flex items-center justify-center">
          Conversations list will go here (Stage 4)
        </div>

        <NewChatDialog 
          open={isNewChatOpen} 
          onOpenChange={setIsNewChatOpen} 
          onConversationStart={(conv) => setCurrentConversation(conv)} 
        />
        
        <NewGroupDialog 
          open={isNewGroupOpen} 
          onOpenChange={setIsNewGroupOpen} 
          onConversationStart={(conv) => setCurrentConversation(conv)} 
        />
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col">
        {currentConversation ? (
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-border bg-card">
              <h3 className="font-semibold text-lg">
                {currentConversation.name || 
                  (currentConversation.participants
                    .map(p => typeof p === 'object' && p !== null && 'name' in p ? p.name : null)
                    .filter(Boolean).join(', ') || 'Direct Message')
                }
              </h3>
            </div>
            <div className="flex-1 p-8 flex items-center justify-center text-muted-foreground bg-muted/10">
              Message history will go here (Stage 4/5)
            </div>
          </div>
        ) : (
          <div className="flex-1 p-8 flex flex-col items-center justify-center text-muted-foreground bg-muted/10">
            <div className="max-w-md text-center space-y-4">
              <h1 className="text-2xl font-bold text-foreground">Welcome, {user.name}!</h1>
              <p>Search for a user on the left to start a new conversation, or select an existing chat.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
