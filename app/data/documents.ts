import type { Document, DocumentType } from "../types";

export async function fetchDocuments(): Promise<Document[]> {
  const baseUrl = "https://transparenciaapi.aracaju.se.gov.br";

  const response = await fetch(`${baseUrl}/documento`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    return [];
  }

  // 1. Mapeamento mantendo o fullText integral
  const mappedDocuments = data.map((doc: any, index: number) => {
    const rawNumber = String(doc.number || doc.numero || doc.num || "");
    const rawTitle = String(doc.title || doc.titulo || doc.nome || "");
    const rawType = String(doc.type || doc.tipo || "PORTARIA");

    let rawDate = doc.date || doc.data || doc.created_at;
    let formattedDate = new Date().toISOString().split("T")[0];

    if (rawDate) {
      if (typeof rawDate === "string") {
        formattedDate = rawDate.split("T")[0];
      } else if (rawDate instanceof Date && !isNaN(rawDate.getTime())) {
        formattedDate = rawDate.toISOString().split("T")[0];
      }
    }

    const mappedDoc = {
      id: String(doc.id || doc._id || `doc-${index}`),
      type: rawType as DocumentType,
      number: rawNumber.replace(/,/g, "").trim(),
      title: rawTitle,
      description: String(doc.description || doc.descricao || doc.desc || ""),
      date: formattedDate,
      url: String(doc.url || doc.arquivo || doc.link || ""),
      fullText: String(doc.fullText || doc.textoCompleto || doc.conteudo || ""),
      aprovado: doc.aprovado === true,
    };

    if (mappedDoc.type === "LEI_COMPLEMENTAR" && mappedDoc.number.includes(".")) {
      mappedDoc.type = "LEI_ORDINARIA";
      mappedDoc.title = mappedDoc.title.replace(/Lei Complementar nº/i, "Lei Ordinaria nº");
    }

    if (mappedDoc.type === "LEI_ORDINARIA") {
      mappedDoc.title = mappedDoc.title.replace(/Lei nº/i, "Lei Ordinaria nº");
    }

    return mappedDoc;
  });

  // 2. Filtro de aprovação e exceções
  const filteredDocuments = mappedDocuments.filter((document: any) => {
    if (!document.aprovado) {
      return false;
    }

    const isDecreto = document.type === "DECRETO" && document.number === "6.862";
    const isLeiOrdinaria = document.type === "LEI_ORDINARIA" && document.number === "5.660";
    const isPortaria = document.type === "PORTARIA" && document.number === "2";

    return !(isDecreto || isLeiOrdinaria || isPortaria);
  });

  // 3. Remoção de duplicados
  const uniqueDocumentsMap = new Map<string, Document>();
  filteredDocuments.forEach((doc: any) => {
    const compositeKey = `${doc.type}-${doc.number}`;
    const { aprovado, ...cleanDoc } = doc;
    uniqueDocumentsMap.set(compositeKey, cleanDoc as Document);
  });

  const uniqueDocuments = Array.from(uniqueDocumentsMap.values());

  // 4. Ordenação
  uniqueDocuments.sort((a, b) => {
    const timeA = new Date(a.date + "T00:00:00Z").getTime() || 0;
    const timeB = new Date(b.date + "T00:00:00Z").getTime() || 0;

    if (timeB !== timeA) return timeB - timeA;

    const numA = parseInt(a.number.split("/")[0].replace(/\./g, ""), 10) || 0;
    const numB = parseInt(b.number.split("/")[0].replace(/\./g, ""), 10) || 0;

    return numB - numA;
  });

  return uniqueDocuments;
}