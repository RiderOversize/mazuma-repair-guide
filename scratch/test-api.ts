import { GET } from '../app/api/sync-sftp-to-sheets/route';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testApi() {
  console.log('Testing the sync API route...');
  // Create a mock Request
  const mockReq = new Request('http://localhost:3000/api/sync-sftp-to-sheets', {
    headers: {
      'authorization': `Bearer ${process.env.CRON_SECRET}`
    }
  });

  try {
    const res = await GET(mockReq);
    if (res instanceof Response) {
      const json = await res.json().catch(() => null);
      console.log('Status:', res.status);
      console.log('Response:', json || await res.text());
    } else {
      console.log('Response:', res);
    }
  } catch (err) {
    console.error('Error calling GET:', err);
  }
}

testApi();
