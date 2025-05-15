import { Skeleton } from "@/components/ui/skeleton"

export default function EventsLoading() {
  return (
    <div className="min-h-screen bg-tct-navy/95 text-white">
      <header className="bg-tct-navy text-white p-4">
        <div className="container mx-auto">
          <Skeleton className="h-10 w-64 bg-gray-700" />
          <Skeleton className="h-5 w-96 mt-2 bg-gray-700" />
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="bg-tct-navy/80 border border-tct-cyan/20 rounded-lg overflow-hidden shadow-lg">
                <Skeleton className="h-48 w-full bg-gray-700" />
                <div className="p-5">
                  <Skeleton className="h-7 w-3/4 mb-4 bg-gray-700" />
                  <div className="space-y-2 mb-4">
                    <Skeleton className="h-4 w-full bg-gray-700" />
                    <Skeleton className="h-4 w-full bg-gray-700" />
                    <Skeleton className="h-4 w-full bg-gray-700" />
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <Skeleton className="h-4 w-20 bg-gray-700" />
                      <Skeleton className="h-6 w-16 mt-1 bg-gray-700" />
                    </div>
                    <Skeleton className="h-10 w-32 bg-gray-700" />
                  </div>
                </div>
              </div>
            ))}
        </div>
      </main>
    </div>
  )
}
