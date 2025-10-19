export interface ToastProps {
  title: string
  description?: string
  variant?: 'default' | 'destructive'
  duration?: number
}

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export interface LoadingState {
  isLoading: boolean
  error?: string | null
  data?: any
}

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  itemsPerPage?: number
}

export interface FilterProps {
  category?: string
  priceRange?: { min: number; max: number }
  rating?: number
  location?: string
  tags?: string[]
}

export interface SortOption {
  value: string
  label: string
  field: string
  direction: 'asc' | 'desc'
}

export interface AnimationProps {
  delay?: number
  duration?: number
  ease?: string
  children: React.ReactNode
}

export interface FestivalBannerData {
  name: string
  date: string
  color: string
  icon: string
  message: string
  discount?: string
}

export interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  products?: any[]
  timestamp: number
}

export interface ConfettiConfig {
  colors: string[]
  particleCount: number
  spread: number
  origin: { x: number; y: number }
}
