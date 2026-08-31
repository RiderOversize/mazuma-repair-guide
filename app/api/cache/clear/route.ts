import { NextResponse } from "next/server";
import { clearCache } from "@/lib/google-sheets";

export async function POST() {
  try {
    clearCache(); // Clears 'all-sheets' tag by default
    return NextResponse.json({ success: true, message: "Cache cleared" });
  } catch (error: any) {
    console.error("Failed to clear cache", error);
    return NextResponse.json({ error: "Failed to clear cache" }, { status: 500 });
  }
}

export async function GET() {
  try {
    clearCache();
    return NextResponse.json({ success: true, message: "Cache cleared" });
  } catch (error: any) {
    console.error("Failed to clear cache", error);
    return NextResponse.json({ error: "Failed to clear cache" }, { status: 500 });
  }
}
