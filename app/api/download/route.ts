// Em: src/app/api/download/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 1. Pega o parâmetro 'filename' da URL (ex: /api/download?filename=LEI_ORDINARIA/123.pdf)
    const searchParams = request.nextUrl.searchParams;
    const filename = searchParams.get('filename');

    // Validação: se o nome do arquivo não for fornecido, retorna um erro.
    if (!filename) {
      return NextResponse.json({ error: 'O parâmetro "filename" é obrigatório.' }, { status: 400 });
    }

    // 2. Monta a URL completa da API externa de onde o arquivo será baixado.
    const externalApiUrl = `https://transparenciaapi.aracaju.se.gov.br/files/download?filename=${encodeURIComponent(filename)}`;

    // 3. Faz a requisição do seu servidor para a API externa.
    // Isso não tem restrição de CORS, pois é uma comunicação servidor-servidor.
    const response = await fetch(externalApiUrl);

    // 4. Se a API externa retornar um erro (ex: arquivo não encontrado), repassa o erro.
    if (!response.ok) {
      return NextResponse.json(
        { error: `Falha ao buscar o arquivo do servidor externo: ${response.statusText}` },
        { status: response.status }
      );
    }

    // 5. Pega o conteúdo do arquivo como um Blob (objeto binário).
    const blob = await response.blob();

    // 6. Prepara os cabeçalhos da resposta para o navegador.
    const headers = new Headers();
    // Define o tipo de conteúdo (essencial para o navegador entender o que é).
    headers.set('Content-Type', 'application/pdf');
    // Força o navegador a tratar a resposta como um download com um nome de arquivo específico.
    const downloadFilename = filename.split('/').pop() || 'documento.pdf';
    headers.set('Content-Disposition', `attachment; filename="${downloadFilename}"`);

    // 7. Retorna a resposta para o frontend com o conteúdo do arquivo (blob) e os cabeçalhos corretos.
    return new NextResponse(blob, { status: 200, headers });

  } catch (error) {
    // Em caso de erro inesperado no processo, loga e retorna um erro 500.
    console.error('Erro no proxy de download:', error);
    return NextResponse.json({ error: 'Ocorreu um erro interno no servidor.' }, { status: 500 });
  }
}