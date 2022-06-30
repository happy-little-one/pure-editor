export default {
  build: {
    target: 'esnext',
    lib: {
      entry: './src/editor.ts',
      formats: ['es'],
      fileName: () => 'index.js',
    },
  },
}