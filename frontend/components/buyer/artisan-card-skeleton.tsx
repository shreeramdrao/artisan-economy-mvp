import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function ArtisanCardSkeleton() {
  return (
    <Card className="p-6 hover:shadow-2xl hover:shadow-amber-200/50 transition-all duration-500 flex flex-col items-center text-center bg-white/90 backdrop-blur-sm border-0 rounded-2xl">
      {/* Avatar skeleton */}
      <div className="relative mb-4">
        <Skeleton className="w-28 h-28 rounded-full" />
        <div className="absolute -bottom-2 -right-2">
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>
      </div>

      {/* Info skeleton */}
      <div className="space-y-2 mb-6 w-full">
        <Skeleton className="h-6 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-1/2 mx-auto" />
        <Skeleton className="h-3 w-2/3 mx-auto" />
        <Skeleton className="h-3 w-1/3 mx-auto" />
      </div>

      {/* Button skeleton */}
      <Skeleton className="w-full h-10 rounded-lg" />
    </Card>
  )
}
