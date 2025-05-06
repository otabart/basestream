import { NextResponse } from "next/server"

// List of public domain and free movie sources
// This is a simplified version - in a real app, you would use a more comprehensive database
const PUBLIC_DOMAIN_SOURCES = [
  {
    title: "Night of the Living Dead (1968)",
    year: 1968,
    tmdbId: 10331,
    url: "https://ia800707.us.archive.org/5/items/Night_of_the_Living_Dead_1968_720p/Night_of_the_Living_Dead_1968_720p.mp4",
    source: "archive.org",
    license: "Public Domain",
  },
  {
    title: "The Little Shop of Horrors (1960)",
    year: 1960,
    tmdbId: 32589,
    url: "https://ia801603.us.archive.org/13/items/TheLittleShopOfHorrors1960/The_Little_Shop_of_Horrors_1960.mp4",
    source: "archive.org",
    license: "Public Domain",
  },
  {
    title: "Charade (1963)",
    year: 1963,
    tmdbId: 4808,
    url: "https://ia800103.us.archive.org/27/items/Charade1963/Charade1963_512kb.mp4",
    source: "archive.org",
    license: "Public Domain",
  },
  {
    title: "Plan 9 from Outer Space (1959)",
    year: 1959,
    tmdbId: 4424,
    url: "https://ia800300.us.archive.org/1/items/Plan9FromOuterSpace1959/Plan9FromOuterSpace1959.mp4",
    source: "archive.org",
    license: "Public Domain",
  },
  {
    title: "The Phantom of the Opera (1925)",
    year: 1925,
    tmdbId: 11377,
    url: "https://ia800204.us.archive.org/4/items/ThePhantomoftheOpera/Phantom_of_the_Opera_512kb.mp4",
    source: "archive.org",
    license: "Public Domain",
  },
  {
    title: "Nosferatu (1922)",
    year: 1922,
    tmdbId: 653,
    url: "https://ia800701.us.archive.org/12/items/Nosferatu_201407/Nosferatu.mp4",
    source: "archive.org",
    license: "Public Domain",
  },
  {
    title: "The General (1926)",
    year: 1926,
    tmdbId: 961,
    url: "https://ia800205.us.archive.org/29/items/TheGeneral_798/TheGeneral.mp4",
    source: "archive.org",
    license: "Public Domain",
  },
  {
    title: "The Cabinet of Dr. Caligari (1920)",
    year: 1920,
    tmdbId: 234,
    url: "https://ia800302.us.archive.org/13/items/DasKabinettdesDoktorCaligariTheCabinetofDrCaligari/The_Cabinet_of_Dr_Caligari_512kb.mp4",
    source: "archive.org",
    license: "Public Domain",
  },
  {
    title: "Metropolis (1927)",
    year: 1927,
    tmdbId: 19,
    url: "https://ia800303.us.archive.org/16/items/MetropolisFritzLang1927EnglishSubtitles/Metropolis%20-%20Fritz%20Lang%20-%201927%20-%20English%20subtitles.mp4",
    source: "archive.org",
    license: "Public Domain",
  },
  {
    title: "The Kid (1921)",
    year: 1921,
    tmdbId: 10098,
    url: "https://ia800302.us.archive.org/32/items/CC_1921_01_21_TheKid/CC_1921_01_21_TheKid_512kb.mp4",
    source: "archive.org",
    license: "Public Domain",
  },
]

// Function to search for movie by title and year
function findMovieSource(title: string, year?: number, tmdbId?: number) {
  // First try to match by TMDB ID if available
  if (tmdbId) {
    const exactMatch = PUBLIC_DOMAIN_SOURCES.find((movie) => movie.tmdbId === tmdbId)
    if (exactMatch) return exactMatch
  }

  // Then try to match by title and year
  const titleLower = title.toLowerCase()

  // Try exact match with year
  if (year) {
    const exactMatch = PUBLIC_DOMAIN_SOURCES.find(
      (movie) => movie.title.toLowerCase().includes(titleLower) && movie.year === year,
    )
    if (exactMatch) return exactMatch
  }

  // Try partial match with title
  const partialMatch = PUBLIC_DOMAIN_SOURCES.find(
    (movie) => movie.title.toLowerCase().includes(titleLower) || titleLower.includes(movie.title.toLowerCase()),
  )

  return partialMatch
}

// Function to search for similar movies if exact match not found
function findSimilarMovies(title: string) {
  const titleWords = title.toLowerCase().split(" ")

  // Find movies that match at least one word in the title
  return PUBLIC_DOMAIN_SOURCES.filter((movie) => {
    const movieTitleLower = movie.title.toLowerCase()
    return titleWords.some((word) => word.length > 3 && movieTitleLower.includes(word))
  }).slice(0, 5) // Return up to 5 similar movies
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get("title")
  const year = searchParams.get("year") ? Number.parseInt(searchParams.get("year")!) : undefined
  const tmdbId = searchParams.get("tmdbId") ? Number.parseInt(searchParams.get("tmdbId")!) : undefined

  if (!title) {
    return NextResponse.json({ error: "Title parameter is required" }, { status: 400 })
  }

  // Search for exact match
  const exactMatch = findMovieSource(title, year, tmdbId)

  if (exactMatch) {
    return NextResponse.json({
      found: true,
      movie: exactMatch,
      similar: [],
    })
  }

  // If no exact match, find similar movies
  const similarMovies = findSimilarMovies(title)

  return NextResponse.json({
    found: false,
    movie: null,
    similar: similarMovies,
  })
}

// For demonstration, also add a fallback movie finder by ID
export async function POST(request: Request) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "ID parameter is required" }, { status: 400 })
    }

    // For demonstration purposes, we'll return a movie based on the ID
    // In a real app, you would query a database or external API
    const movieIndex = id % PUBLIC_DOMAIN_SOURCES.length
    const movie = PUBLIC_DOMAIN_SOURCES[movieIndex]

    return NextResponse.json({
      found: true,
      movie,
      similar: [],
    })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
