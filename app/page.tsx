import { DocumentList } from "./components/document-list"
import { fetchDocuments } from "./data/documents"
import { Suspense } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { FileText } from "lucide-react"

// Componente de loading
function DocumentsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Loading para os cards de estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="p-4 sm:p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Loading para os filtros */}
        <Card className="mb-6 sm:mb-8 animate-pulse">
          <CardContent className="p-4 sm:p-6">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded mb-4"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>

        {/* Loading para a lista de documentos */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
                <p className="text-lg font-medium text-gray-600">Carregando documentos...</p>
                <p className="text-sm text-gray-500 mt-2">Conectando com a API...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Componente que carrega os documentos
async function DocumentsContent() {
  const documents = await fetchDocuments()
  return <DocumentList documents={documents} />
}

export default function Home() {
  return (
    <Suspense fallback={<DocumentsLoading />}>
      <DocumentsContent />
    </Suspense>
  )
}
