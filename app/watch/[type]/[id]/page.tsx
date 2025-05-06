"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useWeb3 } from "@/components/web3-provider"
import { Navbar } from "@/components/navbar"
import { VideoPlayer } from "@/components/video-player"
import { Button } from "@/components/ui/button"
import { Wallet, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function WatchPage() {
  const { type, id } = useParams()
  const { isConnected, connectWallet, error: walletError } = useWeb3()
  const router = useRouter()
  const [content, setContent] = useState<any>(null)
  const [trailerKey, setTrailerKey] = useState<string | undefined>(undefined)
  const [streamingSource, setStreamingSource] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Redirect if not connected
    if (!isConnected) {
      router.push(`/title/${type}/${id}`)
      return
    }

    // Fetch content details
    const fetchContent = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch movie details
        const res = await fetch(`/api/content/${type}/${id}`)
        if (!res.ok) throw new Error("Failed to fetch content")

        const data = await res.json()
        setContent(data)

        // Find trailer
        if (data.videos && data.videos.results) {
          const trailer = data.videos.results.find(
            (video: any) => (video.type === "Trailer" || video.type === "Teaser") && video.site === "YouTube",
          )
          if (trailer) {
            setTrailerKey(trailer.key)
          }
        }

        // Check for streaming source
        if (type === "movie") {
          try {
            const sourceRes = await fetch(`/api/movie-sources?tmdbId=${id}`)
            const sourceData = await sourceRes.json()

            if (sourceData.found && sourceData.movie) {
              setStreamingSource(sourceData.movie)
            } else {
              // If no exact match, use fallback method
              const fallbackRes = await fetch(`/api/movie-sources`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ id }),
              })
              const fallbackData = await fallbackRes.json()

              if (fallbackData.found && fallbackData.movie) {
                setStreamingSource(fallbackData.movie)
              }
            }
          } catch (err) {
            console.error("Error fetching streaming source:", err)
            // Continue without streaming source - will use fallback
          }
        }
      } catch (error) {
        console.error("Error fetching content:", error)
        setError("Failed to load content. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [type, id, isConnected, router])

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <h1 className="text-2xl font-bold mb-4">Connect Your Wallet to Watch</h1>
          <p className="text-gray-400 mb-6 text-center max-w-md">
            You need to connect your Base wallet to access this content.
          </p>
          <Button className="gap-2" onClick={connectWallet}>
            <Wallet className="h-5 w-5" /> Connect Wallet
          </Button>

          {walletError && (
            <Alert variant="destructive" className="mt-4 max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{walletError}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button className="mt-4" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <VideoPlayer
          title={content?.title || content?.name || "Video"}
          videoId={id as string}
          type={type as string}
          trailerKey={trailerKey}
          streamingSource={streamingSource}
        />

        {/* Content info */}
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-2">{content?.title || content?.name}</h1>
          <p className="text-gray-400 mb-6">{content?.overview}</p>

          {streamingSource ? (
            <div className="p-4 bg-green-900/30 border border-green-800 rounded-md">
              <p className="text-green-300">
                <strong>Now Playing:</strong> {streamingSource.title} ({streamingSource.license} from{" "}
                {streamingSource.source})
              </p>
            </div>
          ) : (
            <div className="p-4 bg-blue-900/30 border border-blue-800 rounded-md">
              <p className="text-blue-300">
                <strong>Note:</strong> Full movies are public domain films from Archive.org for demonstration purposes.
                In a real blockchain streaming platform, these would be premium content accessed through smart
                contracts.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
