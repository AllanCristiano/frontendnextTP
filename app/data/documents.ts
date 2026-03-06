// Importe os tipos centralizados do seu arquivo de tipos
import type { Document, DocumentType } from "../types";

export async function fetchDocuments(): Promise<Document[]> {
  
  const isServer = typeof window === 'undefined';
  
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

  // Mapeamento e transformação dos dados
  const mappedDocuments: Document[] = data.map((doc: any) => {
    const rawNumber = doc.number || doc.numero || doc.num || "";
    const rawTitle = doc.title || doc.titulo || doc.nome || "";
    const rawType = doc.type || doc.tipo || "PORTARIA";

    const mappedDoc = {
      id: doc.id || doc._id || String(Math.random()),
      type: rawType as DocumentType,
      number: rawNumber.replace(/,/g, "").trim(),
      title: rawTitle,
      description: doc.description || doc.descricao || doc.desc || "",
      date: doc.date || doc.data || doc.created_at || new Date().toISOString().split("T")[0],
      url: doc.url || doc.arquivo || doc.link || "",
      fullText: doc.fullText || doc.textoCompleto || doc.conteudo || "",
      // Guardamos o status de aprovação vindo da API para filtrar abaixo
      aprovado: doc.aprovado === true 
    };

    // ... (suas lógicas de substituição de nomes de Leis permanecem iguais)
    if (mappedDoc.type === "LEI_COMPLEMENTAR" && mappedDoc.number.includes(".")) {
      mappedDoc.type = "LEI_ORDINARIA";
      mappedDoc.title = mappedDoc.title.replace(/Lei Complementar nº/i, "Lei Ordinaria nº");
    }
    if (mappedDoc.type === "LEI_ORDINARIA"){
      mappedDoc.title = mappedDoc.title.replace(/Lei nº/i, "Lei Ordinaria nº");
    }

    return mappedDoc;
  });

  // --- FILTRAGEM ATUALIZADA ---
  const filteredDocuments = mappedDocuments.filter((document: any) => {
    // 1. REGRA DE OURO: Só exibe se estiver aprovado
    if (!document.aprovado) return false;

    // 2. Filtros específicos de documentos que você quer esconder
    const isDecreto = document.type === "DECRETO" && document.number === "6.862";
    const isLeiOrdinaria = document.type === "LEI_ORDINARIA" && document.number === "5.660";
    const isPortaria = document.type === "PORTARIA" && document.number === "2";

    return !(isDecreto || isLeiOrdinaria || isPortaria);
  });

  // Remoção de duplicados
  const uniqueDocumentsMap = new Map<string, Document>();
  filteredDocuments.forEach((doc) => {
    const compositeKey = `${doc.type}-${doc.number}`;
    uniqueDocumentsMap.set(compositeKey, doc);
  });

  const uniqueDocuments = Array.from(uniqueDocumentsMap.values());

  // ORDENAÇÃO (Mantida a sua lógica original por data e número)
  uniqueDocuments.sort((a, b) => {
    const dateA = new Date(a.date + 'T00:00:00Z'); 
    const numA = parseInt(a.number.split('/')[0].replace(/\./g, ''), 10) || 0;
    const dateB = new Date(b.date + 'T00:00:00Z');
    const numB = parseInt(b.number.split('/')[0].replace(/\./g, ''), 10) || 0;

    if (dateB.getTime() !== dateA.getTime()) return dateB.getTime() - dateA.getTime();
    return numB - numA;
  });

  return uniqueDocuments;
}