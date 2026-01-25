import type { APIRoute } from 'astro';

// Import JSON data (canonical schema with metadata wrapper)
import meditations from '../../../../public/assets/stoa/meditations.json';
import epictetus from '../../../../public/assets/stoa/epictetus.json';
import seneca from '../../../../public/assets/stoa/seneca.json';

type CanonicalData = {
  metadata: {
    work: string;
    author: string;
    works: string[];
    translations: Record<string, string>;
    defaultTranslation: string;
  };
  entries: Entry[];
};

type Entry = {
  work?: string;
  book?: number | string;
  verse?: number | string;
  chapter?: string;
  letter?: string;
  text?: Record<string, string>;
  english?: string; // Legacy field
};

// Helper to normalize data (handles both old array format and new canonical format)
function normalizeData(data: any): CanonicalData {
  if (Array.isArray(data)) {
    // Old format: flat array of entries with 'english' field
    return {
      metadata: {
        work: 'Unknown',
        author: 'Unknown',
        works: [],
        translations: { english: 'Default' },
        defaultTranslation: 'english'
      },
      entries: data
    };
  }
  // New canonical format
  return data as CanonicalData;
}

const dataMap: Record<string, CanonicalData> = {
  marcus: normalizeData(meditations),
  epictetus: normalizeData(epictetus),
  seneca: normalizeData(seneca)
};

export const GET: APIRoute = ({ params, url }) => {
  const { phil } = params;
  const canonicalData = dataMap[phil as string];

  if (!canonicalData) {
    return new Response(JSON.stringify({ error: 'Philosopher not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { metadata, entries: allEntries } = canonicalData;

  // Query params for filtering
  const work = url.searchParams.get('work');
  const book = url.searchParams.get('book');
  const verse = url.searchParams.get('verse');
  const random = url.searchParams.get('random');

  let entries = [...allEntries];

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

  // Use metadata from canonical data, with fallbacks for legacy data
  const worksFromEntries = [...new Set(allEntries.map(e => e.work).filter(Boolean))];
  const defaultWorks: Record<string, string[]> = {
    marcus: ['Meditations'],
    epictetus: ['Enchiridion', 'Discourses'],
    seneca: ['Letters to Lucilius', 'Essays']
  };

  const works = metadata.works?.length > 0
    ? metadata.works
    : worksFromEntries.length > 0
      ? worksFromEntries
      : (defaultWorks[phil as string] || ['Works']);

  // Return with metadata wrapper
  return new Response(JSON.stringify({
    metadata: {
      ...metadata,
      works,
    },
    entries
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
