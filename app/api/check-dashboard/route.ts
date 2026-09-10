import { NextResponse } from "next/server";
import { getMasterDataMappings } from "../../../lib/sheets-db";
import { isAllowedCategory } from "../../../lib/category-theme";
import type { MasterDataMapping } from "../../../lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const mappings = await getMasterDataMappings();
    const categoryModelMap = new Map<string, Set<string>>();

    mappings.forEach((m: MasterDataMapping) => {
      const catName = (m.matCategoryName || "").trim();
      const modelCode = (m.modelCode || "").trim();
      if (!catName || !modelCode) return;
      if (!isAllowedCategory(catName)) return;

      if (!categoryModelMap.has(catName)) {
        categoryModelMap.set(catName, new Set<string>());
      }
      categoryModelMap.get(catName)!.add(modelCode);
    });

    const result = Array.from(categoryModelMap.entries())
      .map(([name, modelSet]) => ({
        name,
        modelCount: modelSet.size,
      }))
      .sort((a, b) => b.modelCount - a.modelCount);

    return NextResponse.json({
      totalMappingsRows: mappings.length,
      categories: result,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
