"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import SlotCard from "./slot-card"
import { Button } from "@/components/ui/button"
import { fetchSlotMachineData } from "@/lib/api"
import type { SlotMachineData } from "@/types/slot-machine"

export default function SlotMachine() {
  const [spinning, setSpinning] = useState(false)
  const [stopping, setStopping] = useState(false)
  const [stoppedCards, setStoppedCards] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<SlotMachineData>({
    items: [],
    finalResult: [],
  })

  const { toast } = useToast()

  useEffect(() => {
    loadSlotMachineData()
  }, [])

  async function loadSlotMachineData() {
    try {
      setLoading(true)
      const response = await fetchSlotMachineData()
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to load slot machine data")
      }
      setData(response.data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load slot machine data",
      })
    } finally {
      setLoading(false)
    }
  }

  const spin = () => {
    if (data.items.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No slot machine data available",
      })
      return
    }
    setSpinning(true)
    setStopping(false)
    setStoppedCards(0)
  }

  const stop = () => {
    if (spinning) {
      setStopping(true)
    }
  }

  useEffect(() => {
    if (stopping) {
      const stopCard = (index: number) => {
        setTimeout(
          () => {
            setStoppedCards(index + 1)
            if (index === data.finalResult.length - 1) {
              setSpinning(false)
              setStopping(false)
            }
          },
          index < data.finalResult.length - 1 ? (index + 1) * 3000 : (data.finalResult.length - 1) * 3000 + 7000,
        )
      }

      for (let i = 0; i < data.finalResult.length; i++) {
        stopCard(i)
      }
    }
  }, [stopping, data.finalResult.length])

  if (loading) {
    return (
      <div className="slot-machine-container flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="slot-machine-container flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl mb-4">{error}</p>
          <Button onClick={loadSlotMachineData}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="slot-machine-container flex flex-col items-center justify-center p-8">
      <div className="slot-machine-frame p-8 rounded-2xl">
        <div className="flex space-x-4 mb-8">
          {data.finalResult.map((_, index) => (
            <SlotCard
              key={index}
              spinning={spinning && stoppedCards <= index}
              finalValue={data.finalResult[index]}
              items={data.items}
            />
          ))}
        </div>
        <div className="flex justify-center space-x-6">
          <Button onClick={spin} disabled={spinning} className="slot-button spin-button">
            Quay số
          </Button>
          <Button onClick={stop} disabled={!spinning || stopping} className="slot-button edit-button">
            Chỉnh sửa
          </Button>
        </div>
      </div>
    </div>
  )
}

