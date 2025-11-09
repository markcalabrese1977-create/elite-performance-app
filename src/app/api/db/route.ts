// src/app/api/db/route.ts
import { db } from '../lib/db';
import { NextRequest } from 'next/server';

export async function GET() {
  return Response.json({ status: 'connected' });
}