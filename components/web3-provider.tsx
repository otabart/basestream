"use client"

import { createContext, useContext, useState, useEffect } from "react"
import type { ReactNode } from "react"

// Define the Web3Context type
type Web3ContextType = {
  address: string | null
  isConnected: boolean
  chainId: string | null
  balance: string | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  isConnecting: boolean
  error: string | null
}

// Create the context with default values
const Web3Context = createContext<Web3ContextType>({
  address: null,
  isConnected: false,
  chainId: null,
  balance: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  isConnecting: false,
  error: null,
})

// Hook to use the Web3 context
export const useWeb3 = () => useContext(Web3Context)

// Base chain ID (mainnet)
const BASE_CHAIN_ID = "0x2105"

export function Web3Provider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [chainId, setChainId] = useState<string | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if ethereum is available
  const isEthereumAvailable = () => {
    return typeof window !== "undefined" && window.ethereum !== undefined
  }

  // Format balance for display
  const formatBalance = (balance: string) => {
    const balanceInEth = Number.parseInt(balance, 16) / 1e18
    return balanceInEth.toFixed(4)
  }

  // Connect wallet
  const connectWallet = async () => {
    if (!isEthereumAvailable()) {
      setError("No wallet detected. Please install a Web3 wallet like MetaMask.")
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      // Request accounts
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })

      if (accounts.length > 0) {
        setAddress(accounts[0])
        setIsConnected(true)

        // Get chain ID
        const chainId = await window.ethereum.request({ method: "eth_chainId" })
        setChainId(chainId)

        // Get balance
        const balance = await window.ethereum.request({
          method: "eth_getBalance",
          params: [accounts[0], "latest"],
        })
        setBalance(formatBalance(balance))

        // Switch to Base if not on it
        if (chainId !== BASE_CHAIN_ID) {
          try {
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: BASE_CHAIN_ID }],
            })
          } catch (switchError: any) {
            // This error code indicates that the chain has not been added to MetaMask
            if (switchError.code === 4902) {
              try {
                await window.ethereum.request({
                  method: "wallet_addEthereumChain",
                  params: [
                    {
                      chainId: BASE_CHAIN_ID,
                      chainName: "Base",
                      nativeCurrency: {
                        name: "Ethereum",
                        symbol: "ETH",
                        decimals: 18,
                      },
                      rpcUrls: ["https://mainnet.base.org"],
                      blockExplorerUrls: ["https://basescan.org"],
                    },
                  ],
                })
              } catch (addError) {
                setError("Failed to add Base network to your wallet.")
              }
            } else {
              setError("Failed to switch to Base network.")
            }
          }
        }
      }
    } catch (error: any) {
      setError(error.message || "Failed to connect wallet")
    } finally {
      setIsConnecting(false)
    }
  }

  // Disconnect wallet
  const disconnectWallet = () => {
    setAddress(null)
    setIsConnected(false)
    setChainId(null)
    setBalance(null)

    // Clear from localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("walletConnected")
    }
  }

  // Set up event listeners
  useEffect(() => {
    if (!isEthereumAvailable()) return

    // Handle account changes
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected their wallet
        disconnectWallet()
      } else if (accounts[0] !== address) {
        setAddress(accounts[0])
        // Update balance for new account
        window.ethereum
          .request({
            method: "eth_getBalance",
            params: [accounts[0], "latest"],
          })
          .then((newBalance: string) => {
            setBalance(formatBalance(newBalance))
          })
      }
    }

    // Handle chain changes
    const handleChainChanged = (newChainId: string) => {
      setChainId(newChainId)
      // Reload the page on chain change as recommended by MetaMask
      window.location.reload()
    }

    // Subscribe to events
    window.ethereum.on("accountsChanged", handleAccountsChanged)
    window.ethereum.on("chainChanged", handleChainChanged)

    // Check if already connected
    window.ethereum
      .request({ method: "eth_accounts" })
      .then(handleAccountsChanged)
      .catch((err: any) => {
        console.error("Error checking connected accounts:", err)
      })

    // Cleanup
    return () => {
      if (isEthereumAvailable()) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum.removeListener("chainChanged", handleChainChanged)
      }
    }
  }, [address])

  // Save connection state
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (isConnected) {
        localStorage.setItem("walletConnected", "true")
      }
    }
  }, [isConnected])

  // Check for saved connection on mount
  useEffect(() => {
    const checkSavedConnection = async () => {
      if (typeof window !== "undefined") {
        const savedConnection = localStorage.getItem("walletConnected")
        if (savedConnection === "true" && isEthereumAvailable()) {
          try {
            const accounts = await window.ethereum.request({ method: "eth_accounts" })
            if (accounts.length > 0) {
              connectWallet()
            }
          } catch (error) {
            console.error("Error checking saved connection:", error)
          }
        }
      }
    }

    checkSavedConnection()
  }, [])

  const value = {
    address,
    isConnected,
    chainId,
    balance,
    connectWallet,
    disconnectWallet,
    isConnecting,
    error,
  }

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}

// Add TypeScript interface for window.ethereum
declare global {
  interface Window {
    ethereum: any
  }
}
