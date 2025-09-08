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

  // Mapeamento dos dados para o tipo Document
  const mappedDocuments: Document[] = data.map((doc: any) => ({
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
  }));

  // Filtragem: remover documentos específicos
  const filteredDocuments = mappedDocuments.filter((document) => {
    const isDecreto = document.type === "DECRETO" && document.number.trim() === "6.862";
    const isLeiOrdinaria = document.type === "LEI_ORDINARIA" && document.number.trim() === "5.660";

    return !(isDecreto || isLeiOrdinaria);
  });

  // --- ALTERAÇÃO: Remoção de duplicados com base no tipo E número ---
  // A chave do Map agora é uma combinação do tipo e do número do documento
  // para garantir que cada par (ex: 'LEI_COMPLEMENTAR' + '6.166') seja único.
  const uniqueDocumentsMap = new Map<string, Document>();
  filteredDocuments.forEach((doc) => {
    // Cria uma chave única, ex: "LEI_COMPLEMENTAR-6.166"
    const compositeKey = `${doc.type}-${doc.number.trim()}`;
    uniqueDocumentsMap.set(compositeKey, doc);
  });

  // Converte os valores do Map de volta para um array
  const uniqueDocuments = Array.from(uniqueDocumentsMap.values());
  // --- FIM DA ALTERAÇÃO ---

  return uniqueDocuments;
}