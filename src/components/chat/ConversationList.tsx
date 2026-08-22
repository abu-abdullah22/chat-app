import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getConversations, Conversation } from '@/lib/api';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, UserIcon, Loader2, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ConversationListProps {
  currentConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  // triggerRefresh can be used by the parent to force a refetch when a new chat is created
  triggerRefresh?: number; 
}

export function ConversationList({ currentConversation, onSelectConversation, triggerRefresh = 0 }: ConversationListProps) {
  const { token } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    const fetchConversations = async (showLoading = true) => {
      if (showLoading) setIsLoading(true);
      if (showLoading) setError(null);
      try {
        const data = await getConversations(token);
        if (isMounted) {
          // Sort by updatedAt descending
          const sorted = data.sort((a, b) => {
            const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
            const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
            return dateB - dateA;
          });
          setConversations(sorted);
        }
      } catch (err: unknown) {
        if (isMounted && showLoading) {
          setError(err instanceof Error ? err.message : 'Failed to load conversations');
        }
      } finally {
        if (isMounted && showLoading) setIsLoading(false);
      }
    };

    fetchConversations(true);

    const intervalId = setInterval(() => {
      fetchConversations(false);
    }, 5000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [token, triggerRefresh]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 m-4 rounded-md bg-destructive/10 text-destructive text-sm flex items-start gap-2">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <p>{error}</p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-sm text-muted-foreground">
        <p>No active conversations.</p>
        <p className="mt-1">Click the icons above to start a chat!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex flex-col gap-1 p-2">
        {conversations.map((conv) => {
          const isSelected = currentConversation?._id === conv._id;
          
          let name = 'Unknown';
          let subtitle = '';
          let icon = <UserIcon className="h-5 w-5" />;
          
          if (conv.type === 'group') {
            name = conv.name || 'Unnamed Group';
            subtitle = `${conv.participants?.length || 0} members`;
            icon = <Users className="h-5 w-5" />;
          } else if (conv.type === 'direct' || !conv.type) {
            // direct
            name = conv.participant?.name || 'Direct Message';
            subtitle = conv.participant?.phone || '';
          }

          const timeString = conv.updatedAt || conv.createdAt 
            ? formatDistanceToNow(new Date(conv.updatedAt || conv.createdAt!), { addSuffix: true }) 
            : '';

          return (
            <button
              key={conv._id}
              onClick={() => onSelectConversation(conv)}
              className={`w-full text-left flex items-start gap-3 p-3 rounded-md transition-colors hover:bg-muted focus:bg-muted focus:outline-none ${
                isSelected ? 'bg-muted/80 ring-1 ring-primary/20' : ''
              }`}
            >
              <Avatar className="h-10 w-10 border border-border shrink-0 mt-0.5">
                <AvatarFallback className={conv.type === 'group' ? 'bg-secondary text-secondary-foreground' : 'bg-primary/10 text-primary'}>
                  {icon}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline gap-2">
                  <p className={`font-medium text-sm truncate ${isSelected ? 'text-foreground' : 'text-foreground/90'}`}>
                    {name}
                  </p>
                  {timeString && (
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                      {timeString}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {conv.lastMessage?.text || subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
