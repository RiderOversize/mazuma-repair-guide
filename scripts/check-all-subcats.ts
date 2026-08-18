import { google } from "googleapis";
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

async function main() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n");
  const auth = new google.auth.GoogleAuth({
    credentials: { client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL, private_key: privateKey },
    scopes: SCOPES,
  });
  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;

  const [pg, pc, m] = await Promise.all([
    sheets.spreadsheets.values.get({ spreadsheetId, range: 'ProductGroup!A1:Z' }),
    sheets.spreadsheets.values.get({ spreadsheetId, range: 'ProductCategory!A1:Z' }),
    sheets.spreadsheets.values.get({ spreadsheetId, range: 'Models!A1:E3000' }),
  ]);

  const groups = pg.data.values?.slice(1) || [];
  const subcats = pc.data.values?.slice(1) || [];
  const models = m.data.values?.slice(1) || [];

  console.log("=== ALL CATEGORIES & SUBCATEGORIES BREAKDOWN ===");
  
  for (const g of groups) {
    const gId = g[0]?.trim();
    const gIndex = g[1]?.trim();
    const gName = g[2]?.trim();

    const gSubs = subcats.filter(sc => sc[1]?.trim() === gIndex);
    const gModels = models.filter(m => (m[1]?.trim() === gIndex) || (m[1]?.trim() === gId));

    console.log(`\n========================================`);
    console.log(`📂 [${gIndex}] ${gName} (ID: ${gId}) | Total in Group: ${gModels.length} models`);
    console.log(`========================================`);

    let totalSubCount = 0;
    for (const sc of gSubs) {
      const scId = sc[0]?.trim();
      const scIndex = sc[1]?.trim();
      const scMat = sc[2]?.trim();
      const scName = sc[3]?.trim();

      const scModels = gModels.filter(m => {
        const sub = m[2]?.trim();
        return sub === scId || sub === scMat || sub === scName;
      });

      totalSubCount += scModels.length;
      console.log(`  🔹 SubCat [ID: ${scId}] ${scMat} - ${scName} : ${scModels.length} models`);
    }

    // Check models in this category that didn't match any subcategory
    const unmatched = gModels.filter(m => {
      const sub = m[2]?.trim();
      return !gSubs.some(sc => sub === sc[0]?.trim() || sub === sc[2]?.trim() || sub === sc[3]?.trim());
    });

    if (unmatched.length > 0) {
      console.log(`  ⚠️ UNMATCHED in [${gIndex}] (${unmatched.length} models):`);
      const distinctVals = [...new Set(unmatched.map(m => m[2]))];
      console.log(`     Distinct subcategoryId values:`, distinctVals);
      console.log(`     Sample models:`);
      unmatched.slice(0, 5).forEach(m => console.log(`       - Code: ${m[4]} | Name: ${m[3]} | subCat: "${m[2]}"`));
    }
  }

  // Also check if any model has categoryId not in ProductGroup
  const allGroupIndexes = new Set(groups.map(g => g[1]?.trim()));
  const allGroupIds = new Set(groups.map(g => g[0]?.trim()));
  const orphanModels = models.filter(m => {
    const cat = m[1]?.trim();
    return !allGroupIndexes.has(cat) && !allGroupIds.has(cat);
  });
  if (orphanModels.length > 0) {
    console.log(`\n⚠️ ORPHAN MODELS (categoryId not in ProductGroup) (${orphanModels.length} models):`);
    orphanModels.slice(0, 10).forEach(m => console.log(`  - Code: ${m[4]} | Name: ${m[3]} | Cat: "${m[1]}" | SubCat: "${m[2]}"`));
  }
}

main().catch(console.error);
