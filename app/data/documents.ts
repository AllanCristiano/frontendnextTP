// Importe os tipos centralizados do seu arquivo de tipos
import type { Document, DocumentType } from "../types";

export async function fetchDocuments(): Promise<Document[]> {
  
  // --- Verifica se o código está rodando no Servidor (Node.js) ou no Navegador ---
  const isServer = typeof window === 'undefined';
  
  // Se for servidor, bate direto na porta 3001 (interno, HTTP rápido e sem bloqueio).
  // Se for navegador, usa o domínio público (HTTPS).
  const baseUrl = isServer 
    ? "http://127.0.0.1:3001" 
    : "https://painelesic.aracaju.se.gov.br";

  const response = await fetch(`${baseUrl}/documento`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
  }

  const data = await response.json();

  // 1. Mapeamento e transformação dos dados (incluindo o campo aprovado)
  const mappedDocuments = data.map((doc: any) => {
    const rawNumber = doc.number || doc.numero || doc.num || "";
    const rawTitle = doc.title || doc.titulo || doc.nome || "";
    const rawType = doc.type || doc.tipo || "PORTARIA";

    const mappedDoc = {
      id: doc.id || doc._id || String(Math.random()),
      type: rawType as DocumentType,
      number: rawNumber.replace(/,/g, "").trim(),
      title: rawTitle,
      description: doc.description || doc.descricao || doc.desc || "",
      date:
        doc.date ||
        doc.data ||
        doc.created_at ||
        new Date().toISOString().split("T")[0],
      url: doc.url || doc.arquivo || doc.link || "",
      fullText: doc.fullText || doc.textoCompleto || doc.conteudo || "",
      // 🔧 Captura o status de aprovação que vem do banco
      aprovado: doc.aprovado === true 
    };

    if (mappedDoc.type === "LEI_COMPLEMENTAR" && mappedDoc.number.includes(".")) {
      mappedDoc.type = "LEI_ORDINARIA";
      mappedDoc.title = mappedDoc.title.replace(/Lei Complementar nº/i, "Lei Ordinaria nº");
    }

    if (mappedDoc.type === "LEI_ORDINARIA"){
      mappedDoc.title = mappedDoc.title.replace(/Lei nº/i, "Lei Ordinaria nº");
    }

    return mappedDoc;
  });

  // 2. 🔧 FILTRO PRINCIPAL: Apenas documentos aprovados pelo usuário e os de exceção
  const filteredDocuments = mappedDocuments.filter((document: any) => {
    // Regra A: Só passa se estiver aprovado
    if (!document.aprovado) {
      return false;
    }

    // Regra B: Remove os documentos hardcoded específicos (sua lógica original)
    const isDecreto = document.type === "DECRETO" && document.number === "6.862";
    const isLeiOrdinaria = document.type === "LEI_ORDINARIA" && document.number === "5.660";
    const isPortaria = document.type === "PORTARIA" && document.number === "2";

    return !(isDecreto || isLeiOrdinaria || isPortaria);
  });

  // 3. Remoção de duplicados com base no tipo E número
  const uniqueDocumentsMap = new Map<string, Document>();
  filteredDocuments.forEach((doc: any) => {
    const compositeKey = `${doc.type}-${doc.number}`;
    uniqueDocumentsMap.set(compositeKey, doc as Document); // Removemos o 'aprovado' ao jogar no Map se não estiver no tipo Document
  });

  const uniqueDocuments = Array.from(uniqueDocumentsMap.values());

  // 4. ORDENAÇÃO
  uniqueDocuments.sort((a, b) => {
    const dateA = new Date(a.date + 'T00:00:00Z'); 
    const yearA = dateA.getUTCFullYear();
    const monthA = dateA.getUTCMonth(); 
    const dayA = dateA.getUTCDate();
    const numA = parseInt(a.number.split('/')[0].replace(/\./g, ''), 10) || 0;

    const dateB = new Date(b.date + 'T00:00:00Z');
    const yearB = dateB.getUTCFullYear();
    const monthB = dateB.getUTCMonth();
    const dayB = dateB.getUTCDate();
    const numB = parseInt(b.number.split('/')[0].replace(/\./g, ''), 10) || 0;

    if (yearB !== yearA) return yearB - yearA;
    if (monthB !== monthA) return monthB - monthA;
    if (dayB !== dayA) return dayB - dayA;
    return numB - numA;
  });

  return uniqueDocuments;
}