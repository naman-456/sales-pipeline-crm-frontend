import type { Activity, Contact, Deal, DealStage } from '../interface/types';

const now = new Date();
const dateOffset = (days: number) => {
  const date = new Date(now);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const contactRows = [
  ['Rohan Mehta', 'Acme Technologies', 'rohan@acmetech.com', '+91 98765 01001'],
  ['Ananya Rao', 'BrightPath Edu', 'ananya@brightpath.in', '+91 98765 01002'],
  ['Vikram Singh', 'Nimbus Cloud Pvt Ltd', 'vikram@nimbuscloud.io', '+91 98765 01003'],
  ['Sneha Iyer', 'GreenLeaf Organics', 'sneha@greenleaf.co', '+91 98765 01004'],
  ['Amit Patel', 'Zenith Logistics', 'amit@zenithlogistics.com', '+91 98765 01005'],
  ['Meera Nair', 'PixelCraft Studios', 'meera@pixelcraft.design', '+91 98765 01006'],
  ['Dr. Suresh Reddy', 'HealthFirst Clinics', 'suresh@healthfirst.in', '+91 98765 01007'],
  ['Kavya Menon', 'UrbanNest Realty', 'kavya@urbannest.com', '+91 98765 01008'],
  ['Rahul Gupta', 'TechNova Solutions', 'rahul@technova.in', '+91 98765 01009'],
  ['Divya Sharma', 'Orbit Retail', 'divya@orbitretail.com', '+91 98765 01010'],
] as const;

export const mockContacts: Contact[] = contactRows.map((row, index) => ({
  id: `contact-${index + 1}`,
  name: row[0],
  company: row[1],
  email: row[2],
  phone: row[3],
  createdAt: dateOffset(-30 + index * 2),
}));

const dealRows: [DealStage, number, number, string, string, string, string[]][] = [
  ['New Lead', 250000, 18, 'Priya S.', dateOffset(51), 'Website Form', ['Inbound', 'SaaS']],
  ['Contacted', 480000, 28, 'Karan V.', dateOffset(46), 'LinkedIn', ['Education', 'Growth']],
  ['Qualified', 900000, 48, 'Priya S.', dateOffset(61), 'Referral', ['Cloud', 'Enterprise']],
  ['Qualified', 320000, 40, 'Arjun D.', dateOffset(56), 'Trade Show', ['Retail', 'SMB']],
  [
    'Proposal Sent',
    1250000,
    68,
    'Karan V.',
    dateOffset(41),
    'Cold Email',
    ['Logistics', 'Enterprise'],
  ],
  ['Proposal Sent', 560000, 58, 'Arjun D.', dateOffset(39), 'Website Form', ['Design', 'SMB']],
  [
    'Negotiation',
    1800000,
    82,
    'Priya S.',
    dateOffset(33),
    'Referral',
    ['Healthcare', 'Enterprise'],
  ],
  ['Negotiation', 840000, 76, 'Karan V.', dateOffset(30), 'Webinar', ['Real estate', 'Growth']],
  ['Closed Won', 675000, 100, 'Arjun D.', dateOffset(-8), 'LinkedIn', ['Retail', 'Won']],
  ['Closed Lost', 390000, 0, 'Priya S.', dateOffset(-12), 'Cold Email', ['Retail', 'Lost']],
];

export const mockDeals: Deal[] = dealRows.map(
  ([stage, value, score, owner, expectedClose, source, tags], index) => {
    const sentiment =
      index === 6
        ? 'Negative'
        : index === 9
          ? 'Negative'
          : index % 3 === 0
            ? 'Neutral'
            : 'Positive';
    const trend = [0, 1, 2, 3].map((step) => {
      const scoreValue = Math.max(18, Math.min(96, 48 + ((index * 13 + step * 9) % 47) - 12));
      return {
        date: dateOffset(-18 + step * 6),
        score: scoreValue,
        label: scoreValue > 65 ? 'Positive' : scoreValue < 40 ? 'Negative' : 'Neutral',
      } as const;
    });
    return {
      id: `deal-${1001 + index}`,
      contactId: mockContacts[index].id,
      stage,
      value,
      score,
      owner,
      source,
      expectedClose,
      createdAt: dateOffset(-35 + index * 2),
      sentiment,
      sentimentTrend: trend,
      tags,
    };
  },
);

export const mockActivities: Activity[] = mockDeals.slice(0, 5).map((deal, index) => ({
  id: `activity-${index + 1}`,
  dealId: deal.id,
  type: (['call', 'email', 'note', 'call', 'email'] as const)[index],
  title: [
    'Discovery call completed',
    'Product overview shared',
    'Qualification notes',
    'Pricing discussion',
    'Proposal sent',
  ][index],
  rawText: [
    "Discussed current workflow and the team's goals for this quarter. They are evaluating solutions before their next planning cycle.",
    'Shared the product overview and answered questions about onboarding and integrations.',
    'The team is reviewing a few options. Budget is allocated and the decision maker wants to see a clear implementation timeline.',
    'Reviewed pricing and rollout plan. They asked for a revised proposal for their regional teams.',
    'Sent the proposal and outlined the value of consolidating the current tools.',
  ][index],
  summary: index === 0 ? 'Exploring solutions before the next planning cycle.' : undefined,
  createdAt: dateOffset(-index),
}));
