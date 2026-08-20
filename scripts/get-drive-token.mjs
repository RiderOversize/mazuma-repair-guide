import { google } from 'googleapis';
import readline from 'readline';
import fs from 'fs';
import path from 'path';

// Read from .env.local
const envPath = path.resolve('.env.local');
let envContent = '';
try {
    envContent = fs.readFileSync(envPath, 'utf-8');
} catch (e) {
    console.error('Could not read .env.local file. Please run this script from the project root.');
    process.exit(1);
}

const getEnv = (key) => {
  const match = envContent.match(new RegExp(`${key}="(.*?)"`)) || envContent.match(new RegExp(`${key}=([^\\s]+)`));
  return match ? match[1] : null;
};

const clientId = getEnv('GOOGLE_CLIENT_ID');
const clientSecret = getEnv('GOOGLE_CLIENT_SECRET');

if (!clientId || !clientSecret) {
  console.error("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in .env.local");
  process.exit(1);
}

// Redirect URI must match the Authorized redirect URIs in Google Cloud Console
const REDIRECT_URI = 'http://localhost:3000/api/auth/callback/google'; 
const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI);

const SCOPES = [
  'https://www.googleapis.com/auth/drive'
];

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent' // Forces Google to issue a refresh token
});

console.log('====================================================');
console.log('1. เปิดลิงก์นี้ในเบราว์เซอร์:');
console.log('\n', authUrl, '\n');
console.log('2. ล็อกอินด้วยบัญชี Google ที่คุณต้องการใช้งาน (บัญชี 5TB)');
console.log('3. เมื่อกดยอมรับสิทธิ์ เบราว์เซอร์จะพาไปที่เว็บ localhost (แม้เว็บจะ Error ไม่เป็นไร)');
console.log('4. ให้ก๊อปปี้ "URL ทั้งหมด" จากช่อง Address Bar มาวางด้านล่างนี้');
console.log('====================================================\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('วาง URL ที่ก๊อปปี้มาตรงนี้: ', async (inputUrl) => {
  let code = inputUrl.trim();
  
  if (!code) {
      console.log('ไม่ได้ใส่ข้อมูล ยกเลิกการทำงาน');
      process.exit(1);
  }
  
  // Extract code from URL if user pasted the full URL
  try {
      if (code.startsWith('http')) {
          const urlObj = new URL(code);
          const extractedCode = urlObj.searchParams.get('code');
          if (extractedCode) {
              code = extractedCode;
          } else {
              console.log('ไม่พบพารามิเตอร์ code ใน URL');
              process.exit(1);
          }
      }
  } catch (e) {
      console.log('รูปแบบ URL ไม่ถูกต้อง');
      process.exit(1);
  }

  try {
      console.log('\nกำลังขอ Refresh Token...');
      const { tokens } = await oAuth2Client.getToken(code);
      
      if (tokens.refresh_token) {
          console.log('\n✅ สำเร็จ! ได้ Refresh Token แล้ว\n');
          console.log('ให้นำโค้ดด้านล่างนี้ไปต่อท้ายไฟล์ .env.local ของคุณ:\n');
          console.log(`GOOGLE_REFRESH_TOKEN="${tokens.refresh_token}"`);
          console.log('\n----------------------------------------------------\n');
      } else {
          console.log('\n❌ ไม่ได้ Refresh Token กลับมา');
          console.log('สาเหตุอาจจะเกิดจากคุณไม่ได้กดหน้า Consent ใหม่ ให้ลองรันสคริปต์นี้อีกครั้ง');
      }
  } catch (error) {
      console.error('\n❌ เกิดข้อผิดพลาดในการดึง Token:', error.message);
  } finally {
      rl.close();
  }
});
