
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
