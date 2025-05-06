import { Hero } from "@/components/hero"
import { ContentRow } from "@/components/content-row"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default async function Home() {
  // Fetch trending movies and TV shows with error handling
  const trendingMovies = await fetchTrendingMovies()
  const trendingTVShows = await fetchTrendingTVShows()
  const popularMovies = await fetchPopularMovies()
  const topRatedMovies = await fetchTopRatedMovies()

  // Featured content is the first trending movie
  const featuredContent = trendingMovies[0]

  return (
    <main className="min-h-screen bg-gradient-to-b from-black to-gray-900">
      <Navbar />
      {featuredContent && <Hero content={featuredContent} />}
      <div className="container mx-auto px-4 pb-20 space-y-12">
        {trendingMovies.length > 0 && <ContentRow title="Trending Now" content={trendingMovies.slice(1)} />}
        {trendingTVShows.length > 0 && <ContentRow title="Popular TV Shows" content={trendingTVShows} />}
        {popularMovies.length > 0 && <ContentRow title="Popular Movies" content={popularMovies} />}
        {topRatedMovies.length > 0 && <ContentRow title="Top Rated" content={topRatedMovies} />}
      </div>
      <Footer />
    </main>
  )
}

// Fetch real data from TMDB API with error handling
async function fetchTrendingMovies() {
  try {
    const res = await fetch(`https://api.themoviedb.org/3/trending/movie/day?api_key=${process.env.TMDB_API_KEY}`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) throw new Error(`Failed to fetch trending movies: ${res.status}`)
    const data = await res.json()
    return data.results || []
  } catch (error) {
    console.error("Error fetching trending movies:", error)
    return []
  }
}

async function fetchTrendingTVShows() {
  try {
    const res = await fetch(`https://api.themoviedb.org/3/trending/tv/day?api_key=${process.env.TMDB_API_KEY}`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) throw new Error(`Failed to fetch trending TV shows: ${res.status}`)
    const data = await res.json()
    return data.results || []
  } catch (error) {
    console.error("Error fetching trending TV shows:", error)
    return []
  }
}

async function fetchPopularMovies() {
  try {
    const res = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${process.env.TMDB_API_KEY}`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) throw new Error(`Failed to fetch popular movies: ${res.status}`)
    const data = await res.json()
    return data.results || []
  } catch (error) {
    console.error("Error fetching popular movies:", error)
    return []
  }
}

async function fetchTopRatedMovies() {
  try {
    const res = await fetch(`https://api.themoviedb.org/3/movie/top_rated?api_key=${process.env.TMDB_API_KEY}`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) throw new Error(`Failed to fetch top rated movies: ${res.status}`)
    const data = await res.json()
    return data.results || []
  } catch (error) {
    console.error("Error fetching top rated movies:", error)
    return []
  }
}
