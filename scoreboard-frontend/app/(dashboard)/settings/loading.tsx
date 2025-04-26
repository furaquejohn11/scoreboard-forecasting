import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Skeleton className="h-10 w-1/4 mb-6" />

        <Skeleton className="h-10 w-full mb-8" />

        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>
    </div>
  )
}
