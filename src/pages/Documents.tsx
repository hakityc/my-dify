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

  // Move groupedDocs computation here
  const groupedDocs = documents.reduce((groups, doc) => {
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

    const activeDoc = documents.find(doc => doc.docId === active.id)
    const overDoc = documents.find(doc => doc.docId === over.id)
    
    if (activeDoc && overDoc && activeDoc.group === overDoc.group) {
      const oldIndex = documents.findIndex(doc => doc.docId === active.id)
      const newIndex = documents.findIndex(doc => doc.docId === over.id)
      
      setDocuments(arrayMove(documents, oldIndex, newIndex))
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">文档</h1>
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
          <ViewToggle currentView={viewMode} onViewChange={setViewMode} />
        </div>
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
                  ${viewMode === 'grid' ? 'grid grid-cols-4' : ''}
                  ${viewMode === 'card' ? 'grid grid-cols-2' : ''}
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