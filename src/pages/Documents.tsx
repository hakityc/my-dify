import { useState } from 'react'
import { ViewToggle } from '@/components/ui/view-toggle'
import { DocumentItem } from '@/components/ui/document-item'
import {
  DndContext,
  DragEndEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  rectSortingStrategy,  // Change this import
} from '@dnd-kit/sortable'
import { DocumentFilter } from '@/components/ui/document-filter'
import { DocumentStatistics } from '@/components/ui/document-statistics'

interface DocStatistics {
  searchCount: number
  hitRate: number
}

interface DocItem {
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

const mockDocuments: DocItem[] = [
  {
    docId: '1',
    docName: '营销方案.pdf',
    docType: 'pdf',
    docSize: 1024576,
    uploadTime: '2024-01-20 10:00:00',
    status: '已索引',
    statusUpdateTime: '2024-01-20 10:05:00',
    previewUrl: 'https://example.com/preview1.jpg',
    tag: '营销',
    group: '方案文档',
    statistics: {
      searchCount: 150,
      hitRate: 0.85
    }
  },
  {
    docId: '2',
    docName: '产品手册.docx',
    docType: 'docx',
    docSize: 2048000,
    uploadTime: '2024-01-19 15:30:00',
    status: '已索引',
    statusUpdateTime: '2024-01-19 15:35:00',
    previewUrl: 'https://example.com/preview2.jpg',
    tag: '产品',
    group: '产品文档',
    statistics: {
      searchCount: 200,
      hitRate: 0.92
    }
  },
  {
    docId: '3',
    docName: '数据分析报告.pdf',
    docType: 'pdf',
    docSize: 3145728,
    uploadTime: '2024-01-18 09:00:00',
    status: '处理中',
    statusUpdateTime: '2024-01-18 09:01:00',
    previewUrl: 'https://example.com/preview3.jpg',
    tag: '数据',
    group: '分析报告',
    statistics: {
      searchCount: 80,
      hitRate: 0.75
    }
  },
  {
    docId: '4',
    docName: '用户调研报告.docx',
    docType: 'docx',
    docSize: 1572864,
    uploadTime: '2024-01-17 14:20:00',
    status: '已索引',
    statusUpdateTime: '2024-01-17 14:25:00',
    previewUrl: 'https://example.com/preview4.jpg',
    tag: '研究',
    group: '分析报告',
    statistics: {
      searchCount: 120,
      hitRate: 0.88
    }
  },
  {
    docId: '5',
    docName: '产品设计稿.png',
    docType: 'image',
    docSize: 5242880,
    uploadTime: '2024-01-16 11:30:00',
    status: '已索引',
    statusUpdateTime: '2024-01-16 11:32:00',
    previewUrl: 'https://example.com/preview5.jpg',
    tag: '设计',
    group: '产品文档',
    statistics: {
      searchCount: 300,
      hitRate: 0.95
    }
  },
  {
    docId: '6',
    docName: '季度财务报表.xlsx',
    docType: 'xlsx',
    docSize: 819200,
    uploadTime: '2024-01-15 09:45:00',
    status: '索引失败',
    statusUpdateTime: '2024-01-15 09:50:00',
    previewUrl: 'https://example.com/preview6.jpg',
    tag: '财务',
    group: '财务文档',
    statistics: {
      searchCount: 50,
      hitRate: 0.65
    }
  },
  {
    docId: '7',
    docName: '项目计划书.pdf',
    docType: 'pdf',
    docSize: 2097152,
    uploadTime: '2024-01-14 16:00:00',
    status: '处理中',
    statusUpdateTime: '2024-01-14 16:01:00',
    previewUrl: 'https://example.com/preview7.jpg',
    tag: '项目',
    group: '方案文档',
    statistics: {
      searchCount: 90,
      hitRate: 0.82
    }
  },
  {
    docId: '8',
    docName: '技术架构图.jpg',
    docType: 'image',
    docSize: 3145728,
    uploadTime: '2024-01-13 10:15:00',
    status: '已索引',
    statusUpdateTime: '2024-01-13 10:17:00',
    previewUrl: 'https://example.com/preview8.jpg',
    tag: '技术',
    group: '技术文档',
    statistics: {
      searchCount: 180,
      hitRate: 0.89
    }
  },
  {
    docId: '9',
    docName: '会议纪要.docx',
    docType: 'docx',
    docSize: 512000,
    uploadTime: '2024-01-12 15:40:00',
    status: '已索引',
    statusUpdateTime: '2024-01-12 15:42:00',
    previewUrl: 'https://example.com/preview9.jpg',
    tag: '会议',
    group: '其他文档',
    statistics: {
      searchCount: 45,
      hitRate: 0.71
    }
  }
]

type ViewMode = 'list' | 'grid' | 'card'

export function Documents() {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [documents, setDocuments] = useState(mockDocuments)
  const [selectedDocs, setSelectedDocs] = useState<string[]>([])
  const [filteredDocs, setFilteredDocs] = useState(documents)

  // 使用 filteredDocs 计算分组
  const groupedDocs = filteredDocs.reduce((groups, doc) => {
    const group = groups[doc.group || '未分组'] || []
    group.push(doc)
    return { ...groups, [doc.group || '未分组']: group }
  }, {} as Record<string, DocItem[]>)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return
  
    const activeDoc = filteredDocs.find(doc => doc.docId === active.id)
    const overDoc = filteredDocs.find(doc => doc.docId === over.id)
    
    if (activeDoc && overDoc && activeDoc.group === overDoc.group) {
      const oldIndex = documents.findIndex(doc => doc.docId === active.id)
      const newIndex = documents.findIndex(doc => doc.docId === over.id)
      
      const newDocuments = arrayMove(documents, oldIndex, newIndex)
      setDocuments(newDocuments)
      // 同步更新 filteredDocs
      setFilteredDocs(prev => {
        const oldFilteredIndex = prev.findIndex(doc => doc.docId === active.id)
        const newFilteredIndex = prev.findIndex(doc => doc.docId === over.id)
        return arrayMove(prev, oldFilteredIndex, newFilteredIndex)
      })
    }
  }

  const handleSelect = (docId: string) => {
    setSelectedDocs(prev => {
      if (prev.includes(docId)) {
        return prev.filter(id => id !== docId)
      }
      return [...prev, docId]
    })
  }

  const handleBatchMove = (targetGroup: string) => {
    if (selectedDocs.length === 0) return
    
    setDocuments(prev => prev.map(doc => 
      selectedDocs.includes(doc.docId) 
        ? { ...doc, group: targetGroup }
        : doc
    ))
    setSelectedDocs([])
  }

  const handleBatchDelete = () => {
    if (selectedDocs.length === 0) return
    
    setDocuments(prev => 
      prev.filter(doc => !selectedDocs.includes(doc.docId))
    )
    setSelectedDocs([])
  }

  // 删除这里重复声明的 filteredDocs
  // const [filteredDocs, setFilteredDocs] = useState(documents)

  const handleSearch = (keyword: string) => {
    if (!keyword) {
      setFilteredDocs(documents)
      return
    }
    
    const filtered = documents.filter(doc => 
      doc.docName.toLowerCase().includes(keyword.toLowerCase()) ||
      doc.tag?.toLowerCase().includes(keyword.toLowerCase())
    )
    setFilteredDocs(filtered)
  }

  // 定义过滤选项接口
  interface FilterOptions {
    docType?: string[];
    sizeRange?: {
      min?: number;
      max?: number;
    };
    dateRange?: {
      start?: string;
      end?: string;
    };
  }

  const handleFilter = (options: FilterOptions) => {
    let filtered = [...documents]

    if (options.docType?.length) {
      filtered = filtered.filter(doc => 
        options.docType?.includes(doc.docType)
      )
    }

    if (options.sizeRange) {
      filtered = filtered.filter(doc => {
        const { min, max } = options.sizeRange!
        if (min && max) {
          return doc.docSize >= min && doc.docSize <= max
        }
        if (min) {
          return doc.docSize >= min
        }
        if (max) {
          return doc.docSize <= max
        }
        return true
      })
    }

    if (options.dateRange?.start || options.dateRange?.end) {
      filtered = filtered.filter(doc => {
        const docDate = new Date(doc.uploadTime)
        const start = options.dateRange?.start ? new Date(options.dateRange.start) : null
        const end = options.dateRange?.end ? new Date(options.dateRange.end) : null

        if (start && end) {
          return docDate >= start && docDate <= end
        }
        if (start) {
          return docDate >= start
        }
        if (end) {
          return docDate <= end
        }
        return true
      })
    }

    setFilteredDocs(filtered)
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">知识库文档</h1>
        <ViewToggle currentView={viewMode} onViewChange={setViewMode} />
      </div>

      {/* 添加统计图表 */}
      <div className="mb-8">
        <DocumentStatistics documents={documents} />
      </div>

      <div className="mb-6">
        <DocumentFilter
          onSearch={handleSearch}
          onFilter={handleFilter}
        />
      </div>

      <div className="flex items-center gap-4">
        {selectedDocs.length > 0 && (
          <div className="flex items-center gap-2">
            <select 
              className="border rounded px-2 py-1"
              onChange={(e) => handleBatchMove(e.target.value)}
            >
              <option value="">移动到...</option>
              {Object.keys(groupedDocs).map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
            <button
              className="text-red-500 hover:text-red-600"
              onClick={handleBatchDelete}
            >
              删除
            </button>
          </div>
        )}
        

      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-8">
          {Object.entries(groupedDocs).map(([group, docs]) => (
            <div key={group}>
              <h2 className="text-lg font-medium mb-4">{group}</h2>
              <SortableContext
                items={docs.map(doc => doc.docId)}
                strategy={viewMode === 'list' ? verticalListSortingStrategy : rectSortingStrategy}
              >
                <div className={`
                  gap-4
                  ${viewMode === 'list' ? 'flex flex-col' : ''}
                  ${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : ''}
                  ${viewMode === 'card' ? 'grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2' : ''}
                `}>
                  {docs.map((doc) => (
                    <DocumentItem
                      key={doc.docId}
                      doc={doc}
                      viewMode={viewMode}
                      selected={selectedDocs.includes(doc.docId)}
                      onSelect={handleSelect}
                    />
                  ))}
                </div>
              </SortableContext>
            </div>
          ))}
        </div>
      </DndContext>

    </div>
  )
}