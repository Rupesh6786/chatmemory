"use client";

import type { Message, Sender } from '@/lib/types';
import MessageBubble from './message-bubble';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

interface ChatViewProps {
  messages: Message[];
  senders: Map<string, Sender>;
  isAnalyzing: boolean;
  searchQuery: string;
}

export default function ChatView({ messages, senders, isAnalyzing, searchQuery }: ChatViewProps) {
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
