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



// Filtra os documentos com base na busca, aba ativa e data

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



// Função para baixar o PDF usando o endpoint interno ou a API

const handleDownload = async (doc: Document, filename: string) => {

// Caso 1: O documento não tem uma URL externa, baixa de um caminho local.

if (doc.url === "") {

const url = `/documentos/${filename}.pdf`; // Caminho para o arquivo na pasta 'public'

const link = document.createElement("a");

link.href = url;

link.download = `${filename}.pdf`;

document.body.appendChild(link); // Adiciona ao corpo para compatibilidade

link.click();

document.body.removeChild(link); // Remove após o clique

}

// Caso 2: O documento tem uma URL externa, precisa ser baixado via API.

else {

try {

// 1. Constrói a URL da API para o download.

// É uma boa prática usar variáveis de ambiente para a URL base da API.

const baseUrl = "https://painelesic.aracaju.se.gov.br";

const apiFilename = `${doc.type}/${filename}.pdf`;

const url = `${baseUrl}/files/download?filename=${encodeURIComponent(apiFilename)}`;



// 2. Faz a requisição GET para a API.

const response = await fetch(url);



// 3. Verifica se a requisição foi bem-sucedida.

if (!response.ok) {

throw new Error(`Falha no download: ${response.statusText}`);

}



// 4. Converte a resposta em um Blob (Binary Large Object).

const blob = await response.blob();



// 5. Cria uma URL temporária para o Blob.

const downloadUrl = window.URL.createObjectURL(blob);



// 6. Cria um link <a> invisível para iniciar o download.

const link = document.createElement("a");

link.href = downloadUrl;

link.download = `${filename}.pdf`; // Nome do arquivo que o usuário verá.

document.body.appendChild(link);

link.click();


// 7. Limpa o link e a URL do objeto para liberar memória.

document.body.removeChild(link);

window.URL.revokeObjectURL(downloadUrl);



} catch (error) {

console.error("Erro ao baixar o arquivo:", error);

// Opcional: mostrar uma notificação de erro para o usuário.

alert("Não foi possível baixar o arquivo. Tente novamente mais tarde.");

}

}

};



// Formata data ISO (YYYY-MM-DD) para extenso em pt-BR

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



let activeTabLabel = "Todos"

let activeTabData = tabs.find((tab) => tab.id === activeTab)


return (

<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">

<div className="max-w-7xl mx-auto p-4 sm:p-6">

{/* Stats Cards - Responsivo */}

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">

<Card className="bg-gradient-to-br from-blue-700 to-blue-600 text-white">

<CardHeader className="p-4 sm:p-6">

<div className="flex items-center justify-between">

<CardTitle className="text-sm sm:text-lg font-medium">Total de Documentos</CardTitle>

<Files className="h-5 w-5 sm:h-6 sm:w-6 opacity-80" />

</div>

<p className="text-2xl sm:text-3xl font-bold mt-2">{documentStats.total}</p>

</CardHeader>

</Card>



<Card className="bg-gradient-to-br from-blue-600 to-blue-500 text-white">

<CardHeader className="p-4 sm:p-6">

<div className="flex items-center justify-between">

<CardTitle className="text-sm sm:text-lg font-medium">Documentos Filtrados</CardTitle>

<Filter className="h-5 w-5 sm:h-6 sm:w-6 opacity-80" />

</div>

<p className="text-2xl sm:text-3xl font-bold mt-2">{documentStats.filtered}</p>

</CardHeader>

</Card>



<Card className="sm:col-span-2 bg-gradient-to-br from-blue-800 to-blue-700 text-white">

<CardHeader className="p-4 sm:p-6">

<div className="flex items-center justify-between mb-4">

<CardTitle className="text-sm sm:text-lg font-medium">Distribuição por Tipo</CardTitle>

<FileBarChart2 className="h-5 w-5 sm:h-6 sm:w-6 opacity-80" />

</div>

<div className="grid grid-cols-2 gap-2 sm:gap-4">

<div className="space-y-1 sm:space-y-2">

<div className="flex justify-between items-center">

<span className="text-xs sm:text-sm">Portarias</span>

<span className="font-bold text-sm sm:text-base">{documentStats.byType.ORDINANCE}</span>

</div>

<div className="flex justify-between items-center">

<span className="text-xs sm:text-sm">Leis Ordinárias</span>

<span className="font-bold text-sm sm:text-base">{documentStats.byType.ORDINARY_LAW}</span>

</div>

</div>

<div className="space-y-1 sm:space-y-2">

<div className="flex justify-between items-center">

<span className="text-xs sm:text-sm">Leis Complementares</span>

<span className="font-bold text-sm sm:text-base">{documentStats.byType.COMPLEMENTARY_LAW}</span>

</div>

<div className="flex justify-between items-center">

<span className="text-xs sm:text-sm">Decretos</span>

<span className="font-bold text-sm sm:text-base">{documentStats.byType.DECREE}</span>

</div>

</div>

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



{/* CSS-Only Style Tabs */}

<div className="mb-6 sm:mb-8">

<div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">

{/* Tab Navigation */}

<div className="flex justify-center border-b border-gray-200 dark:border-gray-700">

<div className="flex overflow-x-auto scrollbar-hide max-w-full">

{tabs.map((tab) => (

<button

key={tab.id}

onClick={() => handleTabChange(tab.id as DocumentType | "ALL")}

className={`

relative flex-shrink-0 px-4 sm:px-6 py-4 sm:py-5

text-sm sm:text-base font-medium transition-all duration-300 ease-in-out

border-b-3 min-w-max border-2 border-transparent

${

activeTab === tab.id

? "text-blue-700 dark:text-blue-400 border-b-blue-700 dark:border-b-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-600"

: "text-gray-600 dark:text-gray-400 border-b-transparent hover:text-blue-700 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"

}

`}

>

<div className="flex flex-col items-center">

<span className="whitespace-nowrap">{tab.label}</span>

</div>



{/* Active indicator line */}

{activeTab === tab.id && (

<div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-700 dark:bg-blue-400 transform transition-all duration-300 rounded-t-sm" />

)}

</button>

))}

</div>

</div>



{/* Tab Content */}

<div className="p-4 sm:p-6 border-t border-gray-100 dark:border-gray-800">

<div className="pb-4 text-gray-600 text-sm">Atualizado em {formatarDataPorExtenso(datesByTab[activeTab]) }.</div>

<div className="space-y-4">

{paginatedDocuments.map((doc) => (

<Card

key={doc.id}

className="transform transition-all duration-200 hover:scale-[1.01] hover:shadow-xl bg-white dark:bg-gray-900 backdrop-blur-sm bg-opacity-90 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"

>

<CardHeader className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800">

<div className="flex items-start justify-between flex-col sm:flex-row gap-2 sm:gap-4">

<CardTitle className="flex items-start gap-2 text-lg sm:text-xl">

<FileText className="h-5 w-5 text-blue-700 mt-0.5 flex-shrink-0" />

<span className="leading-tight">

{toTitleCase(doc.title).split("Nº").join("nº") + " de " + formatarDataPorExtenso(doc.date)}

</span>

</CardTitle>

</div>

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



{filteredDocuments.length === 0 && (

<div className="text-center py-8 sm:py-12 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700">

<FileText className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />

<p className="text-lg sm:text-xl font-medium text-muted-foreground px-4">

Nenhum documento encontrado com os critérios selecionados

</p>

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

</div>



<style jsx>{`

.scrollbar-hide {

-ms-overflow-style: none;

scrollbar-width: none;

}

.scrollbar-hide::-webkit-scrollbar {

display: none;

}

.border-b-3 {

border-bottom-width: 3px;

}

`}</style>

</div>

)

}