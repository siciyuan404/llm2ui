"use client"

import * as React from "react"
import { Plus, X, GripVertical, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type {
  TabsTransferPickerProps,
  GenerationElement,
  SelectedElement,
} from "./types"

function TabsTransferPicker({
  dimensions,
  selectedElements,
  onAddElement,
  onRemoveElement,
  onReorderElements,
  searchPlaceholder = "搜索生成要素...",
  selectedTitle = "已选生成组合",
  emptySelectedText = "暂无选中的生成要素",
}: TabsTransferPickerProps) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeDimension, setActiveDimension] = React.useState(
    dimensions[0]?.dimension.id
  )
  const [draggedItem, setDraggedItem] = React.useState<SelectedElement | null>(null)
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null)

  const activeDimensionData = dimensions.find(
    (d) => d.dimension.id === activeDimension
  )

  const filteredElements = activeDimensionData?.elements.filter((element) =>
    element.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    element.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const isSelected = (element: GenerationElement) =>
    selectedElements.some((selected) => selected.id === element.id)

  const handleAdd = (element: GenerationElement) => {
    if (!isSelected(element)) {
      const newElement: SelectedElement = {
        ...element,
        order: selectedElements.length,
      }
      onAddElement(newElement)
    }
  }

  const handleRemove = (id: string) => {
    const newSelected = selectedElements
      .filter((item) => item.id !== id)
      .map((item, index) => ({ ...item, order: index }))
    onRemoveElement(id)
    onReorderElements(newSelected)
  }

  const handleDragStart = (e: React.DragEvent, item: SelectedElement) => {
    setDraggedItem(item)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedItem && draggedItem.id !== selectedElements[index].id) {
      setDragOverIndex(index)
    }
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (!draggedItem) return

    const dragIndex = selectedElements.findIndex((item) => item.id === draggedItem.id)
    if (dragIndex === -1 || dragIndex === dropIndex) {
      setDraggedItem(null)
      setDragOverIndex(null)
      return
    }

    const newSelected = [...selectedElements]
    const [removed] = newSelected.splice(dragIndex, 1)
    newSelected.splice(dropIndex, 0, removed)

    const reordered = newSelected.map((item, index) => ({ ...item, order: index }))
    onReorderElements(reordered)

    setDraggedItem(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDragOverIndex(null)
  }

  return (
    <div className="flex h-[600px] w-full gap-4 overflow-hidden">
      <Tabs
        value={activeDimension}
        onValueChange={setActiveDimension}
        orientation="vertical"
        className="flex w-64 flex-col border-r bg-muted/30"
      >
        <div className="border-b px-4 py-3">
          <h3 className="font-semibold text-sm">生成维度</h3>
        </div>
        <TabsList className="flex h-full flex-col items-stretch gap-1 rounded-none border-0 bg-transparent p-2">
          {dimensions.map(({ dimension }) => (
            <TabsTrigger
              key={dimension.id}
              value={dimension.id}
              className={cn(
                "data-[state=active]:bg-background data-[state=active]:shadow-sm",
                "justify-start gap-2 px-3 py-2 text-left"
              )}
            >
              <span className="flex-1">{dimension.name}</span>
              {dimension.description && (
                <Badge variant="secondary" className="text-xs">
                  {activeDimensionData?.elements.filter((e) =>
                    isSelected(e)
                  ).length || 0}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
        {dimensions.map(({ dimension }) => (
          <TabsContent key={dimension.id} value={dimension.id}>
            {dimension.description && (
              <div className="border-t p-3">
                <p className="text-xs text-muted-foreground">
                  {dimension.description}
                </p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <div className="flex flex-1 flex-col border-r">
        <div className="border-b px-4 py-3">
          <div className="mb-3 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8"
            />
          </div>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">
              {activeDimensionData?.dimension.name}
            </h3>
            <span className="text-xs text-muted-foreground">
              {filteredElements.length} 项可用
            </span>
          </div>
        </div>
        <ScrollArea className="flex-1 px-3 py-2">
          <div className="space-y-1">
            {filteredElements.map((element) => {
              const isItemSelected = isSelected(element)
              return (
                <div
                  key={element.id}
                  className={cn(
                    "group relative flex items-start gap-3 rounded-md border p-3 transition-colors",
                    isItemSelected
                      ? "border-primary/20 bg-primary/5"
                      : "border-border bg-card hover:border-primary/30"
                  )}
                >
                  {element.icon && (
                    <div className="mt-0.5 shrink-0">
                      {element.icon}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {element.label}
                      </span>
                      {isItemSelected && (
                        <Badge variant="secondary" className="text-xs">
                          已选
                        </Badge>
                      )}
                    </div>
                    {element.description && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {element.description}
                      </p>
                    )}
                  </div>
                  {!isItemSelected && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="shrink-0 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleAdd(element)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )
            })}
            {filteredElements.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  没有找到匹配的要素
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="flex w-80 flex-col">
        <div className="border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">{selectedTitle}</h3>
            <Badge variant="outline" className="text-xs">
              {selectedElements.length}
            </Badge>
          </div>
        </div>
        <ScrollArea className="flex-1 px-3 py-2">
          {selectedElements.length === 0 ? (
            <div className="flex h-full items-center justify-center py-8">
              <p className="text-sm text-muted-foreground">
                {emptySelectedText}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {selectedElements.map((item, index) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "group relative flex items-start gap-3 rounded-md border p-3 transition-all",
                    "border-border bg-card hover:border-primary/30 hover:shadow-sm",
                    dragOverIndex === index && "border-primary/50 bg-primary/5",
                    draggedItem?.id === item.id && "opacity-50"
                  )}
                >
                  <GripVertical className="mt-0.5 h-4 w-4 shrink-0 cursor-grab text-muted-foreground group-hover:text-foreground" />
                  {item.icon && (
                    <div className="mt-0.5 shrink-0">
                      {item.icon}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium">
                      {item.label}
                    </span>
                    {item.description && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-xs">
                    #{index + 1}
                  </Badge>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="shrink-0 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemove(item.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  )
}

export { TabsTransferPicker }
