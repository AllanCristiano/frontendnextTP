"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { PaginationInfo } from "../types"

interface PaginationProps extends PaginationInfo {
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const maxButtons = 10
  // Calcula o primeiro número do grupo atual
  const startPage = Math.floor((currentPage - 1) / maxButtons) * maxButtons + 1
  // Calcula o último número do grupo, sem ultrapassar o total de páginas
  const endPage = Math.min(startPage + maxButtons - 1, totalPages)

  const pages = []
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 mt-4 sm:mt-8">
      {/* Botão para ir para a página anterior */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="border-blue-200 hover:border-blue-300 hover:bg-blue-50 text-blue-700"
      >
        <ChevronLeft className="h-4 w-4" />
        {/* Remove o texto em telas menores */}
        <span className="hidden sm:inline ml-1">Anterior</span>
      </Button>

      <div className="flex items-center gap-1 sm:gap-2 mx-2 sm:mx-4">
        {startPage > 1 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(startPage - 1)}
            className="w-6 sm:w-8 border-blue-200 hover:border-blue-300 hover:bg-blue-50 text-blue-700"
          >
            ...
          </Button>
        )}

        {pages.map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
            className={`w-6 sm:w-8 ${
              currentPage === page
                ? "bg-blue-700 hover:bg-blue-600 text-white"
                : "border-blue-200 hover:border-blue-300 hover:bg-blue-50 text-blue-700"
            }`}
          >
            {page}
          </Button>
        ))}

        {endPage < totalPages && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(endPage + 1)}
            className="w-6 sm:w-8 border-blue-200 hover:border-blue-300 hover:bg-blue-50 text-blue-700"
          >
            ...
          </Button>
        )}
      </div>

      {/* Botão para ir para a próxima página */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="border-blue-200 hover:border-blue-300 hover:bg-blue-50 text-blue-700"
      >
        {/* Remove o texto em telas menores */}
        <span className="hidden sm:inline mr-1">Próxima</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
