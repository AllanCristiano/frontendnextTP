// pages/api/download.ts
import type { NextApiRequest, NextApiResponse } from "next";

// Defina a URL do backend diretamente aqui (sem usar .env)
const BACKEND_URL = "http://localhost:3001";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Permite apenas requisições GET
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  const { filename } = req.query;

  // Valida o parâmetro "filename"
  if (!filename || Array.isArray(filename)) {
    return res.status(400).json({ error: "Filename inválido." });
  }

  // Constroi a URL para buscar o PDF no seu backend
  const url = `${BACKEND_URL}/documento/download/${filename}.pdf`;

  try {
    // Requisição para o backend
    const response = await fetch(url);
    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: "Erro ao buscar o PDF no backend." });
    }

    // Lê o stream como um ArrayBuffer e converte para um Buffer
    const arrayBuffer = await response.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);

    // Define os headers para download do arquivo PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}.pdf"`);
    return res.status(200).send(pdfBuffer);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Erro interno." });
  }
}
