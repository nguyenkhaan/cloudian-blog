import Prism from 'prismjs';

// Assign Prism to window object so that language components can find it globally
(window as any).Prism = Prism;

let isInitialized = false;

export async function initPrism() {
  if (isInitialized) return;
  
  // Assign again to be absolutely sure
  (window as any).Prism = Prism;

  // Dynamically import required language components to bypass ESM hoisting
  // @ts-ignore
  await import('prismjs/components/prism-clike');
  // @ts-ignore
  await import('prismjs/components/prism-javascript');
  // @ts-ignore
  await import('prismjs/components/prism-typescript');
  // @ts-ignore
  await import('prismjs/components/prism-css');
  // @ts-ignore
  await import('prismjs/components/prism-json');
  // @ts-ignore
  await import('prismjs/components/prism-bash');

  isInitialized = true;
}

export default Prism;
