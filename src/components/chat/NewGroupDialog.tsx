'use client';

import { useState, useEffect } from 'react';
import { Search, AlertCircle, Loader2, User as UserIcon, Check, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { searchUsers, createGroupConversation, User, Conversation } from '@/lib/api';
import { useDebounce } from '@/hooks/useDebounce';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface NewGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConversationStart: (conversation: Conversation) => void;
}

export function NewGroupDialog({ open, onOpenChange, onConversationStart }: NewGroupDialogProps) {
  const { token, user: currentUser } = useAuth();
  
  const [groupName, setGroupName] = useState('');
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);
  
  const [results, setResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        setGroupName('');
        setQuery('');
        setResults([]);
        setSelectedUsers([]);
        setError(null);
      };
      resetDialog();
    }
  }, [open]);

  const toggleUser = (user: User) => {
    setSelectedUsers(prev => {
      if (prev.find(u => u._id === user._id)) {
        return prev.filter(u => u._id !== user._id);
      }
      return [...prev, user];
    });
  };

  const handleCreateGroup = async () => {
    if (isCreating || !token || !groupName.trim() || selectedUsers.length === 0) return;
    
    setIsCreating(true);
    setError(null);
    try {
      const participantIds = selectedUsers.map(u => u._id);
      const conversation = await createGroupConversation(groupName.trim(), participantIds, token);
      onConversationStart(conversation);
      onOpenChange(false); // Close dialog
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create group');
    } finally {
      setIsCreating(false);
    }
  };

  const removeSelected = (userId: string) => {
    setSelectedUsers(prev => prev.filter(u => u._id !== userId));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md gap-0 p-0 overflow-hidden bg-card border border-border flex flex-col max-h-[90vh]">
        <DialogHeader className="p-4 border-b border-border bg-muted/30">
          <DialogTitle>New Group</DialogTitle>
          <DialogDescription className="sr-only">
            Create a new group conversation
          </DialogDescription>
          
          <div className="mt-4 flex flex-col gap-3">
            <Input 
              placeholder="Group Name" 
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="bg-background"
              autoFocus
            />
            
            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1 pb-1 max-h-24 overflow-y-auto">
                {selectedUsers.map(user => (
                  <div key={user._id} className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                    {user.name.split(' ')[0]}
                    <button 
                      onClick={() => removeSelected(user._id)}
                      className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                      aria-label={`Remove ${user.name}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search users to add..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-[200px] max-h-[300px]">
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
              {results.map((user) => {
                const isSelected = selectedUsers.some(u => u._id === user._id);
                return (
                  <button
                    key={user._id}
                    onClick={() => toggleUser(user)}
                    className="w-full text-left flex items-center justify-between p-3 rounded-md transition-colors hover:bg-muted focus:bg-muted focus:outline-none"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-10 w-10 border border-border shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          <UserIcon className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.phone}</p>
                      </div>
                    </div>
                    <div className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'bg-primary border-primary text-primary-foreground' : 'border-input'}`}>
                      {isSelected && <Check className="h-3.5 w-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        
        <DialogFooter className="m-0 p-4 border-t border-border bg-muted/30">
          <Button 
            onClick={handleCreateGroup} 
            disabled={isCreating || !groupName.trim() || selectedUsers.length === 0}
            className="w-full sm:w-auto"
          >
            {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Group
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
