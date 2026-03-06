// Importe os tipos centralizados do seu arquivo de tipos
import type { Document, DocumentType } from "../types";

export async function fetchDocuments(): Promise<Document[]> {
  
  // --- CORREÇÃO AQUI ---
  // Verifica se o código está rodando no Servidor (Node.js) ou no Navegador
  const isServer = typeof window === 'undefined';
  
  // Se for servidor, bate direto na porta 3001 (interno, HTTP rápido e sem bloqueio).
  // Se for navegador, usa o domínio público (HTTPS).
  const baseUrl = isServer 
    ? "http://127.0.0.1:3001" 
    : "https://painelesic.aracaju.se.gov.br";

  // console.log(`[fetchDocuments] Buscando em: ${baseUrl}/documento`); // Descomente para debug se precisar

  const response = await fetch(`${baseUrl}/documento`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  // ---------------------

  if (!response.ok) {
    throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
  }

  const data = await response.json();

  // Mapeamento e transformação dos dados
  const mappedDocuments: Document[] = data.map((doc: any) => {
    const rawNumber = doc.number || doc.numero || doc.num || "";
    const rawTitle = doc.title || doc.titulo || doc.nome || "";
    
    // Pegamos o tipo bruto da API
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
      fullText: doc.fullText || doc.textoCompleto || doc.conteudo || ""
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

  // Filtragem: remover documentos específicos
  const filteredDocuments = mappedDocuments.filter((document) => {
    const isDecreto = document.type === "DECRETO" && document.number === "6.862";
    const isLeiOrdinaria = document.type === "LEI_ORDINARIA" && document.number === "5.660";
    const isPortaria = document.type === "PORTARIA" && document.number === "2";

    return !(isDecreto || isLeiOrdinaria || isPortaria);
  });

  // Remoção de duplicados com base no tipo E número
  const uniqueDocumentsMap = new Map<string, Document>();
  filteredDocuments.forEach((doc) => {
    const compositeKey = `${doc.type}-${doc.number}`;
    uniqueDocumentsMap.set(compositeKey, doc);
  });

  const uniqueDocuments = Array.from(uniqueDocumentsMap.values());

  // ORDENAÇÃO
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