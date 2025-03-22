export interface Document {
  id: string
  title: string
  description: string
  updatedAt: string
  group: string
}

export interface DocStatistics {
  searchCount: number
  hitRate: number
}

export interface DocItem {
  docId: string
  docName: string
  docType: string
  docSize: number
  uploadTime: string
  status: '处理中' | '已索引' | '索引失败'
  statusUpdateTime: string
  previewUrl: string
  tag?: string
  group?: string
  statistics: DocStatistics
}

export interface FilterOptions {
  docType?: string[]
  sizeRange?: {
    min?: number
    max?: number
  }
  dateRange?: {
    start?: string
    end?: string
  }
}