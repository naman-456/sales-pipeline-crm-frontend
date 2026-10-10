export const DEAL_STAGES = [
  'New Lead',
  'Contacted',
  'Qualified',
  'Proposal Sent',
  'Negotiation',
  'Closed Won',
  'Closed Lost',
] as const;

export type DealStage = (typeof DEAL_STAGES)[number];
export type SentimentLabel = 'Positive' | 'Neutral' | 'Negative';
export type LeadTemperature = 'Hot' | 'Warm' | 'Cold';
export type ActivityType = 'email' | 'call' | 'note';

export interface Contact {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  createdAt: string;
}

export interface DuplicateCandidate {
  contact: Contact;
  similarity: number;
}

export interface SentimentPoint {
  date: string;
  score: number;
  label: SentimentLabel;
}

export interface Deal {
  id: string;
  contactId: string;
  stage: DealStage;
  value: number;
  score: number;
  owner: string;
  source: string;
  expectedClose: string;
  createdAt: string;
  sentiment: SentimentLabel;
  sentimentTrend: SentimentPoint[];
  tags: string[];
}

export interface Activity {
  id: string;
  dealId: string;
  type: ActivityType;
  title: string;
  rawText: string;
  summary?: string;
  actionItems?: string[];
  entities?: string[];
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthSession {
  token: string;
  user: User;
}

export interface LeadAnalysis {
  score: number;
  label: LeadTemperature;
  reasoning: string;
}

export interface SentimentAnalysis {
  score: number;
  label: SentimentLabel;
}

export interface TranscriptSummary {
  summary: string;
  actionItems: string[];
  entities: string[];
}

export interface AssistantAnswer {
  answer: string;
  sources: string[];
}
