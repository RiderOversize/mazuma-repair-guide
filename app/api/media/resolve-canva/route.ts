import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const urlParam = request.nextUrl.searchParams.get("url");
    if (!urlParam) {
      return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
    }

    const cleanUrl = urlParam.trim();
    
    // If it's already a canva.com URL
    if (cleanUrl.includes("canva.com")) {
      return NextResponse.json({ embedUrl: formatCanvaEmbedUrl(cleanUrl) });
    }

    // If it's canva.link or short URL, resolve redirect
    if (cleanUrl.includes("canva.link") || cleanUrl.includes("http")) {
      try {
        const res = await fetch(cleanUrl, {
          method: "GET",
          redirect: "manual",
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
        });

        const location = res.headers.get("location");
        if (location) {
          return NextResponse.json({ embedUrl: formatCanvaEmbedUrl(location) });
        }

        // If redirect followed or final URL
        if (res.url && res.url.includes("canva.com")) {
          return NextResponse.json({ embedUrl: formatCanvaEmbedUrl(res.url) });
        }
      } catch (e: any) {
        console.warn("Failed to resolve canva redirect:", e);
      }
    }

    return NextResponse.json({ embedUrl: formatCanvaEmbedUrl(cleanUrl) });
  } catch (error: any) {
    console.error("Canva resolve error:", error);
    return NextResponse.json({ error: error.message || "Failed to resolve Canva URL" }, { status: 500 });
  }
}

function formatCanvaEmbedUrl(url: string): string {
  try {
    // If user pasted iframe snippet, extract src
    const iframeMatch = url.match(/src=["'](.*?)["']/);
    const targetUrl = iframeMatch ? iframeMatch[1] : url.trim();

    const urlObj = new URL(targetUrl);
    if (urlObj.hostname.includes("canva.com")) {
      let pathname = urlObj.pathname;
      if (pathname.endsWith("/edit") || pathname.endsWith("/watch") || pathname.endsWith("/preview")) {
        pathname = pathname.replace(/\/(edit|watch|preview)$/, "/view");
      } else if (!pathname.endsWith("/view")) {
        pathname = `${pathname.replace(/\/+$/, "")}/view`;
      }
      urlObj.pathname = pathname;
      urlObj.search = "?embed";
      return urlObj.toString();
    }
    return targetUrl;
  } catch (e) {
    if (url.includes("canva.com")) {
      const base = url.split("?")[0].replace(/\/(edit|watch|preview)$/, "/view");
      return base.endsWith("/view") ? `${base}?embed` : `${base}/view?embed`;
    }
    return url;
  }
}
