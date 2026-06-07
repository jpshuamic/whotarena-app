import { REALTIME_TABLES, supabase } from '../lib/supabase';

export function useRealtime(
  table: (typeof REALTIME_TABLES)[number],
  filter: string,
  onUpdate: () => void,
) {
  const channel = supabase
    .channel(`${table}-${filter}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table, filter },
      onUpdate,
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
