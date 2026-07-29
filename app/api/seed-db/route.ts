import { NextResponse } from "next/server";
import { getSheetsClient, getSpreadsheetId, SHEETS } from "@/lib/google-sheets";
import { categories, subCategories, symptomTypes, symptoms, models, guides } from "@/lib/mock-data";

export async function GET() {
  try {
    const sheets = await getSheetsClient();
    const spreadsheetId = await getSpreadsheetId();

    async function seedSheet(sheetName: string, headers: string[], data: any[][]) {
      // Clear existing data (leaving row 1 for safety but we will overwrite it anyway)
      await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: `${sheetName}!A1:Z`,
      });

      // Write headers and data
      const values = [headers, ...data];
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values },
      });
    }

    // Categories
    const catHeaders = ["id", "name", "slug", "description", "status", "createdAt"];
    const catData = categories.map(c => [c.id, c.name, c.slug, c.description, c.status, c.createdAt]);
    await seedSheet(SHEETS.CATEGORIES, catHeaders, catData);

    // SubCategories
    const subcatHeaders = ["id", "categoryId", "name"];
    const subcatData = subCategories.map(c => [c.id, c.categoryId, c.name]);
    await seedSheet(SHEETS.SUBCATEGORIES, subcatHeaders, subcatData);

    // SymptomTypes
    const stHeaders = ["id", "name"];
    const stData = symptomTypes.map(c => [c.id, c.name]);
    await seedSheet(SHEETS.SYMPTOM_TYPES, stHeaders, stData);

    // Symptoms
    const symHeaders = ["id", "symptomTypeId", "title", "description", "severity", "tags"];
    const symData = symptoms.map(c => [c.id, c.symptomTypeId, c.title, c.description, c.severity, c.tags?.join(",")]);
    await seedSheet(SHEETS.SYMPTOMS, symHeaders, symData);

    // Models
    const modHeaders = ["id", "categoryId", "subcategoryId", "symptomTypeId", "name", "code", "status", "thumbnail", "createdAt"];
    const modData = models.map(c => [c.id, c.categoryId, c.subcategoryId, c.symptomTypeId, c.name, c.code, c.status, c.thumbnail, c.createdAt]);
    await seedSheet(SHEETS.MODELS, modHeaders, modData);

    // Guides & GuideSteps
    const guideHeaders = ["id", "title", "categoryId", "subcategoryId", "modelIds", "symptomTypeId", "symptomId", "description", "difficulty", "timeEstimated", "status", "tags", "toolsRequired", "partsRequired", "createdAt", "updatedAt"];
    const guideData = guides.map(g => [g.id, g.title, g.categoryId, g.subcategoryId, (g.modelIds||[]).join(","), g.symptomTypeId, g.symptomId, g.description, g.difficulty, g.timeEstimated, g.status, (g.tags||[]).join(","), (g.toolsRequired||[]).join(","), (g.partsRequired||[]).join(","), g.createdAt, g.updatedAt]);
    await seedSheet(SHEETS.GUIDES, guideHeaders, guideData);

    const stepHeaders = ["id", "guideId", "stepNum", "title", "instruction", "mediaUrl", "pdfUrl", "warning"];
    const stepData: any[] = [];
    guides.forEach(g => {
      g.steps?.forEach((s, idx) => {
        stepData.push([`${g.id}-s${s.stepNum}`, g.id, s.stepNum, s.title, s.instruction, s.mediaUrl, s.pdfUrl, s.warning]);
      });
    });
    await seedSheet(SHEETS.GUIDE_STEPS, stepHeaders, stepData);

    return NextResponse.json({ success: true, message: "Database seeded successfully!" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
