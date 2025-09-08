export async function fetchDocuments(): Promise<Document[]> {
  const response = await fetch("http://localhost:3001/documento", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "force-cache",
  });

  if (!response.ok) {
    throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
  }

  const data = await response.json();

  // Mapeamento e transformação dos dados para o tipo Document
  const mappedDocuments: Document[] = data.map((doc: any) => {
    // 1. Mapeia os campos normalmente
    const mappedDoc = {
      id: doc.id || doc._id || String(Math.random()),
      type: doc.type || doc.tipo || "PORTARIA",
      number: doc.number || doc.numero || doc.num || "",
      title: doc.title || doc.titulo || doc.nome || "",
      description: doc.description || doc.descricao || doc.desc || "",
      date:
        doc.date ||
        doc.data ||
        doc.created_at ||
        new Date().toISOString().split("T")[0],
      url: doc.url || doc.arquivo || doc.link || "",
      fullText: doc.fullText || doc.textoCompleto || doc.conteudo || ""
    };

    // --- NOVO TRECHO: Regra de transformação de tipo ---
    // 2. Verifica se o tipo é LEI_COMPLEMENTAR e o número contém um ponto "."
    // Se a condição for verdadeira, altera o tipo para LEI_ORDINARIA.
    // (Assumindo que "Lei Complementar" é representada como "LEI_COMPLEMENTAR")
    if (mappedDoc.type === "LEI_COMPLEMENTAR" && mappedDoc.number.includes(".")) {
      mappedDoc.type = "LEI_ORDINARIA";
    }
    // --- FIM DO NOVO TRECHO ---

    return mappedDoc;
  });

  // Filtragem: remover documentos específicos
  const filteredDocuments = mappedDocuments.filter((document) => {
    const isDecreto = document.type === "DECRETO" && document.number.trim() === "6.862";
    const isLeiOrdinaria = document.type === "LEI_ORDINARIA" && document.number.trim() === "5.660";

    return !(isDecreto || isLeiOrdinaria);
  });

  // Remoção de duplicados com base no tipo E número
  const uniqueDocumentsMap = new Map<string, Document>();
  filteredDocuments.forEach((doc) => {
    const compositeKey = `${doc.type}-${doc.number.trim()}`;
    uniqueDocumentsMap.set(compositeKey, doc);
  });

  const uniqueDocuments = Array.from(uniqueDocumentsMap.values());

  return uniqueDocuments;
}