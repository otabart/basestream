"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Menu, X, Film, Tv, Home, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { WalletConnectButton } from "./wallet-connect-button"
import { useRouter } from "next/navigation"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isScrolled ? "bg-black/90 backdrop-blur-sm" : "bg-gradient-to-b from-black/80 to-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Film className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold hidden sm:inline">BaseStream</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/movies" className="text-sm font-medium hover:text-primary transition-colors">
              Movies
            </Link>
            <Link href="/tv" className="text-sm font-medium hover:text-primary transition-colors">
              TV Shows
            </Link>
            <Link href="/my-list" className="text-sm font-medium hover:text-primary transition-colors">
              My List
            </Link>
          </nav>

          {/* Search and User Actions */}
          <div className="flex items-center gap-4">
            <form onSubmit={handleSearch} className="hidden md:flex relative">
              <Input
                type="search"
                placeholder="Search..."
                className="w-[180px] lg:w-[240px] bg-gray-900/50 border-gray-700 focus:border-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" size="icon" variant="ghost" className="absolute right-0 top-0 h-full">
                <Search className="h-4 w-4" />
              </Button>
            </form>

            <WalletConnectButton />

            {/* Mobile menu button */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="search"
                placeholder="Search..."
                className="w-full bg-gray-900/50 border-gray-700"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" size="icon" variant="ghost" className="absolute right-0 top-0 h-full">
                <Search className="h-4 w-4" />
              </Button>
            </form>

            <nav className="flex flex-col space-y-4">
              <Link
                href="/"
                className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="h-5 w-5" />
                Home
              </Link>
              <Link
                href="/movies"
                className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                <Film className="h-5 w-5" />
                Movies
              </Link>
              <Link
                href="/tv"
                className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                <Tv className="h-5 w-5" />
                TV Shows
              </Link>
              <Link
                href="/my-list"
                className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                <Bookmark className="h-5 w-5" />
                My List
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
