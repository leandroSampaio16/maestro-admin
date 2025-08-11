import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const target = req.nextUrl.searchParams.get("url");
  const filename = req.nextUrl.searchParams.get("filename") || "documento.pdf";

  if (!target) {
    return new NextResponse("Missing URL parameter", { status: 400 });
  }

  try {
    // Fetch the PDF from the external URL
    const response = await fetch(target, {
      cache: "no-store",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      return new NextResponse("Failed to fetch PDF", { status: 502 });
    }

    const bytes = await response.arrayBuffer();

    // Return with attachment disposition to force download
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": bytes.byteLength.toString(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("PDF download error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
