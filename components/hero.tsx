"use client"

import { useState } from "react"
import Image from "next/image"
import { Play, Plus, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useWeb3 } from "./web3-provider"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface HeroProps {
  content: {
    id: number
    title?: string
    name?: string
    backdrop_path: string
    poster_path: string
    overview: string
    vote_average: number
    release_date?: string
    first_air_date?: string
    media_type?: string
  }
}

export function Hero({ content }: HeroProps) {
  const [showDetails, setShowDetails] = useState(false)
  const { isConnected, connectWallet } = useWeb3()
  const router = useRouter()

  const title = content.title || content.name || ""
  const releaseDate = content.release_date || content.first_air_date || ""
  const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : ""
  const mediaType = content.media_type || (content.first_air_date ? "tv" : "movie")

  const handlePlay = () => {
    if (!isConnected) {
      connectWallet()
      return
    }

    router.push(`/watch/${mediaType}/${content.id}`)
  }

  return (
    <div className="relative w-full h-[80vh] min-h-[500px] overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src={`https://image.tmdb.org/t/p/original${content.backdrop_path}`}
          alt={title}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full container mx-auto px-4 flex flex-col justify-end pb-20">
        <div className="max-w-2xl space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold">{title}</h1>

          <div className="flex items-center gap-3 text-sm">
            <Badge variant="outline" className="border-green-500 text-green-500">
              {Math.round(content.vote_average * 10)}% Match
            </Badge>
            {releaseYear && <span>{releaseYear}</span>}
            <Badge variant="outline">{mediaType === "tv" ? "Series" : "Movie"}</Badge>
          </div>

          <p className="text-gray-300 line-clamp-3 md:line-clamp-2 text-sm md:text-base">{content.overview}</p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button onClick={handlePlay} size="lg" className="gap-2">
              {isConnected ? (
                <>
                  <Play className="h-5 w-5 fill-current" /> Play
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 fill-current" /> Connect & Play
                </>
              )}
            </Button>
            <Button variant="outline" size="lg" className="gap-2">
              <Plus className="h-5 w-5" /> My List
            </Button>
            <Button variant="outline" size="icon" onClick={() => setShowDetails(true)}>
              <Info className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-3xl bg-gray-900 text-white border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-2xl">{title}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {releaseYear} • {mediaType === "tv" ? "TV Series" : "Movie"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid md:grid-cols-[2fr_1fr] gap-6">
            <div>
              <p className="text-gray-300">{content.overview}</p>
              <div className="mt-6 flex items-center gap-3">
                <Button onClick={handlePlay} className="gap-2">
                  {isConnected ? (
                    <>
                      <Play className="h-5 w-5 fill-current" /> Play
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 fill-current" /> Connect & Play
                    </>
                  )}
                </Button>
                <Button variant="outline" className="gap-2">
                  <Plus className="h-5 w-5" /> My List
                </Button>
              </div>
            </div>

            <div className="relative aspect-[2/3] rounded-md overflow-hidden">
              <Image
                src={`https://image.tmdb.org/t/p/w500${content.poster_path}`}
                alt={title}
                fill
                className="object-cover"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
