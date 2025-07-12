"use client";

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { parseWhatsAppChat } from '@/lib/parser';
import { analyzeSentiment } from '@/ai/flows/analyze-sentiment';
import type { Message, Sender, Chat } from '@/lib/types';
import FileUploader from '@/components/chat-memory/file-uploader';
import ControlPanel from '@/components/chat-memory/control-panel';
import ChatView from '@/components/chat-memory/chat-view';
import { useToast } from '@/hooks/use-toast';
import { MessageSquareText, Loader2, LogOut } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getChatsForUser, uploadChatFile, auth } from '@/lib/firebase';
import ChatHistory from '@/components/chat-memory/chat-history';

export default function Home() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [senders, setSenders] = useState<Map<string, Sender>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState<string>('all');
  
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    if (user) {
      const fetchChats = async () => {
        setIsLoading(true);
        try {
          const userChats = await getChatsForUser(user.uid);
          setChats(userChats);
        } catch (e) {
          console.error("Error fetching chats: ", e);
          toast({
            variant: "destructive",
            title: "Could not load your chats.",
            description: "Please try refreshing the page.",
          });
        } finally {
          setIsLoading(false);
        }
      };
      fetchChats();
    }
  }, [user, toast]);

  const handleFileUpload = async (file: File) => {
    if (!user) {
      toast({ variant: "destructive", title: "You must be logged in to upload a chat." });
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const fileContent = await file.text();
      const { messages: parsedMessages, senders: parsedSenders } = parseWhatsAppChat(fileContent);

      if (parsedMessages.length === 0) {
        throw new Error("Couldn't find any messages in the file. Please check the file format.");
      }
      
      const otherParticipant = Array.from(parsedSenders.values()).find(s => !s.isUser)?.name || 'Unknown Chat';
      const newChat = await uploadChatFile(user.uid, file, otherParticipant, parsedMessages.length);
      
      setChats(prev => [newChat, ...prev]);
      handleSelectChat(newChat);

    } catch (e: any) {
      setError(e.message || "Failed to process the file.");
      toast({
        variant: "destructive",
        title: "Oh no! Something went wrong.",
        description: e.message || "Failed to process the file.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectChat = async (chat: Chat) => {
    setSelectedChat(chat);
    setIsLoading(true);
    setMessages([]);
    setSenders(new Map());
    try {
      const res = await fetch(chat.fileUrl);
      if (!res.ok) throw new Error("Failed to download chat file.");
      const fileContent = await res.text();
      const { messages: parsedMessages, senders: parsedSenders } = parseWhatsAppChat(fileContent);
      setMessages(parsedMessages);
      setSenders(parsedSenders);

      setIsAnalyzing(true);
      const analysisPromises = parsedMessages.map(msg =>
        analyzeSentiment({ text: msg.text })
          .then(result => ({ ...msg, sentiment: result.sentiment?.toLowerCase() ?? 'neutral' }))
          .catch(() => ({ ...msg, sentiment: 'neutral' }))
      );
      
      const analyzedMessages = await Promise.all(analysisPromises);
      setMessages(analyzedMessages);

    } catch (e: any) {
       toast({
        variant: "destructive",
        title: "Failed to load chat.",
        description: e.message,
      });
    } finally {
       setIsLoading(false);
       setIsAnalyzing(false);
    }
  }

  const filteredMessages = useMemo(() => {
    return messages
      .filter(msg => {
        if (sentimentFilter !== 'all' && msg.sentiment !== sentimentFilter) {
          return false;
        }
        if (searchQuery && !msg.text.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
        return true;
      });
  }, [messages, searchQuery, sentimentFilter]);

  const otherParticipant = useMemo(() => {
    return Array.from(senders.values()).find(s => !s.isUser)
  }, [senders]);
  
  const resetToChatList = () => {
    setSelectedChat(null);
    setMessages([]);
    setSenders(new Map());
    setError(null);
    setSearchQuery('');
    setSentimentFilter('all');
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  if (loading || !user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </main>
    );
  }
  
  if (!selectedChat) {
     return (
        <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
            <Card className="w-full max-w-2xl shadow-2xl">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-3xl font-bold font-headline">Your Chat Histories</CardTitle>
                        <CardDescription className="mt-2 text-md">Select a chat to view or upload a new one.</CardDescription>
                    </div>
                    <Button variant="ghost" onClick={handleSignOut}><LogOut className="mr-2"/> Sign Out</Button>
                </CardHeader>
                <CardContent>
                    <FileUploader onFileUpload={handleFileUpload} isLoading={isLoading} />
                    {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
                    <ChatHistory chats={chats} onSelectChat={handleSelectChat} isLoading={isLoading} />
                </CardContent>
            </Card>
        </main>
     )
  }

  return (
    <div className="flex h-screen w-screen bg-background text-foreground overflow-hidden">
        <div className="relative z-10 flex w-full h-full">
            <ControlPanel
                onSearch={setSearchQuery}
                onFilter={setSentimentFilter}
                activeFilter={sentimentFilter}
                onReset={resetToChatList}
                otherParticipantName={otherParticipant?.name}
            />
            <ChatView
                messages={filteredMessages}
                senders={senders}
                isAnalyzing={isAnalyzing}
                searchQuery={searchQuery}
                otherParticipant={otherParticipant}
            />
        </div>
    </div>
  );
}
