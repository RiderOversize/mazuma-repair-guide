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

    console.log("Downloading MATCategory.json...");
    const data = await sftp.get('/uploads/MATCategory.json');
    const json = JSON.parse(data.toString('utf8'));
    
    // Find all items where some property starts with 'เครื่อง'
    // First, let's see what the structure is
    if (Array.isArray(json)) {
      console.log(`Found array with ${json.length} items.`);
      
      const matched = json.filter(item => {
        // Check all string values in the object
        return Object.values(item).some(val => 
          typeof val === 'string' && val.trim().startsWith('เครื่อง')
        );
      });
      
      console.log(`Found ${matched.length} items starting with "เครื่อง":`);
      matched.forEach(m => console.log(m));
    } else {
      console.log("Not an array. Structure:", Object.keys(json));
      // Just print a bit of it
      console.log(JSON.stringify(json).substring(0, 200));
    }

  } catch (err) {
    console.error("SFTP Error:", err);
  } finally {
    await sftp.end();
  }
}

main();
