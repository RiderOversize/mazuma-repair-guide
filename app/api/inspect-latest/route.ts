import { NextResponse } from "next/server";
import { getMasterDataMappings } from "../../../lib/sheets-db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const mappings = await getMasterDataMappings();
    const latest = mappings.slice(-5);
    return NextResponse.json({
      total: mappings.length,
      latest,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
