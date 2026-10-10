import { mockActivities, mockContacts, mockDeals } from '../database/mockData';
import type {
  Activity,
  AssistantAnswer,
  AuthSession,
  Contact,
  Deal,
  DealStage,
  DuplicateCandidate,
  LeadAnalysis,
  SentimentAnalysis,
  TranscriptSummary,
  User,
} from '../interface/types';

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '');
console.log("API Url :", API_URL)
const STORAGE_KEY = 'pipeline-crm-demo-data';
const TOKEN_KEY = 'pipeline-crm-token';
const USER_KEY = 'pipeline-crm-user';

interface MockState {
  contacts: Contact[];
  deals: Deal[];
  activities: Activity[];
}

class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const initialState = (): MockState => ({
  contacts: mockContacts,
  deals: mockDeals,
  activities: mockActivities,
});

function readMockState(): MockState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return initialState();
  try {
    return JSON.parse(raw) as MockState;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return initialState();
  }
}

const mockState = readMockState();
let token = localStorage.getItem(TOKEN_KEY);

function saveMockState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockState));
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!API_URL) throw new Error('Set VITE_API_URL to connect to the CRM API.');
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  if (!response.ok) {
    const message = await response.text();
    throw new ApiError(message || `Request failed (${response.status})`, response.status);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

function createId(prefix: string) {
  return `${prefix}-${globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36)}`;
}

function getContact(sessionUser?: string): Contact | undefined {
  return mockState.contacts.find((contact) => contact.id === sessionUser);
}

export const isDemoMode = !API_URL;

export const crmApi = {
  async login(email: string, password: string): Promise<AuthSession> {
    if (API_URL) {
      const session = await request<AuthSession>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      token = session.token;
      localStorage.setItem(TOKEN_KEY, session.token);
      localStorage.setItem(USER_KEY, JSON.stringify(session.user));
      return session;
    }
    if (!email.trim() || !password.trim()) throw new Error('Enter your email and password.');
    const user: User = {
      id: 'demo-user',
      name: email
        .split('@')[0]
        .replace(/[._-]/g, ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase()),
      email,
      role: 'Sales representative',
    };
    const session = { token: 'demo-session', user };
    token = session.token;
    localStorage.setItem(TOKEN_KEY, session.token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return session;
  },

  async restoreSession(): Promise<AuthSession | null> {
    if (!token) return null;
    if (API_URL) {
      try {
        const user = await request<User>('/api/auth/me');
        const session = { token, user };
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        return session;
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          crmApi.logout();
          return null;
        }
        throw error;
      }
    }
    const rawUser = localStorage.getItem(USER_KEY);
    if (!rawUser) return null;
    try {
      return { token, user: JSON.parse(rawUser) as User };
    } catch {
      crmApi.logout();
      return null;
    }
  },

  logout() {
    token = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  async getDeals(): Promise<Deal[]> {
    if (API_URL) return request<Deal[]>('/api/deals');
    return structuredClone(mockState.deals);
  },

  async getContacts(): Promise<Contact[]> {
    if (API_URL) return request<Contact[]>('/api/contacts');
    return structuredClone(mockState.contacts);
  },

  async getActivities(dealId?: string): Promise<Activity[]> {
    if (API_URL)
      return request<Activity[]>(
        `/api/activities${dealId ? `?dealId=${encodeURIComponent(dealId)}` : ''}`,
      );
    return structuredClone(
      dealId
        ? mockState.activities.filter((activity) => activity.dealId === dealId)
        : mockState.activities,
    );
  },

  async createDeal(
    input: Omit<Deal, 'id' | 'createdAt' | 'sentiment' | 'sentimentTrend'>,
  ): Promise<Deal> {
    if (API_URL)
      return request<Deal>('/api/deals', { method: 'POST', body: JSON.stringify(input) });
    const deal: Deal = {
      ...input,
      id: createId('deal'),
      createdAt: new Date().toISOString(),
      sentiment: 'Neutral',
      sentimentTrend: [],
    };
    mockState.deals.unshift(deal);
    saveMockState();
    return deal;
  },

  async updateStage(id: string, stage: DealStage): Promise<Deal> {
    if (API_URL)
      return request<Deal>(`/api/deals/${id}/stage`, {
        method: 'PATCH',
        body: JSON.stringify({ stage }),
      });
    const deal = mockState.deals.find((item) => item.id === id);
    if (!deal) throw new Error('Deal not found.');
    deal.stage = stage;
    if (stage === 'Closed Won') deal.score = 100;
    if (stage === 'Closed Lost') deal.score = 0;
    saveMockState();
    return structuredClone(deal);
  },

  async createContact(input: Omit<Contact, 'id' | 'createdAt'>): Promise<Contact> {
    if (API_URL)
      return request<Contact>('/api/contacts', { method: 'POST', body: JSON.stringify(input) });
    const contact = { ...input, id: createId('contact'), createdAt: new Date().toISOString() };
    mockState.contacts.unshift(contact);
    saveMockState();
    return contact;
  },

  async checkContactDuplicates(
    input: Omit<Contact, 'id' | 'createdAt'>,
  ): Promise<DuplicateCandidate[]> {
    if (API_URL) {
      const result = await request<{ candidates: DuplicateCandidate[] }>(
        '/api/contacts/duplicates',
        {
          method: 'POST',
          body: JSON.stringify(input),
        },
      );
      return result.candidates;
    }
    const normalize = (value: string) =>
      value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
    return mockState.contacts.flatMap((contact) => {
      const emailMatch = normalize(contact.email) === normalize(input.email);
      const companyMatch = normalize(contact.company) === normalize(input.company);
      const nameMatch = normalize(contact.name) === normalize(input.name);
      const similarity = emailMatch
        ? 1
        : companyMatch && nameMatch
          ? 0.92
          : companyMatch
            ? 0.76
            : 0;
      return similarity >= 0.7 ? [{ contact, similarity }] : [];
    });
  },

  async createActivity(input: Omit<Activity, 'id' | 'createdAt'>): Promise<Activity> {
    if (API_URL)
      return request<Activity>('/api/activities', { method: 'POST', body: JSON.stringify(input) });
    const activity = { ...input, id: createId('activity'), createdAt: new Date().toISOString() };
    mockState.activities.unshift(activity);
    saveMockState();
    return activity;
  },

  async scoreLead(text: string): Promise<LeadAnalysis> {
    if (API_URL)
      return request<LeadAnalysis>('/nlp/score', {
        method: 'POST',
        body: JSON.stringify({ text }),
      });
    const score = Math.min(96, Math.max(16, 24 + (text.trim().length % 74)));
    return {
      score,
      label: score >= 70 ? 'Hot' : score >= 42 ? 'Warm' : 'Cold',
      reasoning:
        'Demo estimate based on communication detail. Connect the NLP service for model-generated scoring.',
    };
  },

  async analyzeSentiment(text: string): Promise<SentimentAnalysis> {
    if (API_URL)
      return request<SentimentAnalysis>('/nlp/sentiment', {
        method: 'POST',
        body: JSON.stringify({ text }),
      });
    const lower = text.toLowerCase();
    const negative = ['concern', 'delay', 'expensive', 'problem', 'cancel', 'disappointed'].some(
      (word) => lower.includes(word),
    );
    const positive = ['great', 'interested', 'excited', 'approved', 'looking forward', 'love'].some(
      (word) => lower.includes(word),
    );
    const label = negative ? 'Negative' : positive ? 'Positive' : 'Neutral';
    return { label, score: label === 'Positive' ? 82 : label === 'Negative' ? 28 : 54 };
  },

  async summarize(text: string): Promise<TranscriptSummary> {
    if (API_URL)
      return request<TranscriptSummary>('/nlp/summarize', {
        method: 'POST',
        body: JSON.stringify({ text }),
      });
    const sentences = text
      .trim()
      .split(/(?<=[.!?])\s+/)
      .filter(Boolean);
    return {
      summary: sentences.slice(0, 2).join(' ') || 'Add a transcript to generate a summary.',
      actionItems: sentences
        .filter((sentence) =>
          /\b(will|send|share|schedule|follow up|prepare|review|confirm)\b/i.test(sentence),
        )
        .slice(0, 4),
      entities: [...new Set(text.match(/\b[A-Z][a-z]+(?:\s[A-Z][a-z]+){0,2}\b/g) ?? [])].slice(
        0,
        6,
      ),
    };
  },

  async draftEmail(dealId: string): Promise<{ subject: string; body: string }> {
    if (API_URL)
      return request(`/nlp/draft-email`, { method: 'POST', body: JSON.stringify({ dealId }) });
    const deal = mockState.deals.find((item) => item.id === dealId);
    const contact = deal && getContact(deal.contactId);
    return {
      subject: `Following up on ${contact?.company ?? 'our conversation'}`,
      body: `Hi ${contact?.name.split(' ')[0] ?? 'there'},\n\nThank you for taking the time to discuss your goals with us. I wanted to follow up on the next steps and answer any questions about our proposal.\n\nWould you have time for a quick conversation this week?\n\nBest,\n${deal?.owner ?? 'Your sales team'}`,
    };
  },

  async ask(query: string): Promise<AssistantAnswer> {
    if (API_URL)
      return request<AssistantAnswer>('/nlp/ask', {
        method: 'POST',
        body: JSON.stringify({ query }),
      });
    return {
      answer: `I can help you explore your pipeline. For “${query}”, review the deal stage, recent activity, and any approved pricing or product documents before deciding. The demo assistant is illustrative; connect the NLP service and knowledge base for grounded answers.`,
      sources: ['Demo mode · no company documents connected'],
    };
  },
};
