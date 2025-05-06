import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { type: string; id: string } }) {
  try {
    const { type, id } = params

    // Fetch content details from TMDB API with videos
    const res = await fetch(
      `https://api.themoviedb.org/3/${type}/${id}?api_key=${process.env.TMDB_API_KEY}&append_to_response=videos`,
      { next: { revalidate: 3600 } },
    )

    if (!res.ok) {
      throw new Error(`Failed to fetch content: ${res.status}`)
    }

    const data = await res.json()

    // In a real app, you would verify blockchain ownership/access rights here
    // For example, check if the user has the required NFT or subscription token

    return NextResponse.json(data)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 })
  }
}
