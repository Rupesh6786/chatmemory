// src/app/analysis/page.tsx
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock, MessageSquare, Percent, TrendingUp } from 'lucide-react';

import type { Message, Sender } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { Badge } from '@/components/ui/badge';


interface ReplyDelayData {
  timeOfDay: string;
  delay: number;
  count: number;
}

export default function AnalysisPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [senders, setSenders] = useState<Map<string, Sender>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedData = sessionStorage.getItem('chatAnalysisData');
      if (storedData) {
        const { messages, senders: storedSenders } = JSON.parse(storedData);
        // Reconstruct Date objects
        const parsedMessages = messages.map((m: any) => ({ ...m, date: new Date(m.date) }));
        setMessages(parsedMessages);
        setSenders(new Map(storedSenders));
        setDataLoaded(true);
      }
    } catch (error) {
      console.error("Failed to load chat data from session storage:", error);
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependency array ensures this runs only once on mount
  
  useEffect(() => {
    // This effect runs after the first one finishes.
    // If loading is complete and no data was loaded, then redirect.
    if (!isLoading && !dataLoaded) {
      router.push('/');
    }
  }, [isLoading, dataLoaded, router]);


  const analysisResults = useMemo(() => {
    if (messages.length < 2) return { replyDelays: [], averageDelay: 0, replyRateScore: 0, totalMessages: messages.length };

    const replyDelays: { delay: number; timestamp: Date }[] = [];
    let lastSender: string | null = null;
    let lastTimestamp: Date | null = null;

    for (const message of messages) {
      if (lastSender && lastTimestamp && message.sender !== lastSender) {
        const delayInSeconds = (message.date.getTime() - lastTimestamp.getTime()) / 1000;
        // Only count replies within a reasonable timeframe (e.g., 1 day)
        if (delayInSeconds > 0 && delayInSeconds < 86400) {
          replyDelays.push({ delay: delayInSeconds, timestamp: message.date });
        }
      }
      lastSender = message.sender;
      lastTimestamp = message.date;
    }

    if (replyDelays.length === 0) return { replyDelays: [], averageDelay: 0, replyRateScore: 0, totalMessages: messages.length };
    
    const totalDelay = replyDelays.reduce((sum, item) => sum + item.delay, 0);
    const averageDelay = totalDelay / replyDelays.length;

    // Scoring: 
    // < 1 min (60s) is ~100.
    // 5 min (300s) is ~80.
    // 15 min (900s) is ~50.
    // 30 min (1800s) is ~25.
    // 60 min (3600s) is ~10
    const score = Math.max(0, 100 * (1 - Math.log(Math.max(1, averageDelay / 60) + 1) / Math.log(60)));


    return {
      replyDelays,
      averageDelay,
      replyRateScore: Math.round(score),
      totalMessages: messages.length,
    };
  }, [messages]);

  const chartData = useMemo(() => {
    const hourlyData: { [key: number]: { totalDelay: number; count: number } } = {};

    analysisResults.replyDelays.forEach(item => {
        const hour = item.timestamp.getHours();
        if (!hourlyData[hour]) {
            hourlyData[hour] = { totalDelay: 0, count: 0 };
        }
        hourlyData[hour].totalDelay += item.delay;
        hourlyData[hour].count += 1;
    });

    const data = Object.entries(hourlyData).map(([hour, { totalDelay, count }]) => ({
        name: `${parseInt(hour, 10)}:00`,
        "Average Reply Time (s)": Math.round(totalDelay / count),
    }));

    // Ensure all hours are present for a full day view
    const fullDayData = [];
    for (let i = 0; i < 24; i++) {
        const hourData = data.find(d => d.name === `${i}:00`);
        if (hourData) {
            fullDayData.push(hourData);
        } else {
            fullDayData.push({ name: `${i}:00`, "Average Reply Time (s)": 0 });
        }
    }
    
    return fullDayData.sort((a, b) => parseInt(a.name) - parseInt(b.name));
  }, [analysisResults.replyDelays]);

  const chartConfig = {
    "Average Reply Time (s)": {
      label: "Avg. Reply (s)",
      color: "hsl(var(--primary))",
    },
  };

  const formatSeconds = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (isLoading || !dataLoaded) {
    return <div className="flex items-center justify-center min-h-screen">Loading analysis...</div>;
  }
  
  const otherParticipant = Array.from(senders.values()).find(s => !s.isUser);

  return (
    <main className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <Button variant="ghost" onClick={() => router.push('/')} className="mb-2 -ml-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Chat
            </Button>
            <h1 className="text-3xl font-bold font-headline">Chat Analysis</h1>
            <p className="text-muted-foreground">
              Conversation with <span className="text-primary font-semibold">{otherParticipant?.name ?? 'your friend'}</span>
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reply Rate Score</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analysisResults.replyRateScore}/100</div>
              <p className="text-xs text-muted-foreground">Based on average reply speed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Reply Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatSeconds(analysisResults.averageDelay)}</div>
              <p className="text-xs text-muted-foreground">Across all replies</p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analysisResults.totalMessages}</div>
              <p className="text-xs text-muted-foreground">In the entire chat history</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Hourly Reply Time Trend
            </CardTitle>
            <CardDescription>
              Average time it takes for a reply, broken down by hour of the day. Lower is faster.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                 <ChartContainer config={chartConfig} className="w-full h-full">
                    <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: -10 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="name"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value.split(':')[0]}
                        />
                        <YAxis
                          tickFormatter={(value) => `${value}s`}
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                        />
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent 
                            labelFormatter={(label, payload) => {
                                const data = payload?.[0]?.payload;
                                if (data) {
                                    return (
                                        <>
                                         <div className="font-bold">{data.name}</div>
                                         <div className="text-sm text-muted-foreground">Avg. Reply: {formatSeconds(data["Average Reply Time (s)"])}</div>
                                        </>
                                    )
                                }
                                return label;
                            }}
                            indicator="dot" 
                         />}
                        />
                        <Bar dataKey="Average Reply Time (s)" fill="var(--color-Average Reply Time (s))" radius={4} />
                    </BarChart>
                </ChartContainer>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
