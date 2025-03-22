import { FileText, Image, FileArchive, GripVertical } from "lucide-react"
import { formatFileSize } from "@/lib/utils"
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

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

interface DocumentItemProps {
  doc: DocItem
  viewMode: 'list' | 'grid' | 'card'
}

const getStatusColor = (status: DocItem['status']) => {
  switch (status) {
    case '处理中':
      return 'text-yellow-500 bg-yellow-50'
    case '已索引':
      return 'text-green-500 bg-green-50'
    case '索引失败':
      return 'text-red-500 bg-red-50'
  }
}

const getDocIcon = (docType: string) => {
  switch (docType.toLowerCase()) {
    case 'pdf':
    case 'docx':
      return <FileText className="h-5 w-5 text-blue-500" />
    case 'image':
    case 'png':
    case 'jpg':
      return <Image className="h-5 w-5 text-green-500" />
    default:
      return <FileArchive className="h-5 w-5 text-gray-500" />
  }
}

export function DocumentItem({ doc, viewMode }: DocumentItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: doc.docId })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const statusClass = getStatusColor(doc.status)
  
  const DragHandle = () => (
    <div
      className="opacity-0 group-hover:opacity-100 transition-opacity cursor-move"
      {...attributes}
      {...listeners}
    >
      <GripVertical className="h-5 w-5 text-gray-400" />
    </div>
  )
  
  const baseContent = (
    <>
      <div className="flex items-center gap-2">
        <DragHandle />
        {getDocIcon(doc.docType)}
        <span className="font-medium">{doc.docName}</span>
        {doc.tag && (
          <span className="px-2 py-0.5 text-xs bg-gray-100 rounded-full">
            {doc.tag}
          </span>
        )}
      </div>
      <div className={`text-xs px-2 py-0.5 rounded-full w-14 ${statusClass}`}>
        {doc.status}
      </div>
      <div className="text-sm text-gray-500">
        大小：{formatFileSize(doc.docSize)}
      </div>
      <div className="text-sm text-gray-500">
        上传时间：{doc.uploadTime}
      </div>
      <div className="text-sm">
        <span className="text-primary">检索：{doc.statistics.searchCount}次</span>
        <span className="ml-2 text-primary">
          命中率：{(doc.statistics.hitRate * 100).toFixed(1)}%
        </span>
      </div>
    </>
  )

  switch (viewMode) {
    case 'list':
      return (
        <div
          ref={setNodeRef}
          style={style}
          className="group flex items-center justify-between p-4 hover:bg-gray-50 border-b"
          onClick={() => onSelect?.(doc.docId)}
        >
          <div className="flex-1 min-w-0 space-y-1">{baseContent}</div>
        </div>
      )

    case 'grid':
      return (
        <div
          ref={setNodeRef}
          style={style}
          className="group p-4 border rounded-lg hover:shadow-md transition-shadow space-y-2"
          onClick={() => onSelect?.(doc.docId)}
        >
          {doc.previewUrl && (
            <div className="aspect-video rounded-md overflow-hidden bg-gray-100">
              <img
                src={doc.previewUrl}
                alt={doc.docName}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="space-y-2">{baseContent}</div>
        </div>
      )

    case 'card':
      return (
        <div
          ref={setNodeRef}
          style={style}
          className="group p-6 border rounded-lg hover:shadow-lg transition-shadow space-y-3"
          onClick={() => onSelect?.(doc.docId)}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">{baseContent}</div>
            {doc.previewUrl && (
              <div className="w-24 h-24 rounded-md overflow-hidden bg-gray-100 ml-4">
                <img
                  src={doc.previewUrl}
                  alt={doc.docName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      )
  }
}