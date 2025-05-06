import { MovieCard } from "@/components/movie-card"

interface SearchResultsProps {
  query: string
}

export async function SearchResults({ query }: SearchResultsProps) {
  const results = await searchMovies(query)

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No results found for "{query}"</p>
        <p className="text-gray-500 mt-2">Try a different search term</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {results.map((item) => (
        <MovieCard
          key={item.id}
          id={item.id}
          title={item.title || item.name || ""}
          posterPath={item.poster_path}
          type={item.media_type || (item.first_air_date ? "tv" : "movie")}
          hasStreamingSource={item.hasStreamingSource}
        />
      ))}
    </div>
  )
}

async function searchMovies(query: string) {
  try {
    // Search TMDB
    const res = await fetch(
      `https://api.themoviedb.org/3/search/multi?api_key=${process.env.TMDB_API_KEY}&query=${encodeURIComponent(
        query,
      )}&include_adult=false`,
      { next: { revalidate: 3600 } },
    )

    if (!res.ok) throw new Error(`Failed to fetch search results: ${res.status}`)

    const data = await res.json()
    const results = data.results || []

    // Filter out people and other non-movie/tv content
    const filteredResults = results.filter((item: any) => item.media_type === "movie" || item.media_type === "tv")

    // Check which movies have streaming sources
    const resultsWithSourceInfo = await Promise.all(
      filteredResults.map(async (item: any) => {
        if (item.media_type === "movie") {
          try {
            const sourceRes = await fetch(
              `/api/movie-sources?title=${encodeURIComponent(item.title)}&year=${
                item.release_date ? new Date(item.release_date).getFullYear() : ""
              }&tmdbId=${item.id}`,
            )
            const sourceData = await sourceRes.json()
            return { ...item, hasStreamingSource: sourceData.found }
          } catch (error) {
            return { ...item, hasStreamingSource: false }
          }
        }
        return { ...item, hasStreamingSource: false }
      }),
    )

    return resultsWithSourceInfo
  } catch (error) {
    console.error("Error searching movies:", error)
    return []
  }
}
