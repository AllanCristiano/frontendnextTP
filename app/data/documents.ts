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

    // Regra: se for Lei Complementar e o número tiver '.', vira Lei Ordinária
    if (mappedDoc.type === "LEI_COMPLEMENTAR" && mappedDoc.number.includes(".")) {
      mappedDoc.type = "LEI_ORDINARIA";
      mappedDoc.title = mappedDoc.title.replace("Lei Complementar nº", "Lei nº");
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

  // --- NOVO TRECHO: Ordenação do maior para o menor ---
  // O método .sort() ordena o array.
  // Para comparar os números corretamente, removemos os pontos e os convertemos para inteiros.
  // A lógica 'numB - numA' resulta em uma ordenação decrescente (maior para o menor).
  uniqueDocuments.sort((a, b) => {
    const numA = parseInt(a.number.replace(/\./g, ''), 10);
    const numB = parseInt(b.number.replace(/\./g, ''), 10);
    return numB - numA;
  });
  // --- FIM DO NOVO TRECHO ---

  return uniqueDocuments;
}