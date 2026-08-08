import { config } from 'dotenv';
config({ path: '.env.local' });
import { GET } from './app/api/sync-sftp-to-sheets/route';
import { NextResponse } from 'next/server';

// Next.js polyfills
global.Request = Request;
global.Response = Response;

async function run() {
  console.log('Starting SFTP Sync...');
  const req = new Request('http://localhost:3000/api/sync-sftp-to-sheets');
  try {
    const res = await GET(req);
    const data = await res.json();
    console.log('Sync Result:', data);
  } catch (error) {
    console.error('Error during sync:', error);
  }
}

run();
