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

  // Filtragem: remover documentos que sejam:
  // - DECRETO com número "6.862", ou
  // - LEI_ORDINARIA com número "5.660"
  const filteredDocuments = mappedDocuments.filter((document) => {
    const isDecreto = document.type === "DECRETO" && document.number.trim() === "6.862";
    const isLeiOrdinaria = document.type === "LEI_ORDINARIA" && document.number.trim() === "5.660";

    return !(isDecreto || isLeiOrdinaria);
  });

  return filteredDocuments;
}
