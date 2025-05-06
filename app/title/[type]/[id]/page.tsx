import type { Metadata } from "next"
import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Plus, Share2, Star } from "lucide-react"
import { ContentRow } from "@/components/content-row"
import { WatchOptions } from "@/components/watch-options"

interface TitlePageProps {
  params: {
    type: string
    id: string
  }
}

export async function generateMetadata({ params }: TitlePageProps): Promise<Metadata> {
  try {
    const content = await fetchContentDetails(params.type, params.id)
    const title = content.title || content.name || "Content Details"

    return {
      title: `${title} | BaseStream`,
      description: content.overview,
    }
  } catch (error) {
    return {
      title: "Content Details | BaseStream",
      description: "Explore movies and TV shows on BaseStream",
    }
  }
}

export default async function TitlePage({ params }: TitlePageProps) {
  let content,
    similar,
    credits,
    streamingAvailable = false

  try {
    content = await fetchContentDetails(params.type, params.id)
    similar = await fetchSimilarContent(params.type, params.id)
    credits = await fetchCredits(params.type, params.id)

    // Check if streaming is available for this title
    if (params.type === "movie") {
      streamingAvailable = await checkStreamingAvailability(content.title, content.release_date, params.id)
    }
  } catch (error) {
    // Fallback data if API fails
    content = {
      id: params.id,
      title: "Sample Content",
      name: "Sample Content",
      backdrop_path: "/placeholder.jpg",
      poster_path: "/placeholder.jpg",
      overview: "This content is currently unavailable. Please try again later.",
      vote_average: 0,
      genres: [],
      release_date: "",
      first_air_date: "",
    }
    similar = []
    credits = { cast: [] }
  }

  const title = content.title || content.name || ""
  const releaseDate = content.release_date || content.first_air_date || ""
  const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : ""

  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section */}
        <div className="relative w-full h-[70vh] min-h-[500px] overflow-hidden">
          {/* Background image */}
          <div className="absolute inset-0">
            <Image
              src={
                content.backdrop_path?.startsWith("/placeholder")
                  ? "/placeholder.svg?height=1080&width=1920"
                  : `https://image.tmdb.org/t/p/original${content.backdrop_path}`
              }
              alt={title}
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative h-full container mx-auto px-4 flex items-end pb-16">
            <div className="grid md:grid-cols-[250px_1fr] gap-8 items-end">
              <div className="hidden md:block relative aspect-[2/3] rounded-md overflow-hidden">
                <Image
                  src={
                    content.poster_path?.startsWith("/placeholder")
                      ? "/placeholder.svg?height=750&width=500"
                      : `https://image.tmdb.org/t/p/w500${content.poster_path}`
                  }
                  alt={title}
                  fill
                  className="object-cover"
                />

                {streamingAvailable && (
                  <Badge className="absolute top-2 right-2 bg-green-600 hover:bg-green-700">Full Movie Available</Badge>
                )}
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold">{title}</h1>

                <div className="flex flex-wrap items-center gap-3 text-sm">
                  {releaseYear && <span>{releaseYear}</span>}
                  {content.runtime && (
                    <span>
                      {Math.floor(content.runtime / 60)}h {content.runtime % 60}m
                    </span>
                  )}
                  {content.number_of_seasons && (
                    <span>
                      {content.number_of_seasons} Season{content.number_of_seasons > 1 ? "s" : ""}
                    </span>
                  )}
                  {content.genres?.map((genre: any) => (
                    <Badge key={genre.id} variant="outline">
                      {genre.name}
                    </Badge>
                  ))}

                  {streamingAvailable && (
                    <Badge variant="outline" className="bg-green-600/20 text-green-400 border-green-500">
                      Full Movie Available
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-yellow-500 text-yellow-500 flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-500" />
                    {content.vote_average?.toFixed(1)}
                  </Badge>
                  <span className="text-sm text-gray-400">{content.vote_count} votes</span>
                </div>

                <p className="text-gray-300 max-w-3xl">{content.overview}</p>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Button size="lg" className="gap-2">
                    <Play className="h-5 w-5 fill-current" /> Play
                  </Button>
                  <Button variant="outline" size="lg" className="gap-2">
                    <Plus className="h-5 w-5" /> My List
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Details */}
        <div className="container mx-auto px-4 py-12 space-y-12">
          {/* Watch Options */}
          <WatchOptions type={params.type} id={params.id} streamingAvailable={streamingAvailable} />

          {/* Cast */}
          {credits.cast?.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Cast</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {credits.cast.slice(0, 6).map((person: any) => (
                  <div key={person.id} className="text-center">
                    <div className="relative aspect-square rounded-full overflow-hidden mb-2 mx-auto w-24">
                      <Image
                        src={
                          person.profile_path
                            ? `https://image.tmdb.org/t/p/w200${person.profile_path}`
                            : "/placeholder.svg?height=200&width=200"
                        }
                        alt={person.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <h3 className="font-medium text-sm">{person.name}</h3>
                    <p className="text-xs text-gray-400">{person.character}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Similar Content */}
          {similar.length > 0 && <ContentRow title="More Like This" content={similar} />}
        </div>
      </main>
      <Footer />
    </>
  )
}

async function fetchContentDetails(type: string, id: string) {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/${type}/${id}?api_key=${process.env.TMDB_API_KEY}&append_to_response=videos`,
      { next: { revalidate: 3600 } },
    )
    if (!res.ok) throw new Error(`Failed to fetch content details: ${res.status}`)
    return res.json()
  } catch (error) {
    console.error("Error fetching content details:", error)
    throw error
  }
}

async function fetchSimilarContent(type: string, id: string) {
  try {
    const res = await fetch(`https://api.themoviedb.org/3/${type}/${id}/similar?api_key=${process.env.TMDB_API_KEY}`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) throw new Error(`Failed to fetch similar content: ${res.status}`)
    const data = await res.json()
    return data.results || []
  } catch (error) {
    console.error("Error fetching similar content:", error)
    return []
  }
}

async function fetchCredits(type: string, id: string) {
  try {
    const res = await fetch(`https://api.themoviedb.org/3/${type}/${id}/credits?api_key=${process.env.TMDB_API_KEY}`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) throw new Error(`Failed to fetch credits: ${res.status}`)
    return res.json()
  } catch (error) {
    console.error("Error fetching credits:", error)
    return { cast: [] }
  }
}

async function checkStreamingAvailability(title: string, releaseDate: string, id: string) {
  try {
    if (!title) return false

    const year = releaseDate ? new Date(releaseDate).getFullYear() : undefined

    const res = await fetch(`/api/movie-sources?title=${encodeURIComponent(title)}&year=${year}&tmdbId=${id}`, {
      next: { revalidate: 3600 },
    })

    if (!res.ok) return false

    const data = await res.json()
    return data.found
  } catch (error) {
    console.error("Error checking streaming availability:", error)
    return false
  }
}
