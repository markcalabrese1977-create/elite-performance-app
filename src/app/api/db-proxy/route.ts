import { db } from '@/lib/db';
import { NextRequest } from 'next/server';

export const GET = async () => new Response('OK');
export const POST = async (req: NextRequest) => {
  const { sql, params } = await req.json();
  const result = await db.execute(sql, params);
  return Response.json(result);
};
