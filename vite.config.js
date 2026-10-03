import { defineConfig } from 'vite';

const release = Date.now().toString();
export default defineConfig({
  define: { __GNZ_RELEASE__: JSON.stringify(release) },
  plugins: [{
    name: 'gnz-release-manifest',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ release }) });
    },
  }],
});
