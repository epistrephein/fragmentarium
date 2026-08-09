import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const requestedOrder = process.argv[2];

if (!/^\d+$/.test(requestedOrder ?? '')) {
  throw new Error('Usage: npm run publish -- <fragment-order>');
}

const storyDirectory = path.join(process.cwd(), 'src', 'content', 'story');
const files = (await readdir(storyDirectory)).filter((file) => file.endsWith('.md'));
const order = Number(requestedOrder);
const fragments = await Promise.all(
  files.map(async (file) => {
    const filePath = path.join(storyDirectory, file);
    const source = await readFile(filePath, 'utf8');
    const orderMatch = source.match(/^order:\s*(\d+)\s*$/m);

    if (!orderMatch) {
      throw new Error(`Fragment file ${file} does not have an order.`);
    }

    return {
      file,
      filePath,
      source,
      order: Number(orderMatch[1]),
      isDraft: /^draft:\s*true\s*$/m.test(source),
    };
  }),
);

const duplicateOrders = fragments
  .filter((fragment, index) => fragments.some((other, otherIndex) => otherIndex < index && other.order === fragment.order))
  .map((fragment) => `#${fragment.order}`);

if (duplicateOrders.length > 0) {
  throw new Error(`Duplicate fragment orders found: ${duplicateOrders.join(', ')}.`);
}

const draft = fragments.find((fragment) => fragment.order === order);

if (!draft) {
  throw new Error(`No fragment found with order ${order}.`);
}

if (!draft.isDraft) {
  throw new Error(`Fragment #${order} is not a draft.`);
}

const existingOrders = new Set(fragments.map((fragment) => fragment.order));
const missingOrders = Array.from({ length: order - 1 }, (_, index) => index + 1).filter(
  (previousOrder) => !existingOrders.has(previousOrder),
);

if (missingOrders.length > 0) {
  throw new Error(
    `Cannot publish fragment #${order}: earlier fragment numbers are missing: ${missingOrders
      .map((missingOrder) => `#${missingOrder}`)
      .join(', ')}.`,
  );
}

const earlierDrafts = fragments
  .filter((fragment) => fragment.order < order && fragment.isDraft)
  .sort((left, right) => left.order - right.order);

if (earlierDrafts.length > 0) {
  throw new Error(
    `Cannot publish fragment #${order}: publish earlier drafts first: ${earlierDrafts
      .map((fragment) => `#${fragment.order}`)
      .join(', ')}.`,
  );
}

const publishedSource = draft.source.replace(/^draft:\s*true\s*\r?\n/m, '');
await writeFile(draft.filePath, publishedSource, 'utf8');

console.log(`Published fragment #${order}: ${path.basename(draft.filePath)}`);
