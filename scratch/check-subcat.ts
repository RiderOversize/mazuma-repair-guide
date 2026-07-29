import Client from 'ssh2-sftp-client';
import dotenv from 'dotenv';
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
    
    console.log('Fetching MATCategory.json...');
    const catBuffer = await sftp.get('./uploads/MATCategory.json');
    const matCategories = JSON.parse(catBuffer.toString());
    
    console.log('Fetching MATUnit.json...');
    const unitBuffer = await sftp.get('./uploads/MATUnit.json');
    const matUnits = JSON.parse(unitBuffer.toString());
    
    console.log('\n--- MATCategory Sample (first 5) ---');
    console.log(matCategories.slice(0, 5));
    
    console.log('\n--- MATUnit Sample (first 5) ---');
    console.log(matUnits.slice(0, 5));
    
    // Also, search if any field in MATUnit looks like a subcategory ID (e.g. F1-01-00)
    console.log('\n--- Search for subcategory ID patterns (e.g. F1-xx-xx) in MATUnit ---');
    const matches = matUnits.filter((u: any) => JSON.stringify(u).match(/[A-Z]\d-\d{2}-\d{2}/));
    console.log(`Found ${matches.length} models with subcategory-like patterns.`);
    if (matches.length > 0) {
      console.log(matches.slice(0, 2));
    }
    
    // Search for subcategory ID patterns in MATCategory
    const catMatches = matCategories.filter((c: any) => JSON.stringify(c).match(/[A-Z]\d-\d{2}-\d{2}/));
    console.log(`\nFound ${catMatches.length} categories with subcategory-like patterns.`);
    if (catMatches.length > 0) {
      console.log(catMatches.slice(0, 2));
    }

  } catch (err) {
    console.error(err);
  } finally {
    await sftp.end();
  }
}

main();
