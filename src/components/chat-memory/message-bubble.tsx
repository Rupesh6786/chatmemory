"use client";

import type { Message, Sender } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Smile, Frown, Angry } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  sender?: Sender;
  searchQuery: string;
}

const SentimentIcon = ({ sentiment }: { sentiment?: string }) => {
  if (!sentiment) return null;
  switch (sentiment) {
    case 'happy': return <Smile className="h-4 w-4 text-green-400" aria-label="Happy" />;
    case 'sad': return <Frown className="h-4 w-4 text-blue-400" aria-label="Sad" />;
    case 'angry': return <Angry className="h-4 w-4 text-red-400" aria-label="Angry" />;
    default: return null;
  }
};

const HighlightedText = ({ text, highlight }: { text: string; highlight: string }) => {
  if (!highlight.trim()) return <>{text}</>;
  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <mark key={i} className="bg-primary/30 dark:bg-primary/50 text-foreground rounded px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
};


export default function MessageBubble({ message, sender, searchQuery }: MessageBubbleProps) {
  const isUser = sender?.isUser ?? false;

  return (
    <div className={cn('flex items-end gap-2 w-full', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[80%] sm:max-w-[75%] md:max-w-[65%] rounded-lg px-3 py-2 flex flex-col shadow',
          isUser
            ? 'bg-[#dcf8c6] dark:bg-[#005C4B] text-gray-800 dark:text-gray-100 rounded-br-sm'
            : 'bg-white dark:bg-[#202c33] text-gray-800 dark:text-gray-100 rounded-bl-sm'
        )}
      >
        {!isUser && (
          <p className="text-sm font-bold text-primary dark:text-green-400 mb-0.5">{message.sender}</p>
        )}
        <p className="whitespace-pre-wrap break-words text-base overflow-wrap-anywhere">
          <HighlightedText text={message.text} highlight={searchQuery} />
        </p>
        <div className="flex items-center gap-2 self-end mt-1 h-4">
          {message.sentiment && message.sentiment !== 'neutral' && <SentimentIcon sentiment={message.sentiment} />}
          <span className="text-xs text-gray-500 dark:text-gray-400/80">{message.timestamp.split(', ')[1]}</span>
        </div>
      </div>
    </div>
  );
}
