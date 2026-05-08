import type { APIRoute } from 'astro';

import meditations from '../../../../public/assets/stoa/meditations.json';
import epictetus from '../../../../public/assets/stoa/epictetus.json';
import seneca from '../../../../public/assets/stoa/seneca.json';
import diogenes from '../../../../public/assets/stoa/diogenes.json';
import musashi from '../../../../public/assets/stoa/musashi.json';

type CanonicalData = {
  metadata: {
    work?: string;
    author: string;
    school: string;
    works: string[];
    translations: Record<string, string>;
    defaultTranslation: string;
  };
  entries: Entry[];
};

type Entry = {
  id?: string;
  work?: string;
  book?: number | string;
  verse?: number | string;
  chapter?: string;
  letter?: string;
  text?: Record<string, string>;
  english?: string; // legacy — kept for backward compat
};

function normalizeData(data: any, fallbackSchool: string): CanonicalData {
  if (Array.isArray(data)) {
    return {
      metadata: {
        author: 'Unknown',
        school: fallbackSchool,
        works: [],
        translations: { english: 'Default' },
        defaultTranslation: 'english'
      },
      entries: data
    };
  }
  return data as CanonicalData;
}

const dataMap: Record<string, CanonicalData> = {
  marcus:    normalizeData(meditations, 'stoicism'),
  epictetus: normalizeData(epictetus,   'stoicism'),
  seneca:    normalizeData(seneca,      'stoicism'),
  diogenes:  normalizeData(diogenes,    'cynicism'),
  musashi:   normalizeData(musashi,     'tactical')
};

// All philosophers indexed by school for the /api/stoa/school?name= pattern
const schoolIndex: Record<string, string[]> = {
  stoicism: ['marcus', 'epictetus', 'seneca'],
  cynicism: ['diogenes'],
  tactical: ['musashi']
};

export const GET: APIRoute = ({ params, url }) => {
  const { phil } = params;

  // School query: /api/stoa/school?name=stoicism
  if (phil === 'school') {
    const name = url.searchParams.get('name');
    if (!name || !schoolIndex[name]) {
      return new Response(JSON.stringify({ error: 'School not found', available: Object.keys(schoolIndex) }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return new Response(JSON.stringify({ school: name, philosophers: schoolIndex[name] }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const canonicalData = dataMap[phil as string];

  if (!canonicalData) {
    return new Response(JSON.stringify({ error: 'Philosopher not found', available: Object.keys(dataMap) }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { metadata, entries: allEntries } = canonicalData;

  // Query params
  const work   = url.searchParams.get('work');
  const book   = url.searchParams.get('book');
  const verse  = url.searchParams.get('verse');
  const tag    = url.searchParams.get('tag');
  const random = url.searchParams.get('random');

  let entries = [...allEntries];

  // Musashi entries carry no work field — synthesize from book number
  if (phil === 'musashi') {
    const scrolls: Record<number, string> = {
      1: 'The Book of Five Rings (The Earth Scroll)',
      2: 'The Book of Five Rings (The Water Scroll)',
      3: 'The Book of Five Rings (The Fire Scroll)',
      4: 'The Book of Five Rings (The Wind Scroll)',
      5: 'The Book of Five Rings (The Ether Scroll)',
    };
    entries = entries.map(e => ({ ...e, work: scrolls[e.book as number] ?? 'The Book of Five Rings' }));
  }

  if (work)  entries = entries.filter(e => e.work === work);
  if (book)  entries = entries.filter(e => String(e.book) === book);
  if (verse) entries = entries.filter(e => String(e.verse ?? e.chapter ?? e.letter) === verse);
  if (tag)   entries = entries.filter(e => (e as any).tags?.includes(tag));

  if (random === 'true') {
    const entry = entries[Math.floor(Math.random() * entries.length)];
    return new Response(JSON.stringify(entry), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const worksFromEntries = [...new Set(allEntries.map(e => e.work).filter(Boolean))] as string[];
  const defaultWorks: Record<string, string[]> = {
    marcus:    ['Meditations'],
    epictetus: ['Enchiridion', 'Discourses'],
    seneca:    ['Letters to Lucilius', 'Essays']
  };

  const works = metadata.works?.length > 0
    ? metadata.works
    : worksFromEntries.length > 0
      ? worksFromEntries
      : (defaultWorks[phil as string] ?? ['Works']);

  return new Response(JSON.stringify({
    metadata: { ...metadata, works },
    entries
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
