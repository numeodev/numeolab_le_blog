import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import fs from 'node:fs';
import path from 'node:path';
import { SITE_TITLE, SITE_AUTHOR } from '../../consts';

export async function getStaticPaths() {
  const entries = await getCollection('articles');
  return entries.map((entry) => ({
    params: { slug: entry.id },
    props: {
      title: entry.data.title,
      description: entry.data.metaDescription || entry.data.description,
    },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const { title, description } = props as { title: string; description: string };

  const fontRegular = fs.readFileSync(path.join(process.cwd(), 'public', 'fonts', 'FiraCode-Regular.ttf'));
  const fontBold = fs.readFileSync(path.join(process.cwd(), 'public', 'fonts', 'FiraCode-Bold.ttf'));

  const displayTitle = title.length > 60 ? title.slice(0, 60) + '…' : title;
  const displayDesc = description.length > 110 ? description.slice(0, 110) + '…' : description;

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#0f172a',
          padding: '60px',
          fontFamily: 'FiraCode',
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                color: '#94a3b8',
                fontSize: 22,
                fontWeight: 400,
                letterSpacing: 1,
              },
              children: SITE_TITLE,
            },
          },
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      fontSize: 62,
                      fontWeight: 700,
                      color: '#f8fafc',
                      lineHeight: 1.15,
                      letterSpacing: -1,
                    },
                    children: displayTitle,
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      fontSize: 24,
                      fontWeight: 400,
                      color: '#64748b',
                      lineHeight: 1.5,
                    },
                    children: displayDesc,
                  },
                },
              ],
            },
          },
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      width: '100%',
                      height: 4,
                      backgroundImage: 'linear-gradient(90deg, #38bdf8, #818cf8, #c084fc)',
                      borderRadius: 2,
                    },
                    children: '',
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      color: '#475569',
                      fontSize: 20,
                      fontWeight: 400,
                    },
                    children: `by ${SITE_AUTHOR}`,
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'FiraCode', data: fontRegular, weight: 400, style: 'normal' },
        { name: 'FiraCode', data: fontBold, weight: 700, style: 'normal' },
      ],
    }
  );

  const resvg = new Resvg(svg);
  const png = resvg.render().asPng();

  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' },
  });
};
