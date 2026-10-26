import { app } from '../server/app.js';

export default function handler(req, res) {
  const originalUrl = req.url || '/';

  if (
    !originalUrl.startsWith('/api/') &&
    originalUrl !== '/api' &&
    !originalUrl.startsWith('/api?')
  ) {
    req.url = `/api${originalUrl.startsWith('/') ? originalUrl : `/${originalUrl}`}`;
  }

  return app(req, res);
}