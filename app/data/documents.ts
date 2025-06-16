export async function fetchDocuments(): Promise<Document[]> {
  const response = await fetch("http://localhost:3001/documento", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "force-cache", // ou remova se não for necessário
  });

  if (!response.ok) {
    throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
  }

  const data = await response.json();
  
  // Mapeamento dos dados
  const mappedDocuments: Document[] = data.map((doc: any) => ({
    id: doc.id || doc._id || String(Math.random()),
    type: doc.type || doc.tipo || "PORTARIA",
    number: doc.number || doc.numero || doc.num || "",
    title: doc.title || doc.titulo || doc.nome || "",
    description: doc.description || doc.descricao || doc.desc || "",
    date: doc.date || doc.data || doc.created_at || new Date().toISOString().split("T")[0],
    url: doc.url || doc.arquivo || doc.link || "",
  }));

  return mappedDocuments;
}
