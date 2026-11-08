// Builds the gift page with this gift's own preview card, so Facebook, WhatsApp and Reddit show the real item.
// The page itself is read from index.html on this site, so page tweaks only need a new index.html.
const SB = 'https://sqgfrtgjqowuvvlrhhjp.supabase.co';
const KEY = 'sb_publishable_LyIEQVIcTaxuAJ1I4THZyg_ZJqxtA-p';
const SITE = process.env.URL || 'https://garden.auridonyarns.com';
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
exports.handler = async (event) => {
  const code = String((event.queryStringParameters || {}).g || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12);
  let html;
  try { html = await (await fetch(SITE + '/index.html')).text(); } catch (e) { html = ''; }
  if (!html || html.indexOf('<html') < 0) return { statusCode: 302, headers: { Location: '/index.html' + (code ? '?g=' + code : '') }, body: '' };
  if (code.length >= 6) {
    try {
      const r = await fetch(SB + '/rest/v1/rpc/pa_gift_get', { method: 'POST', headers: { apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ p_code: code }) });
      const g = await r.json();
      if (g && g.item) {
        const title = g.name + ' is sharing ' + g.item + ' in Pottering About!';
        const img = SB + '/storage/v1/object/public/gift-img/' + code + '.jpg';
        html = html
          .replace(/(<meta property="og:title" content=")[^"]*"/, '$1' + esc(title) + '"')
          .replace(/(<meta property="og:description" content=")[^"]*"/, '$1' + esc('Tap to visit the garden and pick up a gift.') + '"')
          .replace(/(<meta property="og:image" content=")[^"]*"/, '$1' + img + '"')
          .replace(/<title>[^<]*<\/title>/, '<title>' + esc(title) + '</title>');
      }
    } catch (e) { /* fall back to the generic page */ }
  }
  return { statusCode: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=120' }, body: html };
};
