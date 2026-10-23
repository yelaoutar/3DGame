import {defineConfig} from 'vite';

export default defineConfig({
  // Relative paths work at both / and /repository-name/ on GitHub Pages.
  base: './',
  plugins: [{
    name: 'remove-development-import-map',
    apply: 'build',
    transformIndexHtml(html) {
      return html.replace(/<script type="importmap">[\s\S]*?<\/script>/, '');
    },
  }],
});
