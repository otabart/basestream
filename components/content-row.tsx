"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ContentRowProps {
  title: string
  content: any[]
}

export function ContentRow({ title, content }: ContentRowProps) {
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)
  const rowRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth, scrollWidth } = rowRef.current
      const scrollTo = direction === "left" ? scrollLeft - clientWidth * 0.75 : scrollLeft + clientWidth * 0.75

      rowRef.current.scrollTo({
        left: scrollTo,
        behavior: "smooth",
      })

      // Check if we need to show/hide arrows after scrolling
      setTimeout(() => {
        if (rowRef.current) {
          setShowLeftArrow(rowRef.current.scrollLeft > 0)
          setShowRightArrow(rowRef.current.scrollLeft + rowRef.current.clientWidth < rowRef.current.scrollWidth - 10)
        }
      }, 400)
    }
  }

  const handleScroll = () => {
    if (rowRef.current) {
      setShowLeftArrow(rowRef.current.scrollLeft > 0)
      setShowRightArrow(rowRef.current.scrollLeft + rowRef.current.clientWidth < rowRef.current.scrollWidth - 10)
    }
  }

  return (
    <div className="relative">
      <h2 className="text-xl md:text-2xl font-bold mb-4">{title}</h2>

      <div className="group relative">
        {/* Left Arrow */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
            !showLeftArrow && "hidden",
          )}
          onClick={() => scroll("left")}
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>

        {/* Content Row */}
        <div ref={rowRef} className="flex gap-2 overflow-x-auto scrollbar-hide pb-4 pt-1 pl-1" onScroll={handleScroll}>
          {content.map((item) => {
            const title = item.title || item.name || ""
            const mediaType = item.media_type || (item.first_air_date ? "tv" : "movie")

            return (
              <Link
                key={item.id}
                href={`/title/${mediaType}/${item.id}`}
                className="flex-none w-[160px] sm:w-[200px] transition-transform duration-300 hover:scale-105"
              >
                <div className="relative aspect-[2/3] rounded-md overflow-hidden">
                  <Image
                    src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                    alt={title}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="mt-2 text-sm truncate">{title}</h3>
              </Link>
            )
          })}
        </div>

        {/* Right Arrow */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
            !showRightArrow && "hidden",
          )}
          onClick={() => scroll("right")}
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      </div>
    </div>
  )
}
