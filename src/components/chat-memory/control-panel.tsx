"use client";

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Smile, Frown, Angry, RefreshCw, MessageSquareText, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ControlPanelProps {
  onSearch: (query: string) => void;
  onFilter: (sentiment: string) => void;
  activeFilter: string;
  onReset: () => void;
  otherParticipantName?: string;
}

export default function ControlPanel({ onSearch, onFilter, activeFilter, onReset, otherParticipantName }: ControlPanelProps) {
  const sentimentFilters = [
    { name: 'Happy', sentiment: 'happy', icon: Smile, color: 'text-green-500' },
    { name: 'Sad', sentiment: 'sad', icon: Frown, color: 'text-blue-500' },
    { name: 'Angry', sentiment: 'angry', icon: Angry, color: 'text-red-500' },
  ];

  return (
    <aside className="w-full max-w-[280px] bg-card/60 dark:bg-zinc-900/60 backdrop-blur-sm border-r border-border/50 flex-col p-4 hidden md:flex">
      <div className="flex items-center gap-2 pb-4 border-b border-border/50">
        <MessageSquareText className="w-8 h-8 text-primary" />
        <div>
          <h2 className="text-xl font-bold font-headline">ChatMemory</h2>
          {otherParticipantName && <p className="text-xs text-muted-foreground">Chat with {otherParticipantName}</p>}
        </div>
      </div>

      <div className="relative my-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search messages..."
          className="pl-10 bg-background/50"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      <div>
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

      <div className="mt-auto pt-4 border-t border-border/50">
        <Button variant="outline" className="w-full" onClick={onReset}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Upload
        </Button>
      </div>
    </aside>
  );
}
