export async function fetchDocuments(): Promise<Document[]> {
  const response = await fetch("http://localhost:3001/documento", {
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
      console.log(`Título corrigido para o documento ID ${mappedDoc.id}: ${mappedDoc.title}`);
    }

    if (mappedDoc.type === "LEI_ORDINARIA"){
      mappedDoc.title = mappedDoc.title.replace(/Lei nº/i, "Lei Ordinaria nº");
      console.log(`Título corrigido para o documento ID ${mappedDoc.id}: ${mappedDoc.title}`);
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

  // --- NOVA ORDENAÇÃO: Por ano e depois por número (do maior para o menor) ---
  uniqueDocuments.sort((a, b) => {
    // Função auxiliar para extrair ano e número
    const parseDocumentNumber = (numberStr: string) => {
      const parts = numberStr.split('/');
      const num = parseInt(parts[0].replace(/\./g, ''), 10) || 0;
      // Se houver ano (após a barra), usa o ano. Senão, assume 0 para ordenação.
      const year = parts.length > 1 ? parseInt(parts[1], 10) || 0 : 0;
      return { year, num };
    };

    const docA = parseDocumentNumber(a.number);
    const docB = parseDocumentNumber(b.number);

    // 1. Compara o ano (ordem decrescente)
    if (docB.year !== docA.year) {
      return docB.year - docA.year;
    }

    // 2. Se os anos forem iguais, compara o número (ordem decrescente)
    return docB.num - docA.num;
  });

  return uniqueDocuments;
}
