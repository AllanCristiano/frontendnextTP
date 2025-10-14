"use client"

import { useState } from "react"
import type { Document, DocumentType, DateRange } from "../types"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { FileText, Download, FileBarChart2, Filter, Files } from "lucide-react"
import { DocumentFilters } from "./document-filters"
import { Pagination } from "./pagination"
import { Button } from "@/components/ui/button"

const datesByTab = {
  ALL: "2025-09-11",
  PORTARIA: "2025-09-11",
  LEI_ORDINARIA: "2025-09-11",
  LEI_COMPLEMENTAR: "2025-06-18",
  DECRETO: "2025-09-11",
};

interface DocumentListProps {
  documents: Document[]
}

export function DocumentList({ documents }: DocumentListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState<DocumentType | "ALL">("ALL")
  const itemsPerPage = 5

  const filteredDocuments = documents.filter((doc) => {
    const cleanTitle = doc.title.replace("/", "").replace(".", "")
    const cleanDescription = doc.description.replace("/", "").replace(".", "")
    const cleanNumber = doc.number.replace("/", "").replace(".", "")
    const docFullText = doc.fullText.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    const matchesSearch =
      cleanTitle.toLowerCase().includes(searchTerm.toLowerCase().replace("/", "").replace(".", "")) ||
      cleanDescription.toLowerCase().includes(searchTerm.toLowerCase().replace("/", "").replace(".", "")) ||
      cleanNumber.toLowerCase().includes(searchTerm.toLowerCase().replace("/", "").replace(".", "")) ||
      docFullText.toLowerCase().includes(" " + searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))

    const matchesTab = activeTab === "ALL" || doc.type === activeTab

    const docDate = new Date(doc.date)
    const matchesDateRange =
      (!dateRange.from || docDate >= dateRange.from) && (!dateRange.to || docDate <= dateRange.to)

    return matchesSearch && matchesTab && matchesDateRange
  })

  
  const documentStats = {
    total: documents.length,
    filtered: filteredDocuments.length,
    byType: {
      ORDINANCE: documents.filter((doc) => doc.type === "PORTARIA").length,
      ORDINARY_LAW: documents.filter((doc) => doc.type === "LEI_ORDINARIA").length,
      COMPLEMENTARY_LAW: documents.filter((doc) => doc.type === "LEI_COMPLEMENTAR").length,
      DECREE: documents.filter((doc) => doc.type === "DECRETO").length,
    },
  }

  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage)
  const paginatedDocuments = filteredDocuments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleFilterChange = (type: DocumentType | "ALL", newDateRange: DateRange) => {
    setDateRange(newDateRange)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleTabChange = (value: DocumentType | "ALL") => {
    setActiveTab(value)
    setCurrentPage(1)
  }

  // MODIFICADO: Função para baixar o PDF usando a Rota de API como proxy
  const handleDownload = async (doc: Document, filename: string) => {
    // Caso 1: O documento não tem uma URL externa, baixa de um caminho local.
    if (doc.url === "") {
      const url = `/documentos/${filename}.pdf`;
      const link = document.createElement("a");
      link.href = url;
      link.download = `${filename}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } 
    // Caso 2: O documento tem uma URL externa, usa nosso backend como proxy.
    else {
      try {
        // 1. Constrói o nome completo do arquivo esperado pela API externa.
        const externalApiFilename = `${doc.type}/${filename}.pdf`;
        
        // 2. Constrói a URL da NOSSA API de proxy, passando o nome do arquivo.
        const proxyUrl = `/api/download?filename=${encodeURIComponent(externalApiFilename)}`;
  
        // 3. Faz a requisição GET para a NOSSA API.
        const response = await fetch(proxyUrl);
  
        if (!response.ok) {
          throw new Error(`Falha no download: ${response.statusText}`);
        }
  
        // 4. O resto do código funciona igual, pois nossa API retorna o blob do arquivo.
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = `${filename}.pdf`; // Nome do arquivo que o usuário verá.
        document.body.appendChild(link);
        link.click();
        
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
  
      } catch (error) {
        console.error("Erro ao baixar o arquivo:", error);
        alert("Não foi possível baixar o arquivo. Tente novamente mais tarde.");
      }
    }
  };

  function formatarDataPorExtenso(dataStr: string): string {
    if (!dataStr) return ""
    const parts = dataStr.split("-")
    if (parts.length !== 3) return ""
    const [ano, mes, dia] = parts.map(Number)
    const data = new Date(ano, mes - 1, dia)
    if (isNaN(data.getTime())) return ""

    const opcoes: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }

    return new Intl.DateTimeFormat("pt-BR", opcoes)
      .format(data)
      .toLowerCase()
  }
  
  function toTitleCase(str: string): string {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase())
  }

  const tabs = [
    { id: "ALL", label: "Todos" },
    { id: "PORTARIA", label: "Portarias" },
    { id: "LEI_ORDINARIA", label: "Leis Ordinárias" },
    { id: "LEI_COMPLEMENTAR", label: "Leis Complementares" },
    { id: "DECRETO", label: "Decretos" },
  ]
 
  return (
    // ... todo o seu JSX continua aqui, sem alterações.
    // O código abaixo é apenas uma representação do seu JSX original.
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
            {/* ... Seus cards de estatísticas ... */}
            <DocumentFilters
              onFilterChange={handleFilterChange}
              onSearchChange={setSearchTerm}
              searchTerm={searchTerm}
              hideTypeFilter={true}
            />
            {/* ... Suas abas e o resto da interface ... */}
            <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-gray-800">
                <div className="pb-4 text-gray-600 text-sm">Atualizado em {formatarDataPorExtenso(datesByTab[activeTab]) }.</div>
                <div className="space-y-4">
                    {paginatedDocuments.map((doc) => (
                      <Card
                        key={doc.id}
                        className="transform transition-all duration-200 hover:scale-[1.01] hover:shadow-xl bg-white dark:bg-gray-900 backdrop-blur-sm bg-opacity-90 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
                      >
                        <CardHeader className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800">
                          <CardTitle className="flex items-start gap-2 text-lg sm:text-xl">
                            <FileText className="h-5 w-5 text-blue-700 mt-0.5 flex-shrink-0" />
                            <span className="leading-tight">
                              {toTitleCase(doc.title).split("Nº").join("nº") + " de " + formatarDataPorExtenso(doc.date)}
                            </span>
                          </CardTitle>
                          <CardDescription className="text-sm sm:text-base">
                            Número do documento: {doc.number}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                          <p className="text-muted-foreground mb-4 text-sm sm:text-base leading-relaxed">
                            {doc.description}
                          </p>
                          <Button
                            variant="outline"
                            onClick={() =>
                              handleDownload(doc, doc.number.split("/").join("").split(".").join("") + "-" + doc.date)
                            }
                            className="w-full sm:w-auto group hover:bg-blue-50 dark:hover:bg-blue-900 border-2 border-blue-200 hover:border-blue-300 dark:border-blue-600 dark:hover:border-blue-500"
                          >
                            <Download className="h-4 w-4 text-blue-700 group-hover:text-blue-800 mr-2" />
                            Baixar PDF
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                    {/* ... Resto do seu JSX, como a mensagem de "nenhum documento" e a paginação ... */}
                </div>
                {filteredDocuments.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      itemsPerPage={itemsPerPage}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
            </div>
        </div>
    </div>
  )
}