import type { Message, Sender } from './types';

const MESSAGE_REGEX = /\[?(\d{1,2}[\/.]\d{1,2}[\/.]\d{2,4}), (\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?)]? (?:- )?([^:]+): ([\s\S]+)/;
const ANDROID_MESSAGE_REGEX = /(\d{1,2}[\/.]\d{1,2}[\/.]\d{2,4}), (\d{1,2}:\d{2}) - ([^:]+): ([\s\S]+)/;

export const parseWhatsAppChat = (fileContent: string): { messages: Message[], senders: Map<string, Sender> } => {
  const lines = fileContent.split('\n');
  const messages: Message[] = [];
  const senders = new Map<string, Sender>();
  let messageId = 0;
  let currentMessage: Message | null = null;

  for (const line of lines) {
    let match = line.match(MESSAGE_REGEX);
    if (!match) {
        match = line.match(ANDROID_MESSAGE_REGEX);
    }

    if (match) {
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
      currentMessage.text += '\n' + line.trim();
    }
  }

  return { messages, senders };
};
