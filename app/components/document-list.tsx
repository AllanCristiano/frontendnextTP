"use client"

import { useState, useMemo } from "react"
import type { Document, DocumentType, DateRange } from "../types"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { FileText, Download, FileBarChart2, Filter, Files, CalendarCheck, Clock } from "lucide-react"
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

  // --- LÓGICA DE DATAS PARA O TRIBUNAL DE CONTAS ---
  const latestDates = useMemo(() => {
    const getLatest = (type: DocumentType | "ALL") => {
      const filtered = type === "ALL" ? documents : documents.filter((d) => d.type === type)
      if (filtered.length === 0) return null
      return filtered.reduce((latest, current) => {
        return new Date(current.date) > new Date(latest) ? current.date : latest
      }, filtered[0].date)
    }

    return {
      ALL: getLatest("ALL"),
      PORTARIA: getLatest("PORTARIA"),
      LEI_ORDINARIA: getLatest("LEI_ORDINARIA"),
      LEI_COMPLEMENTAR: getLatest("LEI_COMPLEMENTAR"),
      DECRETO: getLatest("DECRETO"),
    }
  }, [documents])

  // Data do sistema (Hoje)
  const todayFormatted = new Date().toLocaleDateString('pt-BR');

  // Filtra os documentos
  const filteredDocuments = documents.filter((doc) => {
    const cleanTitle = doc.title.replace("/", "").replace(".", "")
    const cleanDescription = doc.description.replace("/", "").replace(".", "")
    const cleanNumber = doc.number.replace("/", "").replace(".", "")
    const docFullText = (doc.fullText || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    
    const searchLower = searchTerm.toLowerCase().replace("/", "").replace(".", "")
    
    const matchesSearch =
      cleanTitle.toLowerCase().includes(searchLower) ||
      cleanDescription.toLowerCase().includes(searchLower) ||
      cleanNumber.toLowerCase().includes(searchLower) ||
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

  // Formatação técnica (DD/MM/AAAA) para o Tribunal
  function formatarDataTecnica(dataStr: string | null): string {
    if (!dataStr) return "--/--/----"
    const [ano, mes, dia] = dataStr.split("-").map(Number)
    return `${dia.toString().padStart(2, '0')}/${mes.toString().padStart(2, '0')}/${ano}`
  }

  // Formatação por extenso para o título do card
  function formatarDataPorExtenso(dataStr: string | null): string {
    if (!dataStr) return ""
    const [ano, mes, dia] = dataStr.split("-").map(Number)
    const data = new Date(ano, mes - 1, dia)
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(data).toLowerCase()
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-gradient-to-br from-blue-800 to-blue-600 text-white shadow-xl border-none">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm sm:text-lg font-medium italic">Transparência Ativa</CardTitle>
                <Files className="h-5 w-5 opacity-80" />
              </div>
              <p className="text-3xl font-bold mt-2">{documentStats.total}</p>
              <div className="mt-4 flex items-center gap-2 text-[10px] bg-black/20 w-fit px-2 py-1 rounded-md uppercase tracking-wider font-semibold">
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                Sincronizado com o Diário Oficial
              </div>
            </CardHeader>
          </Card>

          <Card className="sm:col-span-2 bg-white dark:bg-gray-900 border-2 border-blue-100 dark:border-gray-800">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <CardTitle className="text-sm sm:text-lg font-medium text-blue-900 dark:text-blue-100">Distribuição por Categoria</CardTitle>
                <FileBarChart2 className="h-5 w-5 text-blue-600" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Portarias", value: documentStats.byType.ORDINANCE },
                  { label: "Leis Ord.", value: documentStats.byType.ORDINARY_LAW },
                  { label: "Leis Comp.", value: documentStats.byType.COMPLEMENTARY_LAW },
                  { label: "Decretos", value: documentStats.byType.DECREE },
                ].map((item, i) => (
                  <div key={i} className="text-center p-2 rounded-lg bg-blue-50/50 dark:bg-blue-900/10">
                    <p className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">{item.label}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </CardHeader>
          </Card>
        </div>

        <DocumentFilters
          onFilterChange={handleFilterChange}
          onSearchChange={setSearchTerm}
          searchTerm={searchTerm}
          hideTypeFilter={true}
        />

        <div className="mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex justify-center border-b border-gray-200 dark:border-gray-700">
              <div className="flex overflow-x-auto scrollbar-hide max-w-full">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id as DocumentType | "ALL")}
                    className={`
                      relative flex-shrink-0 px-4 sm:px-6 py-4 sm:py-5 text-sm sm:text-base font-medium transition-all duration-300
                      ${activeTab === tab.id ? "text-blue-700 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20" : "text-gray-500 hover:text-blue-600"}
                    `}
                  >
                    <span className="whitespace-nowrap">{tab.label}</span>
                    {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-700 dark:bg-blue-400" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 sm:p-6">
              
              {/* STATUS DE CONFORMIDADE (REDAÇÃO TRIBUNAL DE CONTAS) */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-2 border-r-0 sm:border-r border-slate-300 dark:border-slate-600 pr-0 sm:pr-4">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    Portal atualizado em: <strong className="text-slate-900 dark:text-slate-100">{todayFormatted}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4 text-green-600" />
                  <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    Dados disponíveis até: <strong className="text-slate-900 dark:text-slate-100">
                      {formatarDataTecnica(latestDates[activeTab as keyof typeof latestDates])}
                    </strong>
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {paginatedDocuments.map((doc) => (
                  <Card key={doc.id} className="transition-all hover:shadow-md border border-gray-200 dark:border-gray-800">
                    <CardHeader className="p-4 sm:p-6 border-b border-gray-50 dark:border-gray-800/50">
                      <CardTitle className="flex items-start gap-2 text-lg">
                        <FileText className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                        <span className="leading-tight text-gray-900 dark:text-gray-100">
                          {toTitleCase(doc.title).split("Nº").join("nº") + " de " + formatarDataPorExtenso(doc.date)}
                        </span>
                      </CardTitle>
                      <CardDescription className="font-mono text-[10px] mt-1">
                        REFERÊNCIA: {doc.number}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                      <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm leading-relaxed">
                        {doc.description}
                      </p>
                      <Button variant="outline" className="w-full sm:w-auto border-blue-200 text-blue-700 hover:bg-blue-50">
                        <Download className="h-4 w-4 mr-2" />
                        Baixar PDF Oficial
                      </Button>
                    </CardContent>
                  </Card>
                ))}

                {filteredDocuments.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Nenhum documento encontrado para este critério.</p>
                  </div>
                )}
              </div>

              {filteredDocuments.length > 0 && (
                <div className="mt-8">
                  <Pagination currentPage={currentPage} totalPages={totalPages} itemsPerPage={itemsPerPage} onPageChange={handlePageChange} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
    </div>
  )
}