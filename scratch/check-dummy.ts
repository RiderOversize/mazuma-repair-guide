import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.local first, then .env
const envLocal = path.resolve(process.cwd(), '.env.local');
const envRegular = path.resolve(process.cwd(), '.env');

if (fs.existsSync(envLocal)) {
  dotenv.config({ path: envLocal });
} else if (fs.existsSync(envRegular)) {
  dotenv.config({ path: envRegular });
} else {
  dotenv.config();
}

import { getModels, getSymptoms, getGuides, getCategories, getSymptomTypes } from "../lib/sheets-db";

async function main() {
  try {
    const cats = await getCategories();
    const symTypes = await getSymptomTypes();
    const syms = await getSymptoms();
    const models = await getModels();
    const guides = await getGuides();
    
    console.log("Categories:", cats.length);
    console.log("SymptomTypes:", symTypes.length);
    console.log("Symptoms:", syms.length);
    console.log("Models:", models.length);
    console.log("Guides:", guides.length);

    // Look for Dummy Guide
    const dummyGuides = guides.filter(g => g.id.startsWith("guide-dummy"));
    console.log("\nDummy Guides found:", dummyGuides.length);
    for (const dg of dummyGuides) {
      console.log(`- ID: ${dg.id}, Cat: ${dg.categoryId}, Sym: ${dg.symptomId}, Status: ${dg.status}`);
    }

    if (dummyGuides.length > 0) {
      const dg = dummyGuides[0];
      console.log(`\nAnalyzing why Dummy Guide ${dg.id} is not showing...`);
      
      const cat = cats.find(c => c.id === dg.categoryId);
      console.log(`1. Category exists? ${!!cat} (${cat?.name})`);
      
      const sym = syms.find(s => s.id === dg.symptomId);
      console.log(`2. Symptom exists? ${!!sym} (${sym?.description}) -> Type: ${sym?.symptomTypeId}`);
      
      const model = models.find(m => m.categoryId === dg.categoryId && m.symptomTypeId === sym?.symptomTypeId);
      console.log(`3. Model exists with Cat ${dg.categoryId} and SymType ${sym?.symptomTypeId}? ${!!model}`);
      if (model) {
        console.log(`   Model example: ${model.name} (${model.code}) -> Type: ${model.symptomTypeId}`);
      } else {
        console.log("   *** NO MODEL HAS THIS SYMPTOM TYPE FOR THIS CATEGORY! ***");
        console.log(`   Models in ${dg.categoryId} have types:`, [...new Set(models.filter(m => m.categoryId === dg.categoryId).map(m => m.symptomTypeId))]);
      }
    }
  } catch(e) {
    console.error(e);
  }
}

main();
