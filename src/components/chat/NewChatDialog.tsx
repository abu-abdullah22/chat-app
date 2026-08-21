'use client';

import { useState, useEffect } from 'react';
import { Search, AlertCircle, Loader2, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { searchUsers, startConversation, User, Conversation } from '@/lib/api';
import { useDebounce } from '@/hooks/useDebounce';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConversationStart: (conversation: Conversation) => void;
}

export function NewChatDialog({ open, onOpenChange, onConversationStart }: NewChatDialogProps) {
  const { token, user: currentUser } = useAuth();
  
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);
  
  const [results, setResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startingUserId, setStartingUserId] = useState<string | null>(null);

  // Capitalize first letter to work around case-sensitive API backend
  const formattedQuery = debouncedQuery 
    ? debouncedQuery.charAt(0).toUpperCase() + debouncedQuery.slice(1) 
    : '';

  useEffect(() => {
    if (!formattedQuery.trim()) {
      const clearResults = async () => setResults([]);
      clearResults();
      return;
    }

    let isMounted = true;

    const performSearch = async () => {
      setIsSearching(true);
      setError(null);
      
      try {
        const users = await searchUsers(formattedQuery, token as string);
        if (isMounted) {
          setResults(users.filter(u => u._id !== currentUser?._id));
        }
      } catch (err: unknown) {
        if (isMounted) setError(err instanceof Error ? err.message : 'Failed to search');
      } finally {
        if (isMounted) setIsSearching(false);
      }
    };

    performSearch();

    return () => {
      isMounted = false;
    };
  }, [formattedQuery, token, currentUser?._id]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      const resetDialog = async () => {
        setQuery('');
        setResults([]);
        setError(null);
      };
      resetDialog();
    }
  }, [open]);

  const handleStartConversation = async (user: User) => {
    if (startingUserId || !token) return;
    
    setStartingUserId(user._id);
    setError(null);
    try {
      const conversation = await startConversation(user._id, token);
      if (conversation.type === 'direct' && !conversation.participant) {
        conversation.participant = user;
      }
      onConversationStart(conversation);
      onOpenChange(false); // Close dialog
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to start conversation');
    } finally {
      setStartingUserId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md gap-0 p-0 overflow-hidden bg-card border border-border">
        <DialogHeader className="p-4 border-b border-border bg-muted/30">
          <DialogTitle>New Chat</DialogTitle>
          <DialogDescription className="sr-only">
            Search for a user to start a conversation
          </DialogDescription>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search users..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 bg-background"
              autoFocus
            />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto max-h-[300px] min-h-[100px]">
          {isSearching && (
            <div className="flex items-center justify-center p-8 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}

          {error && (
            <div className="p-4 m-2 rounded-md bg-destructive/10 text-destructive text-sm flex items-start gap-2">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {!isSearching && formattedQuery && results.length === 0 && !error && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No users found matching &quot;{query}&quot;.
            </div>
          )}
          
          {!isSearching && !formattedQuery && !error && results.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Type a name to search for users...
            </div>
          )}

          {!isSearching && results.length > 0 && (
            <div className="flex flex-col gap-1 p-2">
              {results.map((user) => (
                <button
                  key={user._id}
                  onClick={() => handleStartConversation(user)}
                  disabled={startingUserId !== null}
                  className="w-full text-left flex items-center gap-3 p-3 rounded-md transition-colors hover:bg-muted focus:bg-muted focus:outline-none disabled:opacity-70"
                >
                  <Avatar className="h-10 w-10 border border-border">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <UserIcon className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.phone}</p>
                  </div>
                  {startingUserId === user._id && (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
