export type DocumentType = 'PORTARIA' | 'LEI_ORDINARIA' | 'LEI_COMPLEMENTAR' | 'DECRETO';

export interface Document {
  id: string;
  type: DocumentType;
  number: string;
  title: string;
  description: string;
  date: string;
  url: string;
}

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
}
