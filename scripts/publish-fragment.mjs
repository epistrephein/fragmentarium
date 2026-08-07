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
let draftPath;
let draftSource;

for (const file of files) {
  const filePath = path.join(storyDirectory, file);
  const source = await readFile(filePath, 'utf8');
  const fileOrder = Number(source.match(/^order:\s*(\d+)\s*$/m)?.[1]);

  if (fileOrder === order) {
    draftPath = filePath;
    draftSource = source;
    break;
  }
}

if (!draftPath || !draftSource) {
  throw new Error(`No fragment found with order ${order}.`);
}

if (!/^draft:\s*true\s*$/m.test(draftSource)) {
  throw new Error(`Fragment #${order} is not a draft.`);
}

const publishedSource = draftSource.replace(/^draft:\s*true\s*\r?\n/m, '');
await writeFile(draftPath, publishedSource, 'utf8');

console.log(`Published fragment #${order}: ${path.basename(draftPath)}`);
