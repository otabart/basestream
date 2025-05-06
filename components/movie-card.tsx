import Image from "next/image"
import Link from "next/link"
import { Play } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface MovieCardProps {
  id: number
  title: string
  posterPath: string | null
  type: string
  hasStreamingSource?: boolean
}

export function MovieCard({ id, title, posterPath, type, hasStreamingSource }: MovieCardProps) {
  return (
    <Link
      href={`/title/${type}/${id}`}
      className="group flex flex-col transition-transform duration-300 hover:scale-105"
    >
      <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-gray-900">
        {posterPath ? (
          <Image src={`https://image.tmdb.org/t/p/w500${posterPath}`} alt={title} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <span className="text-gray-400">{title.substring(0, 1)}</span>
          </div>
        )}

        {hasStreamingSource && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60">
            <div className="rounded-full bg-primary p-3">
              <Play className="h-6 w-6 fill-white text-white" />
            </div>
          </div>
        )}

        {hasStreamingSource && (
          <Badge className="absolute top-2 right-2 bg-green-600 hover:bg-green-700">Full Movie</Badge>
        )}
      </div>
      <h3 className="mt-2 text-sm font-medium truncate">{title}</h3>
      <p className="text-xs text-gray-400 capitalize">{type}</p>
    </Link>
  )
}
