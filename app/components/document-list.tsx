"use client"

import { useState } from "react"
import type { Document, DocumentType, DateRange } from "../types"
import { Card } from "@/components/ui/card"
import { DocumentFilters } from "./document-filters"
import { Pagination } from "./pagination"

interface DocumentListProps {
  documents: Document[]
}

// Função utilitária para parsing consistente de datas no formato YYYY-MM-DD
function parseDateISO(dataStr: string): Date {
  const [ano, mes, dia] = dataStr.split("-").map(Number)
  return new Date(ano, mes - 1, dia)
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
    const term = searchTerm.toLowerCase().replace("/", "").replace(".", "")

    const matchesSearch =
      cleanTitle.toLowerCase().includes(term) ||
      cleanDescription.toLowerCase().includes(term) ||
      cleanNumber.toLowerCase().includes(term)

    const matchesTab = activeTab === "ALL" || doc.type === activeTab

    const docDate = parseDateISO(doc.date)
    const matchesDateRange =
      (!dateRange.from || docDate >= dateRange.from) &&
      (!dateRange.to || docDate <= dateRange.to)

    return matchesSearch && matchesTab && matchesDateRange
  })

  // Ordena os documentos do mais novo para o mais antigo (sem mutar o array)
  const sortedDocuments = [...filteredDocuments].sort((a, b) =>
    parseDateISO(a.date).getTime() - parseDateISO(a.date).getTime()
  )

  // Estatísticas
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
  const paginatedDocuments = sortedDocuments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* ... cards remain unchanged ... */}
        </div>

        <DocumentFilters
          onFilterChange={handleFilterChange}
          onSearchChange={setSearchTerm}
          searchTerm={searchTerm}
          hideTypeFilter={true}
        />

        {/* Tabs & Listagem */}
        <div className="mb-6 sm:mb-8">
          {/* ... tab nav unchanged ... */}

          <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-gray-800">
            <div className="space-y-4">
              {paginatedDocuments.map((doc) => (
                <Card key={doc.id} className="transform transition-all duration-200 hover:scale-[1.01] ...">
                  {/* ... card content unchanged ... */}
                </Card>
              ))}

              {filteredDocuments.length === 0 && (
                <div className="text-center py-8 ...">
                  {/* mensagem de nenhum documento */}
                </div>
              )}
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

      <style jsx>{`
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .border-b-3 { border-bottom-width: 3px; }
      `}</style>
    </div>
  )
}
