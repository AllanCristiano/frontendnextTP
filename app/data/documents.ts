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
    // Pega o número original da API
    const rawNumber = doc.number || doc.numero || doc.num || "";

    const mappedDoc = {
      id: doc.id || doc._id || String(Math.random()),
      type: doc.type || doc.tipo || "PORTARIA",
      // --- ALTERAÇÃO PRINCIPAL AQUI ---
      // O número já é limpo (remove vírgulas e espaços) no momento da criação.
      // Isso garante que o campo 'number' do objeto esteja sempre limpo.
      number: rawNumber.replace(/,/g, "").trim(),
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

    // Regra: se for Lei Complementar e o número tiver '.', vira Lei Ordinária
    if (mappedDoc.type === "LEI_COMPLEMENTAR" && mappedDoc.number.includes(".")) {
      mappedDoc.type = "LEI_ORDINARIA";
    }

    return mappedDoc;
  });

  // Filtragem: remover documentos específicos
  const filteredDocuments = mappedDocuments.filter((document) => {
    // A comparação agora usa o número já limpo
    const isDecreto = document.type === "DECRETO" && document.number === "6.862";
    const isLeiOrdinaria = document.type === "LEI_ORDINARIA" && document.number === "5.660";

    return !(isDecreto || isLeiOrdinaria);
  });

  // Remoção de duplicados com base no tipo E número
  const uniqueDocumentsMap = new Map<string, Document>();
  filteredDocuments.forEach((doc) => {
    // Agora que 'doc.number' já está limpo, não precisamos de uma variável extra
    const compositeKey = `${doc.type}-${doc.number}`;
    uniqueDocumentsMap.set(compositeKey, doc);
  });

  const uniqueDocuments = Array.from(uniqueDocumentsMap.values());

  return uniqueDocuments;
}