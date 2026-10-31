import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

function ensureOriginalPhotosExtractedForBuild(rootDir: string) {
  try {
    const publicMediaDir = path.resolve(rootDir, 'public', 'assets', 'uploaded');
    fs.mkdirSync(publicMediaDir, {recursive: true});
    const requiredFile = path.join(publicMediaDir, 'media_385d6b17539c87cc.jpg');
    if (fs.existsSync(requiredFile)) return;

    const pastePath = path.resolve(rootDir, 'public', 'assets', 'aistudio', 'Paste_October_30__2026_-_1_46AM_e53a9960');
    if (!fs.existsSync(pastePath)) return;

    const raw = fs.readFileSync(pastePath, 'utf-8').trim();
    const urlObj = new URL(raw);
    const d = urlObj.searchParams.get('d');
    if (!d) return;

    let b64 = d.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4 !== 0) b64 += '=';
    const parsed = JSON.parse(Buffer.from(b64, 'base64').toString('utf-8'));

    const writePhoto = (dataUrl: string | undefined, filenames: string[]) => {
      if (!dataUrl || !dataUrl.includes(',')) return;
      const buf = Buffer.from(dataUrl.split(',')[1], 'base64');
      for (const name of filenames) {
        const target = path.join(publicMediaDir, name);
        if (!fs.existsSync(target)) {
          fs.writeFileSync(target, buf);
        }
      }
    };

    writePhoto(parsed.groomAvatarUrl, ['media_385d6b17539c87cc.jpg', 'media_04bbb52038e5c1c2.jpg']);
    writePhoto(parsed.brideAvatarUrl, ['media_debf66392f8c9341.jpg', 'media_fc522fec3928155b.jpg']);
    writePhoto(parsed.heroPhotoUrl, ['media_cca42efe1813d7a6.jpg', 'media_f537bb51898bd9a8.jpg']);
    if (Array.isArray(parsed.galleryPhotos) && parsed.galleryPhotos[0]) {
      writePhoto(parsed.galleryPhotos[0], ['media_48034d471b1e1c49.jpg', 'media_0d887f85423e6db0.jpg']);
    }
  } catch (e) {
    console.error('Build media extraction warning:', e);
  }
}

function escapeAttr(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function cloudflareStaticRoutesPlugin() {
  return {
    name: 'cloudflare-static-routes',
    buildStart() {
      ensureOriginalPhotosExtractedForBuild(__dirname);
    },
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      const indexHtmlPath = path.join(distDir, 'index.html');
      if (!fs.existsSync(indexHtmlPath)) return;

      // Ensure no legacy _redirects file exists in dist that could trigger Cloudflare infinite loop errors
      const redirectsPath = path.join(distDir, '_redirects');
      if (fs.existsSync(redirectsPath)) {
        fs.unlinkSync(redirectsPath);
      }

      // 1. Copy all media files from public/assets/uploaded and .data/media into dist/api/media and dist/assets/uploaded
      // so /api/media/*.jpg URLs work 100% natively on Cloudflare Workers static assets!
      const distApiMediaDir = path.join(distDir, 'api', 'media');
      const distUploadedDir = path.join(distDir, 'assets', 'uploaded');
      fs.mkdirSync(distApiMediaDir, {recursive: true});
      fs.mkdirSync(distUploadedDir, {recursive: true});

      for (const srcMediaDir of [
        path.resolve(__dirname, 'public', 'assets', 'uploaded'),
        path.resolve(__dirname, '.data', 'media')
      ]) {
        if (fs.existsSync(srcMediaDir)) {
          for (const file of fs.readdirSync(srcMediaDir)) {
            const srcFile = path.join(srcMediaDir, file);
            if (fs.statSync(srcFile).isFile()) {
              fs.copyFileSync(srcFile, path.join(distApiMediaDir, file));
              fs.copyFileSync(srcFile, path.join(distUploadedDir, file));
            }
          }
        }
      }

      // 2. Load latest persisted state from .data/wedding-store.json or src/data/server-store.json
      let store: any = null;
      for (const candidate of [
        path.resolve(__dirname, '.data', 'wedding-store.json'),
        path.resolve(__dirname, 'src', 'data', 'server-store.json')
      ]) {
        try {
          if (fs.existsSync(candidate)) {
            store = JSON.parse(fs.readFileSync(candidate, 'utf-8'));
            if (store && store.defaultData) break;
          }
        } catch {}
      }

      const rawBaseHtml = fs.readFileSync(indexHtmlPath, 'utf-8');
      const defaultData = store?.defaultData || {};

      const injectStateForSide = (html: string, side: 'groom' | 'bride', customData?: any) => {
        const activeData = customData || defaultData;
        if (!store) return html;
        const safeJson = JSON.stringify({
          side,
          data: activeData,
          users: store.users || [],
          accountBackups: store.byAccount || {}
        }).replace(/</g, '\\u003c');
        const scriptTag = `<script>window.__INITIAL_WEDDING_STATE__ = ${safeJson};</script>`;
        if (html.includes('window.__INITIAL_WEDDING_STATE__')) {
          return html;
        }
        return html.replace('</head>', `  ${scriptTag}\n  </head>`);
      };

      const defaultGroomTitle = 'Thiệp Mời Tiệc Báo Hỷ - Quang Hưng & Minh Tuệ';
      const defaultGroomDesc =
        'Kính mời quý khách tới dự tiệc báo hỷ của Quang Hưng & Minh Tuệ vào lúc 16:00 ngày 29/11/2026 tại Số nhà 10, Đường số 4, thôn Đằng Xá, xã Hoằng Hóa, tỉnh Thanh Hóa';

      const defaultBrideTitle = 'Thiệp Mời Tiệc Báo Hỷ - Minh Tuệ & Quang Hưng';
      const defaultBrideDesc =
        'Kính mời quý khách tới dự tiệc báo hỷ của Minh Tuệ & Quang Hưng vào lúc 10:00 ngày 22/11/2026 tại Số nhà 21 Thôn 1 Làng Bát, xã Hàm Yên, tỉnh Tuyên Quang';

      const rawGTitle = (defaultData?.shareGroom?.title || '').trim();
      const groomTitle = escapeAttr(
        !rawGTitle || rawGTitle === 'Thiệp Mời Tiệc Hỷ - Quang Hưng & Minh Tuệ'
          ? defaultGroomTitle
          : rawGTitle
      );

      const rawGDesc = (defaultData?.shareGroom?.description || '').trim();
      const groomDesc = escapeAttr(
        !rawGDesc || (!rawGDesc.includes('vào lúc') && !rawGDesc.includes('tại'))
          ? defaultGroomDesc
          : rawGDesc
      );

      const rawBTitle = (defaultData?.shareBride?.title || '').trim();
      const brideTitle = escapeAttr(
        !rawBTitle ||
        rawBTitle === 'Thiệp Mời Tiệc Hỷ - Minh Tuệ & Quang Hưng' ||
        rawBTitle === 'Thiệp Mời Tiệc Báo Hỷ - Minh Tuệ & Quang Hưn'
          ? defaultBrideTitle
          : rawBTitle
      );

      const rawBDesc = (defaultData?.shareBride?.description || '').trim();
      const brideDesc = escapeAttr(
        !rawBDesc || (!rawBDesc.includes('vào lúc') && !rawBDesc.includes('tại'))
          ? defaultBrideDesc
          : rawBDesc
      );

      const applyMetaTags = (html: string, title: string, desc: string) =>
        html
          .replace(/<title>.*?<\/title>/is, `<title>${title}</title>`)
          .replace(
            /<meta\s+name="description"\s+content=".*?"\s*\/?>/i,
            `<meta name="description" content="${desc}" />`
          )
          .replace(
            /<meta\s+property="og:title"\s+content=".*?"\s*\/?>/i,
            `<meta property="og:title" content="${title}" />`
          )
          .replace(
            /<meta\s+property="og:description"\s+content=".*?"\s*\/?>/i,
            `<meta property="og:description" content="${desc}" />`
          )
          .replace(
            /<meta\s+name="twitter:title"\s+content=".*?"\s*\/?>/i,
            `<meta name="twitter:title" content="${title}" />`
          )
          .replace(
            /<meta\s+name="twitter:description"\s+content=".*?"\s*\/?>/i,
            `<meta name="twitter:description" content="${desc}" />`
          );

      const groomHtml = applyMetaTags(
        injectStateForSide(rawBaseHtml, 'groom', defaultData),
        groomTitle,
        groomDesc
      );

      const brideHtml = applyMetaTags(
        injectStateForSide(rawBaseHtml, 'bride', defaultData),
        brideTitle,
        brideDesc
      );

      // Write root index.html and 404.html with full Groom metadata
      fs.writeFileSync(indexHtmlPath, groomHtml, 'utf-8');
      fs.writeFileSync(path.join(distDir, '404.html'), groomHtml, 'utf-8');

      // 4. Create dedicated Nhà Trai static route directories (/nha-trai, /i/quanghung-minhtue, /i/quanghungminhtue, etc.)
      const groomSlug = (defaultData?.customSlugGroom || 'quanghung-minhtue')
        .trim()
        .replace(/^\/+|\/+$/g, '');
      const groomCleanSlug = groomSlug.replace(/[^a-z0-9]/gi, '');
      for (const routePath of Array.from(
        new Set(
          [
            'nha-trai',
            'nhatrai',
            'i/nha-trai',
            'i/nhatrai',
            'i/quanghungminhtue',
            'i/quanghung-minhtue',
            groomSlug ? `i/${groomSlug}` : '',
            groomCleanSlug ? `i/${groomCleanSlug}` : ''
          ].filter(Boolean)
        )
      )) {
        const dir = path.join(distDir, routePath);
        fs.mkdirSync(dir, {recursive: true});
        fs.writeFileSync(path.join(dir, 'index.html'), groomHtml, 'utf-8');
      }

      // 5. Create dedicated Nhà Gái static route directories (/nha-gai, /i/minhtue-quanghung, /i/minhtuequanghung, etc.)
      const brideSlug = (defaultData?.customSlugBride || 'minhtue-quanghung')
        .trim()
        .replace(/^\/+|\/+$/g, '');
      const brideCleanSlug = brideSlug.replace(/[^a-z0-9]/gi, '');
      for (const routePath of Array.from(
        new Set(
          [
            'nha-gai',
            'nhagai',
            'i/nha-gai',
            'i/nhagai',
            'i/minhtuequanghung',
            'i/minhtue-quanghung',
            brideSlug ? `i/${brideSlug}` : '',
            brideCleanSlug ? `i/${brideCleanSlug}` : ''
          ].filter(Boolean)
        )
      )) {
        const dir = path.join(distDir, routePath);
        fs.mkdirSync(dir, {recursive: true});
        fs.writeFileSync(path.join(dir, 'index.html'), brideHtml, 'utf-8');
      }

      // 6. Ensure _worker.js is copied into dist/_worker.js for Cloudflare Pages / Workers
      const publicWorkerPath = path.resolve(__dirname, 'public', '_worker.js');
      if (fs.existsSync(publicWorkerPath)) {
        fs.copyFileSync(publicWorkerPath, path.join(distDir, '_worker.js'));
      }
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), cloudflareStaticRoutesPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

