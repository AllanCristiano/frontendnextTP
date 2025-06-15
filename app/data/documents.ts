import type { Document } from "../types"

export async function fetchDocuments(): Promise<Document[]> {
  try {
    // URL da API na porta 3001
    const response = await fetch("http://localhost:3001/documento", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Adiciona cache para melhorar performance
      cache: "no-store", // ou 'force-cache' se quiser cache
    })

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status} - ${response.statusText}`)
    }

    const data = await response.json()

    // Mapeia os dados da API para o formato esperado pelo frontend
    const mappedDocuments: Document[] = data.map((doc: any) => ({
      id: doc.id || doc._id || String(Math.random()), // Garante que sempre tenha um ID
      type: doc.type || doc.tipo || "PORTARIA", // Mapeia diferentes nomes de campo
      number: doc.number || doc.numero || doc.num || "",
      title: doc.title || doc.titulo || doc.nome || "",
      description: doc.description || doc.descricao || doc.desc || "",
      date: doc.date || doc.data || doc.created_at || new Date().toISOString().split("T")[0],
      url: doc.url || doc.arquivo || doc.link || "",
    }))

    return mappedDocuments
  } catch (error) {
    console.error("Erro ao buscar documentos da API:", error)

    // Fallback para dados mockados em caso de erro
    console.log("Usando dados mockados como fallback...")
    return getFallbackData()
  }
}

// Função de fallback com dados mockados
function getFallbackData(): Document[] {
  return [
    {
      id: "1",
      type: "PORTARIA",
      number: "001/2024",
      title: "Portaria de Nomeação de Servidores",
      description:
        "Portaria que estabelece a nomeação de novos servidores públicos para diversos cargos na administração municipal.",
      date: "2024-01-15",
      url: "/documentos/portaria-001-2024.pdf",
    },
    {
      id: "2",
      type: "LEI_ORDINARIA",
      number: "1.234/2024",
      title: "Lei do Orçamento Anual",
      description:
        "Lei que estabelece o orçamento municipal para o exercício financeiro de 2024, incluindo receitas e despesas previstas.",
      date: "2024-02-10",
      url: "/documentos/lei-1234-2024.pdf",
    },
    {
      id: "3",
      type: "DECRETO",
      number: "456/2024",
      title: "Decreto de Regulamentação do Trânsito",
      description:
        "Decreto que regulamenta o trânsito de veículos pesados no centro da cidade durante horários comerciais.",
      date: "2024-03-05",
      url: "/documentos/decreto-456-2024.pdf",
    },
    {
      id: "4",
      type: "LEI_COMPLEMENTAR",
      number: "789/2024",
      title: "Lei Complementar do Plano Diretor",
      description: "Lei complementar que estabelece diretrizes para o desenvolvimento urbano e uso do solo municipal.",
      date: "2024-03-20",
      url: "/documentos/lei-comp-789-2024.pdf",
    },
    {
      id: "5",
      type: "PORTARIA",
      number: "002/2024",
      title: "Portaria de Horário de Funcionamento",
      description:
        "Portaria que define os horários de funcionamento dos órgãos públicos municipais durante o período de verão.",
      date: "2024-04-12",
      url: "/documentos/portaria-002-2024.pdf",
    },
    {
      id: "6",
      type: "LEI_ORDINARIA",
      number: "1.567/2024",
      title: "Lei de Incentivo ao Turismo",
      description: "Lei que cria incentivos fiscais para empresas do setor turístico que se instalarem no município.",
      date: "2024-05-08",
      url: "/documentos/lei-1567-2024.pdf",
    },
    {
      id: "7",
      type: "DECRETO",
      number: "890/2024",
      title: "Decreto de Criação de Parque Municipal",
      description: "Decreto que cria o Parque Municipal da Cidade, estabelecendo suas diretrizes de uso e conservação.",
      date: "2024-06-15",
      url: "/documentos/decreto-890-2024.pdf",
    },
    {
      id: "8",
      type: "PORTARIA",
      number: "003/2024",
      title: "Portaria de Comissão de Licitação",
      description: "Portaria que nomeia os membros da comissão permanente de licitação para o biênio 2024-2025.",
      date: "2024-07-22",
      url: "/documentos/portaria-003-2024.pdf",
    },
    {
      id: "9",
      type: "LEI_COMPLEMENTAR",
      number: "234/2024",
      title: "Lei Complementar do Código Tributário",
      description: "Lei complementar que atualiza o código tributário municipal, incluindo novos tributos e isenções.",
      date: "2024-08-30",
      url: "/documentos/lei-comp-234-2024.pdf",
    },
    {
      id: "10",
      type: "DECRETO",
      number: "567/2024",
      title: "Decreto de Emergência Climática",
      description: "Decreto que declara situação de emergência climática e estabelece medidas de prevenção e resposta.",
      date: "2024-09-18",
      url: "/documentos/decreto-567-2024.pdf",
    },
    {
      id: "11",
      type: "LEI_ORDINARIA",
      number: "1.890/2024",
      title: "Lei de Proteção Animal",
      description:
        "Lei que estabelece normas para proteção e bem-estar dos animais no município, incluindo penalidades por maus-tratos.",
      date: "2024-10-25",
      url: "/documentos/lei-1890-2024.pdf",
    },
    {
      id: "12",
      type: "PORTARIA",
      number: "004/2024",
      title: "Portaria de Protocolo Sanitário",
      description: "Portaria que estabelece protocolos sanitários para estabelecimentos comerciais e eventos públicos.",
      date: "2024-11-14",
      url: "/documentos/portaria-004-2024.pdf",
    },
  ]
}
