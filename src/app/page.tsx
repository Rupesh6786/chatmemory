"use client";

import { useState, useMemo, useEffect } from 'react';
import { parseWhatsAppChat } from '@/lib/parser';
import { analyzeSentiment } from '@/ai/flows/analyze-sentiment';
import type { Message, Sender } from '@/lib/types';
import FileUploader from '@/components/chat-memory/file-uploader';
import ControlPanel from '@/components/chat-memory/control-panel';
import ChatView from '@/components/chat-memory/chat-view';
import { useToast } from '@/hooks/use-toast';
import { MessageSquareText, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [senders, setSenders] = useState<Map<string, Sender>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState<string>('all');
  
  const [fileUploaded, setFileUploaded] = useState(false);

  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const fileContent = await file.text();
      const { messages: parsedMessages, senders: parsedSenders } = parseWhatsAppChat(fileContent);

      if (parsedMessages.length === 0) {
        throw new Error("Couldn't find any messages in the file. Please check the file format.");
      }
      
      setMessages(parsedMessages);
      setSenders(parsedSenders);
      setFileUploaded(true);

      setIsAnalyzing(true);
      const analysisPromises = parsedMessages.map(msg =>
        analyzeSentiment({ text: msg.text })
          .then(result => ({ ...msg, sentiment: result.sentiment?.toLowerCase() ?? 'neutral' }))
          .catch(() => ({ ...msg, sentiment: 'neutral' }))
      );
      
      const analyzedMessages = await Promise.all(analysisPromises);
      setMessages(analyzedMessages);

    } catch (e: any) {
      setError(e.message || "Failed to process the file.");
      toast({
        variant: "destructive",
        title: "Oh no! Something went wrong.",
        description: e.message || "Failed to process the file.",
      });
      setFileUploaded(false);
    } finally {
      setIsLoading(false);
      setIsAnalyzing(false);
    }
  };

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
  
  const resetToUploader = () => {
    setFileUploaded(false);
    setMessages([]);
    setSenders(new Map());
    setError(null);
    setSearchQuery('');
    setSentimentFilter('all');
  };

  if (!fileUploaded) {
     return (
        <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
            <Card className="w-full max-w-2xl shadow-2xl">
                <CardHeader>
                    <div className='text-center'>
                        <MessageSquareText className="w-12 h-12 mx-auto text-primary" />
                        <CardTitle className="mt-4 text-3xl font-bold font-headline">ChatMemory</CardTitle>
                        <CardDescription className="mt-2 text-md">Upload your WhatsApp chat file to get started.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <FileUploader onFileUpload={handleFileUpload} isLoading={isLoading} />
                    {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
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
                onReset={resetToUploader}
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
