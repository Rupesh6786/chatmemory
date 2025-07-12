import type { Timestamp } from 'firebase/firestore';

export interface Message {
  id: number;
  timestamp: string;
  sender: string;
  text: string;
  sentiment?: 'happy' | 'sad' | 'angry' | 'neutral' | string;
}

export interface Sender {
  name: string;
  isUser: boolean;
}

export interface Chat {
  id: string;
  userId: string;
  title: string;
  fileUrl: string;
  messageCount: number;
  createdAt: Timestamp;
}
