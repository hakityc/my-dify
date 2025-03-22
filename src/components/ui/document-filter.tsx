import { useState } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { Button } from './button'
import { Input } from './input'
import { formatFileSize } from '@/lib/utils'

interface FilterOptions {
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

interface DocumentFilterProps {
  onSearch: (keyword: string) => void
  onFilter: (options: FilterOptions) => void
}

const DOC_TYPES = ['pdf', 'docx', 'xlsx', 'image']
const SIZE_RANGES = [
  { label: '< 1MB', min: 0, max: 1024 * 1024 },
  { label: '1MB - 5MB', min: 1024 * 1024, max: 5 * 1024 * 1024 },
  { label: '> 5MB', min: 5 * 1024 * 1024 },
]

export function DocumentFilter({ onSearch, onFilter }: DocumentFilterProps) {
  const [showFilter, setShowFilter] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [filters, setFilters] = useState<FilterOptions>({})

  const handleSearch = () => {
    onSearch(keyword)
  }

  const handleFilterChange = (newFilters: FilterOptions) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFilter(updatedFilters)
  }

  const clearFilters = () => {
    setFilters({})
    onFilter({})
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            type="text"
            placeholder="搜索文档..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="pl-10"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch()
              }
            }}
          />
          <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowFilter(!showFilter)}
        >
          <Filter className={`h-4 w-4 ${showFilter ? 'text-primary' : ''}`} />
        </Button>
      </div>

      {showFilter && (
        <div className="p-4 border rounded-lg space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">高级筛选</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-gray-500"
            >
              <X className="h-4 w-4 mr-1" />
              清除筛选
            </Button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">文档类型</label>
              <div className="flex flex-wrap gap-2">
                {DOC_TYPES.map(type => (
                  <Button
                    key={type}
                    variant={filters.docType?.includes(type) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      const types = filters.docType || []
                      handleFilterChange({
                        docType: types.includes(type)
                          ? types.filter(t => t !== type)
                          : [...types, type]
                      })
                    }}
                  >
                    {type.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1 block">文件大小</label>
              <div className="flex flex-wrap gap-2">
                {SIZE_RANGES.map((range, index) => (
                  <Button
                    key={index}
                    variant={
                      filters.sizeRange?.min === range.min &&
                      filters.sizeRange?.max === range.max
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    onClick={() => handleFilterChange({ sizeRange: range })}
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1 block">上传时间</label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  value={filters.dateRange?.start || ''}
                  onChange={(e) =>
                    handleFilterChange({
                      dateRange: {
                        ...filters.dateRange,
                        start: e.target.value,
                      },
                    })
                  }
                />
                <Input
                  type="date"
                  value={filters.dateRange?.end || ''}
                  onChange={(e) =>
                    handleFilterChange({
                      dateRange: {
                        ...filters.dateRange,
                        end: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}