import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const story = defineCollection({
  loader: glob({ base: './src/content/story', pattern: '**/*.md' }),
  schema: z.object({
    published: z.coerce.date(),
    order: z.number().int().positive(),
    description: z.string().optional(),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = { story };
