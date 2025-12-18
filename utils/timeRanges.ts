export type TimeRangeOption = {
  label: string;
  start: Date;
  end: Date;
};

export function getTimeRangeOptions(): TimeRangeOption[] {
  const now = new Date();
  const thisYear = new Date(now.getFullYear(), 0, 1);
  const lastYear = new Date(now.getFullYear() - 1, 0, 1);
  const lastYearEnd = new Date(now.getFullYear(), 0, 1);
  const last30Days = new Date(now);
  last30Days.setDate(last30Days.getDate() - 30);

  return [
    {
      label: 'This year',
      start: thisYear,
      end: now,
    },
    {
      label: 'Last year',
      start: lastYear,
      end: lastYearEnd,
    },
    {
      label: 'Last 30 days',
      start: last30Days,
      end: now,
    },
  ];
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatMonth(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long' });
}

export function getTimeOfDayLabel(hour: number): string {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

