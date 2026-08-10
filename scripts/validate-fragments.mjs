import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const storyDirectory = path.join(process.cwd(), 'src', 'content', 'story');
const files = (await readdir(storyDirectory)).filter((file) => file.endsWith('.md'));

const fragments = await Promise.all(
  files.map(async (file) => {
    const source = await readFile(path.join(storyDirectory, file), 'utf8');
    const orderMatch = source.match(/^order:\s*(\d+)\s*$/m);

    if (!orderMatch) {
      throw new Error(`Fragment file ${file} does not have an order.`);
    }

    return {
      file,
      order: Number(orderMatch[1]),
      isDraft: /^draft:\s*true\s*$/m.test(source),
    };
  }),
);

const invalidOrders = fragments.filter((fragment) => fragment.order < 1);
if (invalidOrders.length > 0) {
  throw new Error(`Fragment orders must be positive: ${invalidOrders.map((fragment) => fragment.file).join(', ')}.`);
}

const duplicateOrders = fragments
  .filter((fragment, index) => fragments.some((other, otherIndex) => otherIndex < index && other.order === fragment.order))
  .map((fragment) => `#${fragment.order}`);

if (duplicateOrders.length > 0) {
  throw new Error(`Duplicate fragment orders found: ${duplicateOrders.join(', ')}.`);
}

const publishedFragments = fragments.filter((fragment) => !fragment.isDraft);
const highestPublishedOrder = Math.max(0, ...publishedFragments.map((fragment) => fragment.order));
const fragmentsByOrder = new Map(fragments.map((fragment) => [fragment.order, fragment]));
const gaps = [];

for (let order = 1; order <= highestPublishedOrder; order += 1) {
  const fragment = fragmentsByOrder.get(order);

  if (!fragment) {
    gaps.push(`#${order} (missing)`);
  } else if (fragment.isDraft) {
    gaps.push(`#${order} (draft)`);
  }
}

if (gaps.length > 0) {
  throw new Error(
    `Published fragments must be consecutive from #1. Resolve earlier fragments before publishing later ones: ${gaps.join(', ')}.`,
  );
}

console.log(`Fragment sequence is valid (${publishedFragments.length} published fragment${publishedFragments.length === 1 ? '' : 's'}).`);
