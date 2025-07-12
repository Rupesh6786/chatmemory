// src/components/chat-memory/chat-view.tsx
"use client";

import type { Message, Sender } from '@/lib/types';
import MessageBubble from './message-bubble';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '../ui/button';
import { PanelLeft } from 'lucide-react';
import { SheetTrigger } from '../ui/sheet';

interface ChatViewProps {
  messages: Message[];
  senders: Map<string, Sender>;
  isAnalyzing: boolean;
  searchQuery: string;
  otherParticipant?: Sender;
  children?: React.ReactNode; // For the mobile menu trigger
}

export default function ChatView({ messages, senders, isAnalyzing, searchQuery, otherParticipant, children }: ChatViewProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (viewport) {
      viewport.scrollTo({
        top: viewport.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  return (
    <main className="flex-1 flex flex-col bg-background/50 dark:bg-black/20">
      <header className="flex items-center justify-between gap-4 p-3 border-b border-border/50 bg-card/60 dark:bg-zinc-900/60 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          {children} {/* Mobile Menu Trigger */}
          <Avatar>
            <AvatarFallback>{otherParticipant?.name.charAt(0).toUpperCase() ?? '?'}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-base font-semibold">{otherParticipant?.name}</h2>
            <p className="text-xs text-muted-foreground">Chat History</p>
          </div>
        </div>
      </header>
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="p-4 md:p-8 space-y-4" ref={viewportRef}>
          {messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} sender={senders.get(msg.sender)} searchQuery={searchQuery} />
          ))}
          {isAnalyzing && (
            <div className="flex justify-center items-center gap-2 text-muted-foreground text-sm p-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Analyzing sentiments...</span>
            </div>
          )}
        </div>
      </ScrollArea>
    </main>
  );
}
