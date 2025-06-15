"use client"

import type React from "react"
import { useState } from "react"
import type { DocumentType, DateRange } from "../types"
import { Filter, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface DocumentFiltersProps {
  onFilterChange: (type: DocumentType | "ALL", dateRange: DateRange) => void
  onSearchChange: (term: string) => void
  searchTerm: string
  hideTypeFilter?: boolean
}

export function DocumentFilters({
  onFilterChange,
  onSearchChange,
  searchTerm,
  hideTypeFilter = false,
}: DocumentFiltersProps) {
  const [fromDate, setFromDate] = useState<string>("")
  const [toDate, setToDate] = useState<string>("")

  const handleFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFromDate(value)

    const dateRange: DateRange = {
      from: value ? new Date(value) : undefined,
      to: toDate ? new Date(toDate) : undefined,
    }
    onFilterChange("ALL", dateRange)
  }

  const handleToDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setToDate(value)

    const dateRange: DateRange = {
      from: fromDate ? new Date(fromDate) : undefined,
      to: value ? new Date(value) : undefined,
    }
    onFilterChange("ALL", dateRange)
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-100 dark:border-gray-800">
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-blue-700" />
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200">Filtros de Pesquisa</h2>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 z-10" />
          <Input
            placeholder="Pesquisar por título, descrição ou número..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 sm:pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-sm sm:text-base focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Data Inicial - Completamente independente */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 block">
              Data Inicial
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={handleFromDateChange}
              className="w-full h-10 sm:h-11 px-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm sm:text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm"
            />
          </div>

          {/* Data Final - Completamente independente */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 block">Data Final</label>
            <input
              type="date"
              value={toDate}
              onChange={handleToDateChange}
              className="w-full h-10 sm:h-11 px-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm sm:text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
