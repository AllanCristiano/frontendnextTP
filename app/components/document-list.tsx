import { useState } from "react"
import type { Document, DocumentType, DateRange } from "../types"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { FileText, Download, FileBarChart2, Filter, Files } from "lucide-react"
import { DocumentFilters } from "./document-filters"
import { Pagination } from "./pagination"
import { Button } from "@/components/ui/button"

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

  // Filtra os documentos com base na busca, aba ativa e data
  const filteredDocuments = documents.filter((doc) => {
    const cleanTitle = doc.title.replace("/", "").replace(".", "")
    const cleanDescription = doc.description.replace("/", "").replace(".", "")
    const cleanNumber = doc.number.replace("/", "").replace(".", "")
    const matchesSearch =
      cleanTitle.toLowerCase().includes(searchTerm.toLowerCase().replace("/", "").replace(".", "")) ||
      cleanDescription.toLowerCase().includes(searchTerm.toLowerCase().replace("/", "").replace(".", "")) ||
      cleanNumber.toLowerCase().includes(searchTerm.toLowerCase().replace("/", "").replace(".", ""))

    const matchesTab = activeTab === "ALL" || doc.type === activeTab

    const docDate = new Date(doc.date)
    const matchesDateRange =
      (!dateRange.from || docDate >= dateRange.from) && (!dateRange.to || docDate <= dateRange.to)

    return matchesSearch && matchesTab && matchesDateRange
  })

  // Paginação sem ordenação por data
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage)
  const paginatedDocuments = filteredDocuments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

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

  // Função para baixar o PDF usando o endpoint interno
  const handleDownload = (filename: string) => {
    const url = `/documentos/${filename}.pdf`
    const link = document.createElement("a")
    link.href = url
    link.download = `${filename}.pdf`
    link.click()
  }

  function formatarDataPorExtenso(dataStr: string): string {
    const [ano, mes, dia] = dataStr.split("-").map(Number)
    const data = new Date(ano, mes - 1, dia)

    const opcoes: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }

    return new Intl.DateTimeFormat("pt-BR", opcoes).format(data).toLowerCase()
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* ... stats cards unchanged ... */}
        </div>

        <DocumentFilters
          onFilterChange={handleFilterChange}
          onSearchChange={setSearchTerm}
          searchTerm={searchTerm}
          hideTypeFilter={true}
        />

        {/* Tabs e Conteúdo */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden">
          {/* Navegação de Tabs */}
          <div className="flex justify-center border-b">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as DocumentType | "ALL")}
                className={activeTab === tab.id ? "active-tab" : ""}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Conteúdo dos Tabs */}
          <div className="p-4">
            {paginatedDocuments.map((doc) => (
              <Card key={doc.id} className="mb-4">
                {/* Conteúdo do cartão */}
              </Card>
            ))}

            {filteredDocuments.length === 0 && <p>Nenhum documento encontrado</p>}

            {filteredDocuments.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </div>

      <style jsx>{` .active-tab { /* estilos da aba ativa */ } `}</style>
    </div>
  )
}
