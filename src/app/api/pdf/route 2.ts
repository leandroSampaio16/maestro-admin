// app/api/pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const target = req.nextUrl.searchParams.get('url');
  if (!target) return new NextResponse('missing url', { status: 400 });

  const resp = await fetch(target, { cache: 'no-store' });
  if (!resp.ok) return new NextResponse('failed to fetch pdf', { status: 502 });

  const bytes = await resp.arrayBuffer();
  return new NextResponse(bytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="document.pdf"',
      // optional: allow other sites to embed
      'Access-Control-Allow-Origin': '*',
    },
  });
}
