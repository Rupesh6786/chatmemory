// src/app/page.tsx
"use client";

import { useState, useMemo } from 'react';
import { parseWhatsAppChat } from '@/lib/parser';
import { analyzeSentiment } from '@/ai/flows/analyze-sentiment';
import type { Message, Sender } from '@/lib/types';
import FileUploader from '@/components/chat-memory/file-uploader';
import ControlPanel from '@/components/chat-memory/control-panel';
import ChatView from '@/components/chat-memory/chat-view';
import { useToast } from '@/hooks/use-toast';
import { MessageSquareText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { PanelLeft } from 'lucide-react';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [senders, setSenders] = useState<Map<string, Sender>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState<string>('all');
  
  const [fileUploaded, setFileUploaded] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

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
        const sentimentMatch = sentimentFilter === 'all' || msg.sentiment === sentimentFilter;
        const searchMatch = !searchQuery || msg.text.toLowerCase().includes(searchQuery.toLowerCase());
        return sentimentMatch && searchMatch;
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

  const onFilterSelect = (filter: string) => {
    setSentimentFilter(filter);
    setIsSheetOpen(false); // Close sheet after selection
  }

  if (!fileUploaded) {
     return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-background">
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
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <div className="flex w-full h-full">
              {/* Desktop Control Panel */}
              <div className="hidden md:flex md:w-[280px] md:flex-shrink-0">
                <ControlPanel
                    onSearch={setSearchQuery}
                    onFilter={onFilterSelect}
                    activeFilter={sentimentFilter}
                    onReset={resetToUploader}
                    otherParticipantName={otherParticipant?.name}
                />
              </div>

              {/* Main Chat View */}
              <ChatView
                  messages={filteredMessages}
                  senders={senders}
                  isAnalyzing={isAnalyzing}
                  searchQuery={searchQuery}
                  otherParticipant={otherParticipant}
              >
                 {/* Mobile Control Panel Trigger (in ChatView header) */}
                 <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                      <PanelLeft className="h-5 w-5" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </SheetTrigger>
              </ChatView>
          </div>
          <SheetContent side="left" className="p-0 w-[300px] flex flex-col">
             {/* Mobile Control Panel Content */}
              <ControlPanel
                  onSearch={setSearchQuery}
                  onFilter={onFilterSelect}
                  activeFilter={sentimentFilter}
                  onReset={resetToUploader}
                  otherParticipantName={otherParticipant?.name}
                  isSheet={true}
              />
          </SheetContent>
        </Sheet>
    </div>
  );
}
