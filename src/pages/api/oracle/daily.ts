import type { APIRoute } from 'astro';
import meditations from '../../../../public/assets/stoa/meditations.json';

function dateSeed(date: Date): number {
  const str = `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`;
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  }
  return Math.abs(h);
}

function dayOfYear(date: Date): number {
  const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 0));
  return Math.floor((date.getTime() - start.getTime()) / 86_400_000);
}

export const GET: APIRoute = ({ url }) => {
  const param = url.searchParams.get('date');
  const date  = param ? new Date(param) : new Date();

  const entries = meditations.entries;
  const seed    = dateSeed(date);
  const entry   = entries[seed % entries.length];

  return new Response(JSON.stringify({
    entry,
    meta: {
      date:       date.toISOString().split('T')[0],
      seed,
      dayOfYear:  dayOfYear(date),
    }
  }), { headers: { 'Content-Type': 'application/json' } });
};
