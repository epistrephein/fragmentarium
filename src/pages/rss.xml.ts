import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { fragmentTitle, fragmentUrl, getFragmentsDescending } from '../lib/fragments';

const authorName = 'Tommaso Barbato';

export const GET: APIRoute = async (context) => {
  const fragments = await getFragmentsDescending();

  return rss({
    title: 'La campagna silenziosa',
    description:
      'Romanzo italiano pubblicato a frammenti: una provincia che si svuota, una campagna elettorale che nessuno nomina.',
    site: context.site!,
    trailingSlash: true,
    xmlns: { dc: 'http://purl.org/dc/elements/1.1/' },
    customData: `<language>it-IT</language><dc:creator>${authorName}</dc:creator>`,
    items: fragments.map((fragment) => ({
      title: fragmentTitle(fragment),
      link: fragmentUrl(fragment),
      pubDate: fragment.data.published,
      description:
        fragment.data.description ?? `${fragmentTitle(fragment)} de La campagna silenziosa.`,
      customData: `<dc:creator>${authorName}</dc:creator>`,
    })),
  });
};
