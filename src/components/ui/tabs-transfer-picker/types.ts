export interface GenerationDimension {
  id: string
  name: string
  description?: string
}

export interface GenerationElement {
  id: string
  label: string
  description?: string
  dimensionId: string
  icon?: React.ReactNode
}

export interface SelectedElement extends GenerationElement {
  order: number
}

export interface DimensionData {
  dimension: GenerationDimension
  elements: GenerationElement[]
}

export interface TabsTransferPickerProps {
  dimensions: DimensionData[]
  selectedElements: SelectedElement[]
  onAddElement: (element: GenerationElement) => void
  onRemoveElement: (id: string) => void
  onReorderElements: (elements: SelectedElement[]) => void
  searchPlaceholder?: string
  selectedTitle?: string
  emptySelectedText?: string
}
