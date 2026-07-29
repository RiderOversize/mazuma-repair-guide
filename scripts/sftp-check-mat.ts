import Client from 'ssh2-sftp-client';
import * as dotenv from 'dotenv';

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

    console.log("Downloading MATUnit.json...");
    const data = await sftp.get('/uploads/MATUnit.json');
    const json = JSON.parse(data.toString('utf8'));
    
    if (Array.isArray(json)) {
      console.log(`Found array with ${json.length} items in MATUnit.json`);
      console.log("First 2 items:", JSON.stringify(json.slice(0, 2), null, 2));
      
      const matched = json.filter(item => {
        return Object.values(item).some(val => 
          typeof val === 'string' && val.trim().startsWith('เครื่อง')
        );
      });
      console.log(`Found ${matched.length} items starting with "เครื่อง"`);
      if (matched.length > 0) {
        console.log("First matched item:", JSON.stringify(matched[0], null, 2));
      }
    } else {
      console.log("Not an array. Structure:", Object.keys(json));
    }

  } catch (err) {
    console.error("SFTP Error:", err);
  } finally {
    await sftp.end();
  }
}

main();
