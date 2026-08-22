'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Conversation, Message, getMessages, sendMessage } from '@/lib/api';
import { NewChatDialog } from '@/components/chat/NewChatDialog';
import { NewGroupDialog } from '@/components/chat/NewGroupDialog';
import { ConversationList } from '@/components/chat/ConversationList';
import { MessageHistory } from '@/components/chat/MessageHistory';
import { MessageInput } from '@/components/chat/MessageInput';
import { MessageSquarePlus, Users, LogOut } from 'lucide-react';

export default function ChatPage() {
  const { user, logout, isLoading, token } = useAuth();
  const router = useRouter();
  
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Messages State
  const [messages, setMessages] = useState<Message[]>([]);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!currentConversation || !token) return;

    let isMounted = true;
    const fetchConversationMessages = async (showLoading = true) => {
      if (showLoading) setIsMessagesLoading(true);
      if (showLoading) setMessagesError(null);
      try {
        const data = await getMessages(currentConversation._id, token);
        if (isMounted) {
          // Sort messages chronologically (oldest first, newest at the bottom)
          const messagesArray = data.messages || [];
          const sortedMessages = [...messagesArray].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          setMessages(sortedMessages);
        }
      } catch (err: unknown) {
        if (isMounted && showLoading) {
          setMessagesError(err instanceof Error ? err.message : 'Failed to load messages');
        }
      } finally {
        if (isMounted && showLoading) {
          setIsMessagesLoading(false);
        }
      }
    };

    fetchConversationMessages(true);

    const intervalId = setInterval(() => {
      fetchConversationMessages(false);
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [currentConversation, token]);

  if (isLoading || !user || !token) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleConversationStart = (conv: Conversation) => {
    setCurrentConversation(conv);
    setRefreshKey(prev => prev + 1);
  };

  const handleSendMessage = async (text: string) => {
    if (!currentConversation) return;
    try {
      const newMsg = await sendMessage(currentConversation._id, text, token);
      setMessages(prev => [...prev, newMsg]);
      // Also trigger conversation list refresh so the lastMessage and updatedAt update!
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

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
        
        <ConversationList 
          currentConversation={currentConversation} 
          onSelectConversation={setCurrentConversation} 
          triggerRefresh={refreshKey}
        />

        <NewChatDialog 
          open={isNewChatOpen} 
          onOpenChange={setIsNewChatOpen} 
          onConversationStart={handleConversationStart} 
        />
        
        <NewGroupDialog 
          open={isNewGroupOpen} 
          onOpenChange={setIsNewGroupOpen} 
          onConversationStart={handleConversationStart} 
        />
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {currentConversation ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border bg-card shrink-0">
              <h3 className="font-semibold text-lg truncate">
                {currentConversation.type === 'group'
                  ? currentConversation.name
                  : (currentConversation.participant?.name || 'Direct Message')
                }
              </h3>
            </div>
            
            <MessageHistory 
              conversationId={currentConversation._id}
              messages={messages}
              currentUserId={user._id}
              isLoading={isMessagesLoading}
              error={messagesError}
            />

            <MessageInput onSendMessage={handleSendMessage} />
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
