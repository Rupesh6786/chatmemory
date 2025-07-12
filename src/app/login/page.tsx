// src/app/login/page.tsx
"use client";

import AuthForm from '@/components/auth/auth-form';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquareText } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (email: string, password: string): Promise<string | undefined> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: 'Login successful!', description: "Welcome back!" });
      router.push('/');
      return undefined; // No error
    } catch (error: any) {
      console.error(error);
      return error.message || 'Failed to log in.';
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <MessageSquareText className="w-12 h-12 mx-auto text-primary" />
            <CardTitle className="mt-4 text-3xl font-bold font-headline">Welcome Back!</CardTitle>
            <CardDescription>Sign in to access your chat histories.</CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm
            mode="login"
            onSubmit={handleLogin}
          />
           <p className="mt-4 text-center text-sm">
              Don't have an account?{' '}
              <Link href="/signup" className="font-semibold text-primary hover:underline">
                Sign up
              </Link>
            </p>
        </CardContent>
      </Card>
    </main>
  );
}
