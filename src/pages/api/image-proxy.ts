import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Image proxy API route with extended timeout
 * This proxies images from S3 with a longer timeout to avoid upstream timeout errors
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { url, w, q } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  // Validate that the URL is from allowed domains
  const allowedDomains = [
    'odinwo-static.s3.amazonaws.com',
    's3.amazonaws.com',
    'images-na.ssl-images-amazon.com',
  ];

  const urlObj = new URL(url);
  const isAllowed = allowedDomains.some(domain => urlObj.hostname.includes(domain));

  if (!isAllowed) {
    return res.status(403).json({ error: 'Domain not allowed' });
  }

  try {
    // Fetch the image with a longer timeout (30 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch image' });
    }

    // Get the image buffer
    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Set appropriate headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Content-Length', buffer.byteLength);

    // Send the image
    return res.send(Buffer.from(buffer));
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return res.status(504).json({ error: 'Request timeout' });
    }
    console.error('Image proxy error:', error);
    return res.status(500).json({ error: 'Failed to proxy image' });
  }
}










