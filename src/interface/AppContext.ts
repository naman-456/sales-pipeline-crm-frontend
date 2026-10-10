import type { Activity, Contact, Deal, User } from './types';

export interface AppContextValue {
  user: User;
  deals: Deal[];
  contacts: Contact[];
  activities: Activity[];
  reload: () => Promise<void>;
  notify: (message: string, kind?: 'success' | 'error') => void;
  selectDeal: (dealId: string) => void;
}
