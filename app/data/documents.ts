// Definindo a interface Document com base no seu mapeamento
interface Document {
  id: string;
  type: string;
  number: string;
  title: string;
  description: string;
  date: string; // Espera-se que seja no formato "YYYY-MM-DD"
  url: string;
  fullText: string;
}

export async function fetchDocuments(): Promise<Document[]> {
  const response = await fetch("https://painelesic.aracaju.se.gov.br/documento", {
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

    const mappedDoc = {
      id: doc.id || doc._id || String(Math.random()),
      type: doc.type || doc.tipo || "PORTARIA",
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
      // console.log(`Título corrigido para o documento ID ${mappedDoc.id}: ${mappedDoc.title}`);
    }

    if (mappedDoc.type === "LEI_ORDINARIA"){
      mappedDoc.title = mappedDoc.title.replace(/Lei nº/i, "Lei Ordinaria nº");
      // console.log(`Título corrigido para o documento ID ${mappedDoc.id}: ${mappedDoc.title}`);
    }

    return mappedDoc;
  });

  // Filtragem: remover documentos específicos
  const filteredDocuments = mappedDocuments.filter((document) => {
    const isDecreto = document.type === "DECRETO" && document.number === "6.862";
    const isLeiOrdinaria = document.type === "LEI_ORDINARIA" && document.number === "5.660";

    return !(isDecreto || isLeiOrdinaria);
  });

  // Remoção de duplicados com base no tipo E número
  const uniqueDocumentsMap = new Map<string, Document>();
  filteredDocuments.forEach((doc) => {
    const compositeKey = `${doc.type}-${doc.number}`;
    uniqueDocumentsMap.set(compositeKey, doc);
  });

  const uniqueDocuments = Array.from(uniqueDocumentsMap.values());

  // --- NOVA ORDENAÇÃO: Por Ano (da data), Mês (da data) e Número (do 'number') ---
  uniqueDocuments.sort((a, b) => {
    // 1. Preparar os dados de 'a'
    // Criamos datas UTC para evitar problemas de fuso horário na extração
    const dateA = new Date(a.date + 'T00:00:00Z'); 
    const yearA = dateA.getUTCFullYear();
    const monthA = dateA.getUTCMonth(); // 0 = Janeiro, 11 = Dezembro
    // Pega apenas a parte do número antes da barra (ex: "5.660" de "5.660/2023")
    const numA = parseInt(a.number.split('/')[0].replace(/\./g, ''), 10) || 0;

    // 2. Preparar os dados de 'b'
    const dateB = new Date(b.date + 'T00:00:00Z');
    const yearB = dateB.getUTCFullYear();
    const monthB = dateB.getUTCMonth();
    const numB = parseInt(b.number.split('/')[0].replace(/\./g, ''), 10) || 0;

    // 3. Critérios de Ordenação (todos em ordem decrescente)

    // 3.1. Compara o Ano (descendente)
    if (yearB !== yearA) {
      return yearB - yearA;
    }

    // 3.2. Se os anos são iguais, compara o Mês (descendente)
    if (monthB !== monthA) {
      return monthB - monthA;
    }

    // 3.3. Se os meses são iguais, compara o Número (descendente)
    return numB - numA;
  });

  return uniqueDocuments;
}
