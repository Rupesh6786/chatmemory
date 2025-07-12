// src/components/chat-memory/chat-history.tsx
"use client";

import type { Chat } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatHistoryProps {
    chats: Chat[];
    onSelectChat: (chat: Chat) => void;
    isLoading: boolean;
}

export default function ChatHistory({ chats, onSelectChat, isLoading }: ChatHistoryProps) {
    if (isLoading && chats.length === 0) {
        return (
            <div className="mt-6 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    if (chats.length === 0) {
        return (
            <div className="mt-8 text-center text-muted-foreground">
                <MessageCircle className="mx-auto h-12 w-12" />
                <p className="mt-4">You haven't uploaded any chats yet.</p>
                <p>Upload your first chat to get started!</p>
            </div>
        )
    }

    return (
        <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Your Saved Chats</h3>
            <ScrollArea className="h-[300px] rounded-md border p-2">
                <div className="space-y-2">
                {chats.map(chat => (
                    <div key={chat.id} 
                         className="flex items-center justify-between p-3 rounded-md bg-card hover:bg-muted/50 cursor-pointer"
                         onClick={() => onSelectChat(chat)}
                    >
                        <div>
                            <p className="font-semibold">{chat.title}</p>
                            <p className="text-sm text-muted-foreground">
                                {chat.messageCount} messages - Uploaded on {new Date(chat.createdAt.seconds * 1000).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                ))}
                </div>
            </ScrollArea>
        </div>
    )
}
