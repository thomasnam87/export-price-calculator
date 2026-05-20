import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { code } = await req.json();
  const validCode = process.env.ACCESS_CODE;

  if (!validCode || code !== validCode) {
    return NextResponse.json({ error: 'Mã không đúng' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set('epc_access', validCode, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
    sameSite: 'lax',
  });
  return res;
}
