import type { Message, Sender } from './types';

// Regex that handles formats like:
// [DD/MM/YYYY, HH:MM:SS] Sender: Message
// DD/MM/YY, HH:MM - Sender: Message
// DD/MM/YY, HH:MM pm - Sender: Message
const MESSAGE_REGEX = /\[?(\d{1,2}[\/.]\d{1,2}[\/.]\d{2,4}), (\d{1,2}:\d{2}(?::\d{2})?(?:\s?[ap]m)?)\]? - ([^:]+): ([\s\S]+)/i;

export const parseWhatsAppChat = (fileContent: string): { messages: Message[], senders: Map<string, Sender> } => {
  const lines = fileContent.split('\n');
  const messages: Message[] = [];
  const senders = new Map<string, Sender>();
  let messageId = 0;
  let currentMessage: Message | null = null;

  for (const line of lines) {
    const match = line.match(MESSAGE_REGEX);

    if (match) {
      // Groups: 1:date, 2:time, 3:sender, 4:text
      const [_, date, time, senderName, text] = match;
      const timestamp = `${date}, ${time}`;

      // Normalize sender name
      const normalizedSender = senderName.trim();

      if (!senders.has(normalizedSender)) {
        // The first sender is considered the other person, the second is the user exporting the chat.
        const isUser = senders.size === 1;
        senders.set(normalizedSender, { name: normalizedSender, isUser });
      }

      currentMessage = {
        id: messageId++,
        timestamp,
        sender: normalizedSender,
        text: text.trim(),
      };
      messages.push(currentMessage);
    } else if (currentMessage && line.trim()) {
      // This is a continuation of the previous message (multiline)
      currentMessage.text += '\n' + line.trim();
    }
  }

  return { messages, senders };
};
