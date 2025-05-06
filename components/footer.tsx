import Link from "next/link"
import { Film, Twitter, Instagram, Facebook, Github } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-black/80 border-t border-gray-800 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Film className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">BaseStream</span>
            </Link>
            <p className="text-gray-400 text-sm">
              The first decentralized streaming platform built on Base blockchain.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-gray-400 hover:text-primary">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-primary">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-primary">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-primary">
                <Github className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/" className="hover:text-primary">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/movies" className="hover:text-primary">
                  Movies
                </Link>
              </li>
              <li>
                <Link href="/tv" className="hover:text-primary">
                  TV Shows
                </Link>
              </li>
              <li>
                <Link href="/my-list" className="hover:text-primary">
                  My List
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/terms" className="hover:text-primary">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/copyright" className="hover:text-primary">
                  Copyright
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-primary">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/help" className="hover:text-primary">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-primary">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-primary">
                  Account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-800 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} BaseStream. All rights reserved.</p>
          <p className="mt-2">Powered by Base blockchain.</p>
        </div>
      </div>
    </footer>
  )
}
