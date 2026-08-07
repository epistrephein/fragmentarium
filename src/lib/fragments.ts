import { getCollection, type CollectionEntry } from 'astro:content';

export type Fragment = CollectionEntry<'story'>;

/** Every published fragment (drafts are always excluded), in narrative order. */
export async function getFragments(): Promise<Fragment[]> {
  const fragments = await getCollection('story', ({ data }) => data.draft !== true);
  return fragments.sort((a, b) => a.data.order - b.data.order);
}

/** The same fragments, newest publication date first. */
export async function getRecentFragments(): Promise<Fragment[]> {
  const fragments = await getFragments();
  return [...fragments].sort((a, b) => {
    const delta = b.data.published.getTime() - a.data.published.getTime();
    return delta !== 0 ? delta : b.data.order - a.data.order;
  });
}

export function fragmentTitle(fragment: Fragment): string {
  return `Frammento #${fragment.data.order}`;
}

export function fragmentUrl(fragment: Fragment): string {
  return `/fragments/${fragment.data.order}/`;
}

const dateFormatter = new Intl.DateTimeFormat('it-IT', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
});

/** dd/mm/YYYY. */
export function formatDate(date: Date): string {
  return dateFormatter.format(date);
}

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
