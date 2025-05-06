"use client"
import Image from "next/image"
import { Play, Plus, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useWeb3 } from "./web3-provider"

interface FeaturedContentProps {
  content: {
    id: number
    title?: string
    name?: string
    backdrop_path: string
    overview: string
    media_type?: string
  }
}

export function FeaturedContent({ content }: FeaturedContentProps) {
  const { isConnected, connectWallet } = useWeb3()
  const router = useRouter()

  const title = content.title || content.name || ""
  const mediaType = content.media_type || "movie"

  const handlePlay = () => {
    if (!isConnected) {
      // Show connect wallet prompt
      connectWallet()
      return
    }

    router.push(`/watch/${mediaType}/${content.id}`)
  }

  return (
    <div className="relative w-full h-[50vh] min-h-[400px] overflow-hidden">
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
      <div className="relative h-full container mx-auto px-4 flex flex-col justify-center">
        <div className="max-w-2xl space-y-4">
          <h1 className="text-3xl md:text-5xl font-bold">{title}</h1>

          <p className="text-gray-300 line-clamp-3 text-sm md:text-base">{content.overview}</p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button onClick={handlePlay} className="gap-2">
              <Play className="h-5 w-5 fill-current" /> {isConnected ? "Watch Now" : "Connect & Watch"}
            </Button>
            <Button variant="outline" className="gap-2">
              <Plus className="h-5 w-5" /> My List
            </Button>
            <Button variant="outline" size="icon">
              <Info className="h-5 w-5" />
            </Button>
          </div>

          {isConnected && (
            <p className="text-sm text-green-400">Full movies and trailers available with your connected wallet!</p>
          )}
        </div>
      </div>
    </div>
  )
}
