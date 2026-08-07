import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const storyDirectory = path.join(process.cwd(), 'src', 'content', 'story');
const files = (await readdir(storyDirectory)).filter((file) => file.endsWith('.md'));
const drafts = [];

for (const file of files) {
  const source = await readFile(path.join(storyDirectory, file), 'utf8');

  if (!/^draft:\s*true\s*$/m.test(source)) {
    continue;
  }

  const order = source.match(/^order:\s*(\d+)\s*$/m)?.[1];
  const published = source.match(/^published:\s*(.+)\s*$/m)?.[1];

  if (!order || !published) {
    throw new Error(`Missing frontmatter order or published date in ${file}`);
  }

  drafts.push({ file, order: Number(order), published });
}

drafts.sort((a, b) => a.order - b.order);

if (drafts.length === 0) {
  console.log('No drafts found.');
} else {
  console.log('Drafts:');
  for (const draft of drafts) {
    console.log(`  #${draft.order} — ${draft.published} — ${draft.file}`);
  }
}
