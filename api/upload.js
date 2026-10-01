/**
 * Vercel serverless upload proxy.
 * Browser → this API → Catbox / ImgBB (avoids CORS + ImgBB outages).
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { image, filename, contentType } = body;

    if (!image || typeof image !== 'string') {
      return res.status(400).json({ error: 'Missing image data' });
    }

    const base64 = image.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(base64, 'base64');
    if (!buffer.length) {
      return res.status(400).json({ error: 'Invalid image data' });
    }
    if (buffer.length > 4.2 * 1024 * 1024) {
      return res.status(413).json({ error: 'Image too large (max ~4MB)' });
    }

    const name = (typeof filename === 'string' && filename) || 'photo.jpg';
    const type = (typeof contentType === 'string' && contentType) || 'image/jpeg';
    const errors = [];

    // 1) Catbox
    try {
      const form = new FormData();
      form.append('reqtype', 'fileupload');
      form.append('fileToUpload', new Blob([buffer], { type }), name);
      const catboxRes = await fetch('https://catbox.moe/user/api.php', {
        method: 'POST',
        body: form,
      });
      const text = (await catboxRes.text()).trim();
      if (catboxRes.ok && /^https?:\/\//i.test(text)) {
        return res.status(200).json({ success: true, url: text, displayUrl: text, provider: 'catbox' });
      }
      errors.push(`Catbox: ${text || catboxRes.status}`);
    } catch (e) {
      errors.push(`Catbox: ${e instanceof Error ? e.message : String(e)}`);
    }

    // 2) ImgBB (may be in maintenance)
    try {
      const form = new FormData();
      form.append('key', 'c98e57ad2f31f407f08acbe5a87429b6');
      form.append('image', base64);
      form.append('name', name.replace(/\.[^.]+$/, '') || 'upload');
      const imgbbRes = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: form,
      });
      const json = await imgbbRes.json();
      if (imgbbRes.ok && json?.success && json?.data?.url) {
        const url = json.data.display_url || json.data.url;
        return res.status(200).json({
          success: true,
          url: json.data.url,
          displayUrl: url,
          provider: 'imgbb',
        });
      }
      errors.push(`ImgBB: ${json?.error?.message || imgbbRes.status}`);
    } catch (e) {
      errors.push(`ImgBB: ${e instanceof Error ? e.message : String(e)}`);
    }

    return res.status(502).json({ error: 'All upload hosts failed', details: errors });
  } catch (e) {
    return res.status(500).json({
      error: e instanceof Error ? e.message : 'Upload failed',
    });
  }
}
