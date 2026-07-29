import Client from 'ssh2-sftp-client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

async function main() {
  const sftp = new Client();
  try {
    console.log("Connecting to SFTP...");
    await sftp.connect({
      host: process.env.SFTP_HOST,
      port: parseInt(process.env.SFTP_PORT || '22', 10),
      username: process.env.SFTP_USERNAME,
      password: process.env.SFTP_PASSWORD
    });

    console.log("Connected! Listing files in /uploads directory...");
    
    const files = await sftp.list('/uploads');
    
    // Filter for "เครื่อง"
    const matched = files.filter(f => f.name.startsWith('เครื่อง'));
    
    console.log(`\nFound ${matched.length} items starting with 'เครื่อง':`);
    matched.forEach(f => {
      console.log(`- [${f.type === 'd' ? 'DIR ' : 'FILE'}] ${f.name} (${f.size} bytes)`);
    });
    
    // If we didn't find any, let's just list all to see what's there
    if (matched.length === 0) {
      console.log("\nAll items in root directory:");
      files.forEach(f => {
        console.log(`- [${f.type === 'd' ? 'DIR ' : 'FILE'}] ${f.name}`);
      });
    }

  } catch (err) {
    console.error("SFTP Error:", err);
  } finally {
    await sftp.end();
  }
}

main();
