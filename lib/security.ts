import { NextRequest } from 'next/server';

export function sameOrigin(req: NextRequest) {
  if (process.env.NODE_ENV !== 'production') return true;
  const origin = req.headers.get('origin');
  if (!origin) return true;
  try {
    return origin === new URL(process.env.NEXT_PUBLIC_SITE_URL!).origin;
  } catch {
    return false;
  }
}

export function assertSameOrigin(req: NextRequest) {
  if (!sameOrigin(req)) throw new Error('Invalid request origin.');
}
