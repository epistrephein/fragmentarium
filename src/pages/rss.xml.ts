import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { fragmentTitle, fragmentUrl, getFragmentsDescending } from '../lib/fragments';

const authorName = 'Tommaso Barbato';

export const GET: APIRoute = async (context) => {
  const fragments = await getFragmentsDescending();

  return rss({
    title: 'The Silent Campaign',
    description:
      'An Italian novel published in fragments: a province emptying out, an election campaign no one names.',
    site: new URL(import.meta.env.BASE_URL, context.site!),
    trailingSlash: true,
    xmlns: { dc: 'http://purl.org/dc/elements/1.1/' },
    customData: `<language>en-US</language><dc:creator>${authorName}</dc:creator>`,
    items: fragments.map((fragment) => ({
      title: fragmentTitle(fragment),
      link: fragmentUrl(fragment),
      pubDate: fragment.data.published,
      description:
        fragment.data.description ?? `${fragmentTitle(fragment)} from The Silent Campaign.`,
      customData: `<dc:creator>${authorName}</dc:creator>`,
    })),
  });
};
