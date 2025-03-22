import { LayoutGrid, List, Rows } from "lucide-react"
import { Button } from "./button"

type ViewMode = 'list' | 'grid' | 'card'

interface ViewToggleProps {
  currentView: ViewMode
  onViewChange: (view: ViewMode) => void
}

export function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
      <Button
        className={`cursor-pointer ${currentView === 'list' ? 'bg-[#155aef]!' : ''}`}
        variant={currentView === 'list' ? 'default' : 'ghost'}
        size="icon"
        onClick={() => onViewChange('list')}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        className={`cursor-pointer ${currentView === 'grid' ? 'bg-[#155aef]!' : ''}`}
        variant={currentView === 'grid' ? 'default' : 'ghost'}
        size="icon"
        onClick={() => onViewChange('grid')}
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        className={`cursor-pointer ${currentView === 'card' ? 'bg-[#155aef]!' : ''}`}
        variant={currentView === 'card' ? 'default' : 'ghost'}
        size="icon"
        onClick={() => onViewChange('card')}
      >
        <Rows className="h-4 w-4" />
      </Button>
    </div>
  )
}