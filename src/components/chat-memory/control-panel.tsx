// src/components/chat-memory/control-panel.tsx
"use client";

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Smile, Frown, Angry, MessageSquareText, ArrowLeft, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SheetClose, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface ControlPanelProps {
  onSearch: (query: string) => void;
  onFilter: (sentiment: string) => void;
  activeFilter: string;
  onReset: () => void;
  otherParticipantName?: string;
  isSheet?: boolean;
}

export default function ControlPanel({ onSearch, onFilter, activeFilter, onReset, otherParticipantName, isSheet }: ControlPanelProps) {
  const sentimentFilters = [
    { name: 'Happy', sentiment: 'happy', icon: Smile, color: 'text-green-500' },
    { name: 'Sad', sentiment: 'sad', icon: Frown, color: 'text-blue-500' },
    { name: 'Angry', sentiment: 'angry', icon: Angry, color: 'text-red-500' },
  ];

  const content = (
    <>
      <div className="relative my-4 px-4">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search messages..."
          className="pl-10 bg-background/50"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      <div className="px-4">
        <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-1">Emotion Highlights</h3>
        <div className="space-y-1">
          <Button
            variant={activeFilter === 'all' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => onFilter('all')}
          >
            All Messages
          </Button>
          {sentimentFilters.map(filter => {
            const Icon = filter.icon;
            return (
              <Button
                key={filter.sentiment}
                variant={activeFilter === filter.sentiment ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => onFilter(filter.sentiment)}
              >
                <Icon className={cn("mr-2 h-4 w-4", filter.color)} /> {filter.name}
              </Button>
            );
          })}
        </div>
      </div>
      
      <div className="mt-auto p-4 border-t border-border/50">
        <Button variant="outline" className="w-full" onClick={onReset}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Upload
        </Button>
      </div>
    </>
  );

  if (isSheet) {
    return (
      <>
        <SheetHeader className="p-4 border-b border-border/50 text-left flex-row justify-between items-center">
          <SheetTitle>Menu</SheetTitle>
           <SheetClose>
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </SheetClose>
        </SheetHeader>
        <div className="flex flex-col flex-1 h-full">
            {content}
        </div>
      </>
    );
  }

  return (
    <aside className="w-full h-full bg-card/60 dark:bg-zinc-900/60 backdrop-blur-sm border-r border-border/50 flex flex-col">
      <div className="flex items-center gap-2 p-4 pb-4 border-b border-border/50">
        <MessageSquareText className="w-8 h-8 text-primary" />
        <div>
          <h2 className="text-xl font-bold font-headline">ChatMemory</h2>
          {otherParticipantName && <p className="text-xs text-muted-foreground">Chat with {otherParticipantName}</p>}
        </div>
      </div>
      {content}
    </aside>
  );
}
