import { defineConfig } from 'vite';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pages, pageDescription } from './src/lib/page-routes.js';

const release = Date.now().toString();
export default defineConfig({
  define: { __GNZ_RELEASE__: JSON.stringify(release) },
  plugins: [{
    name: 'gnz-release-manifest',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ release }) });
    },
    writeBundle(options) {
      const directory = options.dir || 'dist';
      const html = readFileSync(resolve(directory, 'index.html'), 'utf8');
      const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
      for (const [page, title] of Object.entries(pages)) {
        const output = html
          .replace(/<title>.*?<\/title>/s, `<title>${escape(title)} | GZNSPORTS</title>`)
          .replace(/(<meta\s+name="description"\s+content=")[^"]*/, `$1${escape(pageDescription(page))}`)
          .replace(/(<meta\s+property="og:title"\s+content=")[^"]*/, `$1${escape(title)} | GZNSPORTS`)
          .replace(/(<meta\s+property="og:description"\s+content=")[^"]*/, `$1${escape(pageDescription(page))}`)
          .replace('</head>', `<link rel="canonical" href="/${page}" />${['admin', 'tracking'].includes(page) ? '<meta name="robots" content="noindex, nofollow" />' : ''}</head>`);
        writeFileSync(resolve(directory, `${page}.html`), output);
      }
    },
  }],
});
