type IconName =
  | 'grid'
  | 'columns'
  | 'users'
  | 'chart'
  | 'sparkles'
  | 'search'
  | 'plus'
  | 'bell'
  | 'chevron'
  | 'arrow'
  | 'close'
  | 'mail'
  | 'phone'
  | 'note'
  | 'calendar'
  | 'clock'
  | 'dollar'
  | 'trend'
  | 'send'
  | 'logout'
  | 'filter'
  | 'check'
  | 'menu';

const paths: Record<IconName, string> = {
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
  columns: 'M3 4h5v16H3zM10 4h5v16h-5zM17 4h4v16h-4z',
  users:
    'M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m12-13a4 4 0 0 1 0 8m4 5v-2a4 4 0 0 0-3-3.87M14 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  chart: 'M3 3v18h18M18 17V9m-5 8V5m-5 12v-5',
  sparkles:
    'm12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Zm7 12 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z',
  search: 'm20 20-4.3-4.3M18 10.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z',
  plus: 'M12 5v14m-7-7h14',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 12h4',
  chevron: 'm9 18 6-6-6-6',
  arrow: 'M7 17 17 7M7 7h10v10',
  close: 'm18 6-12 12M6 6l12 12',
  mail: 'M4 5h16v14H4zM4 7l8 6 8-6',
  phone:
    'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.5 3.1a2 2 0 0 1-.6 1.7L7.7 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 1.7-.6l3.1.5a2 2 0 0 1 2.2 2.5Z',
  note: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6m-4 5H8m8 4H8m2-8H8',
  calendar: 'M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z',
  clock: 'M12 8v4l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  dollar: 'M12 2v20m5-16H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  trend: 'm3 17 6-6 4 4 8-8m-6 0h6v6',
  send: 'm22 2-7 20-4-9-9-4 20-7ZM22 2 11 13',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14 5-5-5-5m5 5H9',
  filter: 'M4 6h16M7 12h10m-7 6h4',
  check: 'm5 12 4 4L19 6',
  menu: 'M4 6h16M4 12h16M4 18h16',
};

export default function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={paths[name]} />
    </svg>
  );
}
