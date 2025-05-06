"use client"

import { useState } from "react"
import { useWeb3 } from "./web3-provider"
import { Button } from "@/components/ui/button"
import { Wallet, Play, Lock } from "lucide-react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface WatchOptionsProps {
  type: string
  id: string
  streamingAvailable?: boolean
}

export function WatchOptions({ type, id, streamingAvailable = false }: WatchOptionsProps) {
  const { isConnected, connectWallet } = useWeb3()
  const router = useRouter()
  const [selectedOption, setSelectedOption] = useState("stream")

  const handleWatch = () => {
    if (!isConnected) {
      connectWallet()
      return
    }

    router.push(`/watch/${type}/${id}`)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Watch Options</h2>

      <Tabs defaultValue="stream" className="max-w-2xl" onValueChange={setSelectedOption}>
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="stream">Stream</TabsTrigger>
          <TabsTrigger value="rent">Rent</TabsTrigger>
          <TabsTrigger value="buy">Buy</TabsTrigger>
        </TabsList>

        <TabsContent value="stream">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Stream Now
                {streamingAvailable && (
                  <Badge variant="outline" className="bg-green-600/20 text-green-400 border-green-500">
                    Full Movie Available
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Watch instantly with your BaseStream subscription</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">BaseStream Subscription</p>
                  <p className="text-sm text-muted-foreground">Unlimited streaming of all content</p>
                </div>
                <p className="text-xl font-bold">Included</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={isConnected ? handleWatch : connectWallet} className="w-full gap-2">
                {isConnected ? (
                  <>
                    <Play className="h-5 w-5 fill-current" /> Watch Now
                  </>
                ) : (
                  <>
                    <Wallet className="h-5 w-5" /> Connect Wallet to Watch
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="rent">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Rent for 48 Hours
                {streamingAvailable && (
                  <Badge variant="outline" className="bg-green-600/20 text-green-400 border-green-500">
                    Full Movie Available
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Pay once and watch for 48 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">48-Hour Rental</p>
                  <p className="text-sm text-muted-foreground">HD quality streaming</p>
                </div>
                <p className="text-xl font-bold">0.001 ETH</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={isConnected ? handleWatch : connectWallet} className="w-full gap-2">
                {isConnected ? (
                  <>
                    <Play className="h-5 w-5 fill-current" /> Rent Now
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5" /> Connect Wallet to Rent
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="buy">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Buy and Own
                {streamingAvailable && (
                  <Badge variant="outline" className="bg-green-600/20 text-green-400 border-green-500">
                    Full Movie Available
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Purchase as an NFT and own it forever</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Permanent Ownership</p>
                  <p className="text-sm text-muted-foreground">4K quality + special features</p>
                </div>
                <p className="text-xl font-bold">0.01 ETH</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={isConnected ? handleWatch : connectWallet} className="w-full gap-2">
                {isConnected ? (
                  <>
                    <Play className="h-5 w-5 fill-current" /> Buy Now
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5" /> Connect Wallet to Buy
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
