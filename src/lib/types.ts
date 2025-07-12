export interface Message {
  id: number;
  timestamp: string;
  sender: string;
  text: string;
  date: Date; // Added for date comparison
  sentiment?: 'happy' | 'sad' | 'angry' | 'neutral' | string;
}

export type ChatDisplayItem = Message | { type: 'date_separator'; date: string };

export interface Sender {
  name: string;
  isUser: boolean;
}
