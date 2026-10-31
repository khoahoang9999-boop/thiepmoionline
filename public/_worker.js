/**
 * Cloudflare Worker edge script to dynamically rewrite OpenGraph meta tags
 * for Zalo, Facebook, iMessage, and Twitter crawlers when hosted on Cloudflare Pages / Workers.
 */
const EDGE_STATE_CACHE_URL = 'https://thiepmoionline-edge-state.internal/wedding-state-v52';

async function loadEdgeState() {
  try {
    if (typeof caches !== 'undefined' && caches.default) {
      const cached = await caches.default.match(EDGE_STATE_CACHE_URL);
      if (cached) {
        return await cached.json();
      }
    }
  } catch (e) {}
  return null;
}

async function saveEdgeState(state) {
  try {
    if (typeof caches !== 'undefined' && caches.default && state) {
      const res = new Response(JSON.stringify(state), {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'public, max-age=31536000'
        }
      });
      await caches.default.put(EDGE_STATE_CACHE_URL, res);
    }
  } catch (e) {}
}

function resolveSideFromUrl(url, savedData) {
  const path = url.pathname.toLowerCase();
  const sideParam = (url.searchParams.get('side') || '').toLowerCase().trim();

  // 1. Explicit query parameter (?side=groom or ?side=bride) ALWAYS takes top priority
  if (sideParam === 'groom' || sideParam === 'nha-trai' || sideParam === 'nhatrai') {
    return 'groom';
  }
  if (sideParam === 'bride' || sideParam === 'nha-gai' || sideParam === 'nhagai') {
    return 'bride';
  }

  // 2. Explicit path /nha-trai vs /nha-gai
  if (path.includes('nha-trai') || path.includes('nhatrai')) {
    return 'groom';
  }
  if (path.includes('nha-gai') || path.includes('nhagai')) {
    return 'bride';
  }

  // 3. Check custom slugs from savedData if present
  if (savedData) {
    const customGroom = (savedData.customSlugGroom || '').toLowerCase().trim();
    const customBride = (savedData.customSlugBride || '').toLowerCase().trim();
    if (customGroom && path.endsWith('/' + customGroom)) return 'groom';
    if (customBride && path.endsWith('/' + customBride)) return 'bride';
  }

  // 4. Compare index of 'quanghung' vs 'minhtue' so /i/quanghung-minhtue -> groom and /i/minhtue-quanghung -> bride
  const idxGroom = path.indexOf('quanghung');
  const idxBride = path.indexOf('minhtue');
  if (idxGroom !== -1 && idxBride !== -1) {
    return idxGroom < idxBride ? 'groom' : 'bride';
  }
  if (idxBride !== -1 || path.includes('bride')) {
    return 'bride';
  }
  return 'groom';
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.toLowerCase();

    // Handle API endpoints at the Cloudflare Worker edge if running in Worker mode
    if (path === '/api/wedding-data') {
      if (request.method === 'GET') {
        const edgeState = await loadEdgeState();
        const side = resolveSideFromUrl(url, edgeState?.data);
        if (edgeState?.data) {
          return new Response(JSON.stringify({ side, data: edgeState.data }), {
            headers: { 'Content-Type': 'application/json; charset=utf-8' }
          });
        }
      } else if (request.method === 'POST') {
        try {
          const body = await request.json();
          if (body && body.data) {
            const existing = (await loadEdgeState()) || {};
            const nextState = {
              ...existing,
              data: body.data,
              updatedAt: new Date().toISOString()
            };
            await saveEdgeState(nextState);
            return new Response(
              JSON.stringify({ ok: true, data: body.data, savedAt: nextState.updatedAt }),
              { headers: { 'Content-Type': 'application/json; charset=utf-8' } }
            );
          }
        } catch (e) {}
      }
    }

    if (path === '/api/publish-card' && request.method === 'POST') {
      try {
        const body = await request.json();
        if (body && body.data) {
          const existing = (await loadEdgeState()) || {};
          const nextVersion = (Number(body.data.publishedVersion || existing?.data?.publishedVersion || 51) || 51) + 1;
          const updatedData = {
            ...body.data,
            isPublished: true,
            publishedVersion: nextVersion
          };
          await saveEdgeState({
            ...existing,
            data: updatedData,
            updatedAt: new Date().toISOString()
          });
          const groomSlug = (updatedData.customSlugGroom || 'quanghung-minhtue').trim().replace(/^\/+|\/+$/g, '');
          const brideSlug = (updatedData.customSlugBride || 'minhtue-quanghung').trim().replace(/^\/+|\/+$/g, '');
          return new Response(
            JSON.stringify({
              ok: true,
              data: updatedData,
              publishedVersion: nextVersion,
              groomPath: `/i/${groomSlug}`,
              bridePath: `/i/${brideSlug}`
            }),
            { headers: { 'Content-Type': 'application/json; charset=utf-8' } }
          );
        }
      } catch (e) {}
    }

    const response = await env.ASSETS.fetch(request);
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      return response;
    }

    let html = await response.text();
    const edgeState = await loadEdgeState();
    const savedData = edgeState?.data || null;
    const side = resolveSideFromUrl(url, savedData);
    const isBride = side === 'bride';
    const origin = url.origin;

    const defaultGroomTitle = 'Thiệp Mời Tiệc Báo Hỷ - Quang Hưng & Minh Tuệ';
    const defaultGroomDesc =
      'Kính mời quý khách tới dự tiệc báo hỷ của Quang Hưng & Minh Tuệ vào lúc 16:00 ngày 29/11/2026 tại Số nhà 10, Đường số 4, thôn Đằng Xá, xã Hoằng Hóa, tỉnh Thanh Hóa';

    const defaultBrideTitle = 'Thiệp Mời Tiệc Báo Hỷ - Minh Tuệ & Quang Hưng';
    const defaultBrideDesc =
      'Kính mời quý khách tới dự tiệc báo hỷ của Minh Tuệ & Quang Hưng vào lúc 10:00 ngày 22/11/2026 tại Số nhà 21 Thôn 1 Làng Bát, xã Hàm Yên, tỉnh Tuyên Quang';

    const customShare = isBride ? savedData?.shareBride : savedData?.shareGroom;
    const customTitle = (customShare?.title || '').trim();
    const customDesc = (customShare?.description || '').trim();

    let title = isBride
      ? customTitle && customTitle !== 'Thiệp Mời Tiệc Hỷ - Minh Tuệ & Quang Hưng'
        ? customTitle
        : defaultBrideTitle
      : customTitle && customTitle !== 'Thiệp Mời Tiệc Hỷ - Quang Hưng & Minh Tuệ'
      ? customTitle
      : defaultGroomTitle;

    let desc = isBride
      ? customDesc && (customDesc.includes('vào lúc') || customDesc.includes('tại'))
        ? customDesc
        : defaultBrideDesc
      : customDesc && (customDesc.includes('vào lúc') || customDesc.includes('tại'))
      ? customDesc
      : defaultGroomDesc;

    // Allow query overrides if explicitly present
    const queryTitle = url.searchParams.get('t') || url.searchParams.get('title');
    const queryDesc = url.searchParams.get('d') || url.searchParams.get('desc');
    const queryImg = url.searchParams.get('img');

    if (queryTitle && queryTitle.trim()) title = queryTitle.trim();
    if (queryDesc && queryDesc.trim()) desc = queryDesc.trim();

    const rawImg =
      queryImg ||
      customShare?.coverPhotoUrl ||
      savedData?.shareCoverPhotoUrl ||
      '/api/media/media_48034d471b1e1c49.jpg';
    const absoluteImg =
      rawImg.startsWith('http://') || rawImg.startsWith('https://')
        ? rawImg
        : `${origin}${rawImg.startsWith('/') ? '' : '/'}${rawImg}`;

    function escapeAttr(str) {
      return (str || '')
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }

    const safeTitle = escapeAttr(title);
    const safeDesc = escapeAttr(desc);
    const safeImg = escapeAttr(absoluteImg);
    const safeUrl = escapeAttr(url.href);

    html = html
      .replace(/<title>.*?<\/title>/is, `<title>${safeTitle}</title>`)
      .replace(/<meta\s+name="description"\s+content=".*?"\s*\/?>/i, `<meta name="description" content="${safeDesc}" />`)
      .replace(/<meta\s+property="og:title"\s+content=".*?"\s*\/?>/i, `<meta property="og:title" content="${safeTitle}" />`)
      .replace(/<meta\s+property="og:description"\s+content=".*?"\s*\/?>/i, `<meta property="og:description" content="${safeDesc}" />`)
      .replace(/<meta\s+property="og:image"\s+content=".*?"\s*\/?>/i, `<meta property="og:image" content="${safeImg}" />`)
      .replace(/<meta\s+name="twitter:title"\s+content=".*?"\s*\/?>/i, `<meta name="twitter:title" content="${safeTitle}" />`)
      .replace(/<meta\s+name="twitter:description"\s+content=".*?"\s*\/?>/i, `<meta name="twitter:description" content="${safeDesc}" />`)
      .replace(/<meta\s+name="twitter:image"\s+content=".*?"\s*\/?>/i, `<meta name="twitter:image" content="${safeImg}" />`);

    if (!html.includes('property="og:url"')) {
      html = html.replace('</head>', `  <meta property="og:url" content="${safeUrl}" />\n  </head>`);
    }

    // Also update window.__INITIAL_WEDDING_STATE__ side (and savedData if available)
    if (savedData) {
      const safeJson = JSON.stringify({
        side,
        data: savedData
      }).replace(/</g, '\\u003c');
      const scriptTag = `<script>window.__INITIAL_WEDDING_STATE__ = ${safeJson};</script>`;
      if (html.includes('window.__INITIAL_WEDDING_STATE__')) {
        html = html.replace(/<script>window\.__INITIAL_WEDDING_STATE__\s*=.*?<\/script>/s, scriptTag);
      } else {
        html = html.replace('</head>', `  ${scriptTag}\n  </head>`);
      }
    } else if (html.includes('"side":"groom"') && isBride) {
      html = html.replace('"side":"groom"', '"side":"bride"');
    } else if (html.includes('"side":"bride"') && !isBride) {
      html = html.replace('"side":"bride"', '"side":"groom"');
    }

    const newHeaders = new Headers(response.headers);
    newHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate');

    return new Response(html, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
  }
};

