import { config } from 'dotenv';
config({ path: '.env.local' });

import '@/ai/flows/analyze-sentiment.ts';
