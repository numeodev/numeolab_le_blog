import fs from 'node:fs';
import path from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

// Images de partage 1200 × 630, d'après la planche « Images de partage » de
// l'identité visuelle : fond Encre, motif du cadran, signature en pied.

const WIDTH = 1200;
const HEIGHT = 630;

const C = {
  ink: '#0B1220',
  line: '#1E293B',
  lineStrong: '#334155',
  paper: '#F8FAFC',
  text: '#E2E8F0',
  muted: '#94A3B8',
  signal: '#818CF8',
  signalLight: '#A5B4FC',
};

type Node = { type: string; props: Record<string, unknown> };
type Child = Node | string;

const h = (type: string, style: Record<string, unknown>, ...children: Child[]): Node => ({
  type,
  props: { style, children: children.length === 1 ? children[0] : children },
});

const img = (src: string, style: Record<string, unknown>): Node => ({
  type: 'img',
  props: { src, style, width: style.width, height: style.height },
});

const svgDataUri = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

const DIAL = svgDataUri(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><circle cx="18" cy="18" r="13.5" fill="none" stroke="${C.paper}" stroke-width="5.4" stroke-dasharray="76 8.8" transform="rotate(-26 18 18)"/><line x1="18" y1="18" x2="27.5" y2="8.5" stroke="${C.signal}" stroke-width="3.4" stroke-linecap="round"/><circle cx="18" cy="18" r="2.6" fill="${C.signal}"/></svg>`
);

const ARC = svgDataUri(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 185"><circle cx="180" cy="185" r="170" fill="none" stroke="${C.lineStrong}" stroke-width="1.5" stroke-dasharray="1008 60" transform="rotate(-34.9 180 185)"/><circle cx="180" cy="185" r="115" fill="none" stroke="${C.line}" stroke-width="1"/><line x1="180" y1="185" x2="286" y2="79" stroke="${C.signal}" stroke-width="2" stroke-linecap="round"/><circle cx="180" cy="185" r="5" fill="${C.signal}"/></svg>`
);

const fontFile = (pkg: string, file: string) =>
  fs.readFileSync(path.join(process.cwd(), 'node_modules', '@fontsource', pkg, 'files', file));

let fonts: Parameters<typeof satori>[1]['fonts'] | undefined;
const loadFonts = () =>
  (fonts ??= [
    { name: 'Newsreader', data: fontFile('newsreader', 'newsreader-latin-500-normal.woff'), weight: 500, style: 'normal' },
    { name: 'Newsreader', data: fontFile('newsreader', 'newsreader-latin-500-italic.woff'), weight: 500, style: 'italic' },
    { name: 'Newsreader', data: fontFile('newsreader', 'newsreader-latin-600-normal.woff'), weight: 600, style: 'normal' },
    { name: 'Plex Sans', data: fontFile('ibm-plex-sans', 'ibm-plex-sans-latin-400-normal.woff'), weight: 400, style: 'normal' },
    { name: 'Plex Sans', data: fontFile('ibm-plex-sans', 'ibm-plex-sans-latin-600-normal.woff'), weight: 600, style: 'normal' },
    { name: 'Plex Mono', data: fontFile('ibm-plex-mono', 'ibm-plex-mono-latin-400-normal.woff'), weight: 400, style: 'normal' },
  ]);

const wordmark = (size: number) =>
  h(
    'div',
    { display: 'flex', alignItems: 'center', fontFamily: 'Plex Sans', fontSize: size, fontWeight: 600, letterSpacing: -0.02 * size, color: C.paper, lineHeight: 1 },
    'nume',
    img(DIAL, { width: size * 0.6, height: size * 0.6, margin: `${size * 0.04}px ${size * 0.015}px 0` }),
    'lab'
  );

const frame = (content: Node[], footerLeft: Node, footerRight: string, arc: { width: number; right: number }) =>
  h(
    'div',
    { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', backgroundColor: C.ink, color: C.text, fontFamily: 'Plex Sans' },
    img(ARC, { position: 'absolute', right: arc.right, bottom: 96, width: arc.width, height: (arc.width * 185) / 360 }),
    h('div', { display: 'flex', flexDirection: 'column', flexGrow: 1, padding: '64px 72px 0' }, ...content),
    h(
      'div',
      { height: 96, padding: '0 72px', borderTop: `1px solid ${C.lineStrong}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
      footerLeft,
      h('div', { display: 'flex', fontFamily: 'Plex Mono', fontSize: 20, color: C.muted }, footerRight)
    )
  );

async function render(node: Node): Promise<Uint8Array<ArrayBuffer>> {
  const svg = await satori(node as Parameters<typeof satori>[0], { width: WIDTH, height: HEIGHT, fonts: loadFonts() });
  return new Uint8Array(new Resvg(svg).render().asPng());
}

const LONG_TITLE = 70;

export function renderArticleImage(opts: { kicker: string; title: string; description: string; footer: string }) {
  const long = opts.title.length > LONG_TITLE;
  const title = h(
    'div',
    {
      display: 'block',
      marginTop: 36,
      maxWidth: long ? 840 : 820,
      fontFamily: 'Newsreader',
      fontWeight: 600,
      fontSize: long ? 54 : 66,
      lineHeight: long ? 1.12 : 1.08,
      letterSpacing: long ? -0.54 : -1,
      color: C.paper,
      lineClamp: long ? 4 : 3,
    },
    opts.title
  );
  const content = [h('div', { display: 'flex', fontFamily: 'Plex Mono', fontSize: 22, color: C.signal }, opts.kicker), title];
  if (!long) {
    content.push(
      h('div', { display: 'block', marginTop: 26, maxWidth: 740, fontSize: 26, lineHeight: 1.45, color: C.muted, lineClamp: 2 }, opts.description)
    );
  }
  return render(frame(content, wordmark(30), opts.footer, { width: 300, right: 48 }));
}

export function renderSiteImage() {
  const tagline = h(
    'div',
    { display: 'flex', flexWrap: 'wrap', marginTop: 48, maxWidth: 760, fontFamily: 'Newsreader', fontWeight: 500, fontSize: 52, lineHeight: 1.12, color: C.text },
    'Génie logiciel, résilience et ',
    h('span', { fontStyle: 'italic', color: C.signalLight }, 'ergonomie cognitive'),
    '.'
  );
  return render(
    frame(
      [wordmark(76), tagline],
      h('div', { display: 'flex', fontFamily: 'Plex Mono', fontSize: 20, color: C.signal }, 'Blog technique'),
      'numeolab.fr',
      { width: 360, right: 46 }
    )
  );
}
