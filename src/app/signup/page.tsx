// src/app/signup/page.tsx
"use client";

import AuthForm from '@/components/auth/auth-form';
import { auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquareText } from 'lucide-react';
import Link from 'next/link';

export default function SignUpPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSignUp = async (email: string, password: string): Promise<string | undefined> => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast({ title: 'Account created!', description: "You've been successfully signed up." });
      router.push('/');
      return undefined;
    } catch (error: any) {
      console.error(error);
      return error.message || 'Failed to sign up.';
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <MessageSquareText className="w-12 h-12 mx-auto text-primary" />
            <CardTitle className="mt-4 text-3xl font-bold font-headline">Create an Account</CardTitle>
            <CardDescription>Get started with ChatMemory.</CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm
            mode="signup"
            onSubmit={handleSignUp}
          />
           <p className="mt-4 text-center text-sm">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Log in
              </Link>
            </p>
        </CardContent>
      </Card>
    </main>
  );
}
