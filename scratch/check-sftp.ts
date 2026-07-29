import Client from 'ssh2-sftp-client';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config({ path: '.env.local' });

const sftp = new Client();

async function main() {
  try {
    await sftp.connect({
      host: process.env.SFTP_HOST,
      port: parseInt(process.env.SFTP_PORT || '22'),
      username: process.env.SFTP_USERNAME,
      password: process.env.SFTP_PASSWORD
    });
    
    console.log('Connected to SFTP');
    const buffer = await sftp.get('./uploads/MATCategory.json');
    const data = JSON.parse(buffer.toString());
    console.log('MATCategory sample:', data.slice(0, 2));

    const buffer2 = await sftp.get('./uploads/MATUnit.json');
    const data2 = JSON.parse(buffer2.toString());
    console.log('MATUnit sample:', data2.slice(0, 2));
    
  } catch (err) {
    console.error(err);
  } finally {
    await sftp.end();
  }
}

main();
