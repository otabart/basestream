import { Suspense } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { SearchResults } from "@/components/search-results"
import { Skeleton } from "@/components/ui/skeleton"

interface SearchPageProps {
  searchParams: { q: string }
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || ""

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-24">
        <h1 className="text-3xl font-bold mb-8">Search Results for "{query}"</h1>

        <Suspense
          fallback={
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-[2/3] rounded-md" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          }
        >
          <SearchResults query={query} />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
