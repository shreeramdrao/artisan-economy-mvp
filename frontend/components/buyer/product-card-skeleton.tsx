import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function ProductCardSkeleton() {
  return (
    <Card className="h-full flex flex-col overflow-hidden border-0 rounded-2xl shadow-lg bg-white/90 backdrop-blur-sm">
      {/* Image Container */}
      <div className="aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 relative">
        <Skeleton className="w-full h-full" />
        
        {/* Heart button skeleton */}
        <div className="absolute top-3 right-3">
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>
        
        {/* Badge skeleton */}
        <div className="absolute top-3 left-3">
          <Skeleton className="w-20 h-6 rounded-full" />
        </div>
      </div>

      {/* Content Container */}
      <div className="p-5 flex flex-col justify-between flex-1 min-h-[160px]">
        {/* Title skeleton */}
        <div className="space-y-3 mb-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>

        {/* Seller info skeleton */}
        <div className="mb-4">
          <Skeleton className="h-4 w-2/3 mb-1" />
          <Skeleton className="h-3 w-1/3" />
        </div>

        {/* Bottom Section - Rating and Price */}
        <div className="flex items-center justify-between min-h-[2rem]">
          <div className="flex items-center space-x-1">
            <Skeleton className="w-16 h-4" />
            <Skeleton className="w-8 h-4" />
          </div>
          <Skeleton className="w-20 h-6" />
        </div>
      </div>
    </Card>
  )
}
