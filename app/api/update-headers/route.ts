import { NextResponse } from "next/server";
import { getSheetsClient, getSpreadsheetId, SHEETS } from "@/lib/google-sheets";

export async function GET() {
  try {
    const sheets = await getSheetsClient();
    const spreadsheetId = await getSpreadsheetId();

    // 1. Create SymptomTypes sheet if missing
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const existingTitles = meta.data.sheets?.map(s => s.properties?.title) || [];
    
    if (!existingTitles.includes(SHEETS.SYMPTOM_TYPES)) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{ addSheet: { properties: { title: SHEETS.SYMPTOM_TYPES } } }]
        }
      });
      // Add headers
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${SHEETS.SYMPTOM_TYPES}!A1:Z1`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [["id", "categoryId", "name"]] }
      });
    }

    // 2. Update Headers for Models (make sure symptomTypeId is there)
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEETS.MODELS}!A1:Z1`,
      valueInputOption: "USER_ENTERED",
      requestBody: { 
        values: [["id", "categoryId", "subcategoryId", "symptomTypeId", "name", "code", "status", "thumbnail", "createdAt", "updatedAt"]] 
      }
    });

    // 3. Update Headers for Symptoms (add specificModelIds)
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEETS.SYMPTOMS}!A1:Z1`,
      valueInputOption: "USER_ENTERED",
      requestBody: { 
        values: [["id", "symptomTypeId", "title", "description", "severity", "tags", "specificModelIds"]] 
      }
    });

    return NextResponse.json({ success: true, message: "Sheets updated successfully" });
  } catch (error: any) {
    console.error("Error updating sheets:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
