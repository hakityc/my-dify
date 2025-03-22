import { Dialog, DialogContent, DialogTitle } from './dialog'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'

interface DocumentPreviewProps {
  isOpen: boolean
  onClose: () => void
  doc: {
    docName: string
    docType: string
    previewUrl: string
  }
}

export function DocumentPreview({ isOpen, onClose, doc }: DocumentPreviewProps) {
  const [loading, setLoading] = useState(true)

  const renderPreview = () => {
    switch (doc.docType) {
      case 'pdf':
        return (
          <iframe
            src={`https://docs.google.com/viewer?url=${encodeURIComponent('https://www.africau.edu/images/default/sample.pdf')}&embedded=true`}
            className="w-full h-[80vh]"
            onLoad={() => setLoading(false)}
          />
        )
      case 'docx':
      case 'xlsx':
        return (
          <iframe
            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent('https://calibre-ebook.com/downloads/demos/demo.docx')}`}
            className="w-full h-[80vh]"
            onLoad={() => setLoading(false)}
          />
        )
      case 'image':
        return (
          <img
            src="https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE4wE9P"
            alt={doc.docName}
            className="max-w-full max-h-[80vh] object-contain"
            onLoad={() => setLoading(false)}
          />
        )
      default:
        return <div className="p-4">暂不支持该文件格式的预览</div>
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-[60vw] !w-[60vw] md:!max-w-[70vw] md:!w-[70vw] lg:!max-w-[80vw] lg:!w-[80vw]">
        <DialogTitle>{doc.docName}</DialogTitle>
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          )}
          {renderPreview()}
        </div>
      </DialogContent>
    </Dialog>
  )
}