'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MessageSquareText } from 'lucide-react';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!phone || !name) {
        throw new Error('Please enter both phone and name.');
      }
      
      const data = await loginApi(phone, name);
      login(data.token, data.user);
      router.push('/chat');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950 via-background to-background text-foreground overflow-hidden relative">
      {/* Decorative background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50 animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl opacity-50 animate-pulse pointer-events-none" />
      
      <Card className="w-full max-w-md mx-4 shadow-2xl border-white/10 bg-background/60 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500 z-10">
        <CardHeader className="space-y-2 text-center pb-8 pt-8">
          <div className="flex justify-center mb-2">
            <div className="p-4 bg-primary/10 rounded-2xl ring-1 ring-primary/20 shadow-inner">
              <MessageSquareText className="w-10 h-10 text-primary drop-shadow-md" />
            </div>
          </div>
          <CardTitle className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-muted-foreground font-medium">
            Enter your details to sign in or register instantly
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleLogin} className="px-2 flex flex-col gap-6">
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="phone" className="text-sm font-semibold">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isLoading}
                required
                className="h-12 bg-background/50 border-white/10 focus-visible:ring-primary focus-visible:ring-offset-0 transition-all shadow-sm"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="name" className="text-sm font-semibold">Display Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g. Alice"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                required
                className="h-12 bg-background/50 border-white/10 focus-visible:ring-primary focus-visible:ring-offset-0 transition-all shadow-sm"
              />
            </div>
            
            {error && (
              <div className="p-3 text-sm font-medium text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-lg animate-in slide-in-from-top-2">
                {error}
              </div>
            )}
          </CardContent>
          <CardFooter className="pb-8 pt-4">
            <Button 
              type="submit" 
              size="lg"
              className="w-full h-12 text-md font-bold shadow-lg transition-all hover:scale-[1.02] hover:shadow-primary/25 active:scale-[0.98]" 
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                'Continue to Chat'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
