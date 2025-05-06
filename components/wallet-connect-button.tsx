"use client"

import { useWeb3 } from "./web3-provider"
import { Button } from "@/components/ui/button"
import { Wallet, LogOut, AlertCircle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function WalletConnectButton() {
  const { address, isConnected, balance, connectWallet, disconnectWallet, isConnecting, error } = useWeb3()

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!isConnected) {
    return (
      <Button onClick={connectWallet} disabled={isConnecting} className="gap-2">
        <Wallet className="h-4 w-4" />
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Wallet className="h-4 w-4" />
          {address?.substring(0, 6)}...{address?.substring(address.length - 4)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Wallet</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex justify-between">
          <span>Address:</span>
          <span className="font-mono text-xs">
            {address?.substring(0, 6)}...{address?.substring(address.length - 4)}
          </span>
        </DropdownMenuItem>
        {balance && (
          <DropdownMenuItem className="flex justify-between">
            <span>Balance:</span>
            <span>{balance} ETH</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={disconnectWallet} className="text-red-500 gap-2">
          <LogOut className="h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
