import type { APIRoute } from 'astro';

// Import JSON data
import meditations from '../../../../public/assets/stoa/meditations.json';
import epictetus from '../../../../public/assets/stoa/epictetus.json';
import seneca from '../../../../public/assets/stoa/seneca.json';

type Entry = {
  id: string;
  book?: string;
  verse?: string;
  work?: string;
  chapter?: string;
  letter?: string;
  english: string;
  comment: string | null;
};

const dataMap: Record<string, Entry[]> = {
  marcus: meditations as Entry[],
  epictetus: epictetus as Entry[],
  seneca: seneca as Entry[]
};

export const GET: APIRoute = ({ params, url }) => {
  const { phil } = params;
  const data = dataMap[phil as string];

  if (!data) {
    return new Response(JSON.stringify({ error: 'Philosopher not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Query params for filtering
  const work = url.searchParams.get('work');
  const book = url.searchParams.get('book');
  const verse = url.searchParams.get('verse');
  const random = url.searchParams.get('random');

  let entries = [...data];

  // Filter by work (for philosophers with multiple texts)
  if (work) {
    entries = entries.filter(e => e.work === work);
  }

  // Filter by book (numeric for Marcus, or work-based for others)
  if (book) {
    entries = entries.filter(e =>
      String(e.book) === book
    );
  }

  // Filter by verse/chapter/letter
  if (verse) {
    entries = entries.filter(e =>
      String(e.verse || e.chapter || e.letter) === verse
    );
  }

  // Return random entry
  if (random === 'true') {
    const randomEntry = entries[Math.floor(Math.random() * entries.length)];
    return new Response(JSON.stringify(randomEntry), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Extract unique works for metadata, with defaults for single-work philosophers
  const worksFromData = [...new Set(data.map(e => e.work).filter(Boolean))];

  // Default work names for philosophers without work field in entries
  const defaultWorks: Record<string, string[]> = {
    marcus: ['Meditations'],
    epictetus: ['Enchiridion', 'Discourses'],
    seneca: ['Letters to Lucilius', 'Essays']
  };

  const works = worksFromData.length > 0 ? worksFromData : (defaultWorks[phil as string] || ['Works']);

  // Return with metadata wrapper for QuoteGenerator compatibility
  return new Response(JSON.stringify({
    metadata: {
      works,
      translations: { english: 'Default' },
      defaultTranslation: 'english'
    },
    entries
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
