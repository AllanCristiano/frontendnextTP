import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    let filename = searchParams.get("filename");

    if (!filename) {
      return NextResponse.json({ error: 'O parâmetro "filename" é obrigatório.' }, { status: 400 });
    }

    // Extrai o caminho relativo caso venha a URL inteira
    if (filename.includes("atos-normativos/")) {
      filename = filename.split("atos-normativos/")[1];
    }

    const apiBaseUrl = "https://painelesic.aracaju.se.gov.br";
    const externalApiUrl = `${apiBaseUrl}/files/download?filename=${encodeURIComponent(filename)}`;

    const response = await fetch(externalApiUrl);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Falha ao buscar o arquivo no backend: ${response.statusText}` },
        { status: response.status }
      );
    }

    const blob = await response.blob();
    const headers = new Headers();
    headers.set("Content-Type", "application/pdf");

    const downloadFilename = filename.split("/").pop() || "documento.pdf";
    headers.set("Content-Disposition", `attachment; filename="${downloadFilename}"`);

    return new NextResponse(blob, { status: 200, headers });
  } catch (error: any) {
    console.error("Erro no proxy de download:", error);
    return NextResponse.json({ error: error.message || "Erro interno." }, { status: 500 });
  }
}