import { ethers } from 'ethers';

export class MovieService {
  private static instance: MovieService;
  private constructor() {}

  static getInstance(): MovieService {
    if (!MovieService.instance) {
      MovieService.instance = new MovieService();
    }
    return MovieService.instance;
  }

  async getMovieStream(movieId: string, userAddress: string, subscriptionContract: ethers.Contract): Promise<string> {
    try {
      // Verify subscription
      const isSubscribed = await subscriptionContract.isSubscribed(userAddress);
      if (!isSubscribed) {
        throw new Error("Active subscription required");
      }

      // Get stream URL from m4uhd.onl (implement your licensed content fetching logic here)
      const streamUrl = await this.fetchStreamUrl(movieId);
      return streamUrl;
    } catch (error) {
      console.error("Error getting movie stream:", error);
      throw error;
    }
  }

  private async fetchStreamUrl(movieId: string): Promise<string> {
    // Implement your licensed content fetching logic here
    // This should integrate with your m4uhd.onl license agreement
    const response = await fetch(`/api/movies/${movieId}/stream`, {
      headers: {
        'Authorization': `Bearer ${process.env.CONTENT_API_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch stream URL');
    }

    const data = await response.json();
    return data.streamUrl;
  }
}

export const movieService = MovieService.getInstance();