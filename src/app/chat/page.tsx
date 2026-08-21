'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function ChatPage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

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
    <div className="flex flex-col h-screen p-8 space-y-4 bg-background text-foreground">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Welcome to Chat, {user.name}!</h1>
        <Button variant="destructive" onClick={logout}>Sign Out</Button>
      </div>
      <div className="flex-1 rounded-lg border border-border p-8 flex items-center justify-center text-muted-foreground">
        The full chat interface will be built out in the upcoming stages!
      </div>
    </div>
  );
}
