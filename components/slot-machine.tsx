"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import SlotCard from "./slot-card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { fetchSlotMachineData } from "@/lib/api"
import type { SlotMachineData } from "@/types/slot-machine"
// import { Roboto } from 'next/font/google'

// const roboto = Roboto({weight: "400", subsets: ['latin']})

export default function SlotMachine() {
  const [spinning, setSpinning] = useState(false)
  const [stopping, setStopping] = useState(false)
  const [stoppedCards, setStoppedCards] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<SlotMachineData>({
    items: [],
    finalResult: [],
    listItems: [],
  })
  const [initialValues, setInitialValues] = useState<number[]>([])
  const [currentValues, setCurrentValues] = useState<number[]>([])
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()
  const pathname = usePathname()
  const currentDay = Number.parseInt(pathname.split("-")[1]) || 1


  useEffect(() => {
    loadSlotMachineData()
  }, [])

  async function loadSlotMachineData() {
    try {
      setLoading(true)
      const response = await fetchSlotMachineData(currentDay)
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to load slot machine data")
      }
      setData(response.data)
      const { listItems } = response.data

      const selectedItem = listItems.length > 0 
      ? String(listItems[Math.floor(Math.random() * listItems.length)])  // Convert to string
      : ""

      const finalResult = selectedItem.split("").map(char => Number(char))

      // Update state
      setData({ ...response.data, finalResult })


      const randomInitialValues = Array.from({ length: 7 }, () => 
        response.data.items[Math.floor(Math.random() * response.data.items.length)]
    );

    
      setInitialValues(randomInitialValues)
      setCurrentValues(randomInitialValues)
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
            setCurrentValues((prev) => {
              const newValues = [...prev]
              newValues[index] = data.finalResult[index]
              return newValues
            })
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
  }, [stopping, data.finalResult])

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
    <div className="slot-machine-container flex flex-col items-center justify-center p-4">
      
      <div className="slot-machine-frame rounded-2xl">
        {/* <h2 className={`text-white text-center text-2xl mb-3 mt-2 ${roboto.className}`}>Ngày 1</h2> */}
        <div className="flex space-x-2 mb-4">
          {data.finalResult.map((_, index) => (
            <SlotCard
              key={index}
              spinning={spinning && stoppedCards <= index}
              items={data.items}
              initialValue={initialValues[index]}
              currentValue={currentValues[index]}
            />
          ))}
        </div>
        <div className="flex justify-center space-x-6">
          <Button onClick={spin} disabled={spinning} className="slot-button spin-button">
            Quay số
          </Button>
          <Button onClick={stop} disabled={!spinning || stopping} className="slot-button edit-button">
            Dừng quay
          </Button>
        </div>
        <div className="justify-center mt-4 hidden">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="list-button slot-button">Danh sách</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Danh sách quay</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {data.listItems.map((item, index) => (
                  <div key={index} className="bg-gray-100 p-3 rounded-lg text-center text-lg font-semibold">
                    {item}
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
        {/* Navigation buttons */}
        <div className="grid grid-cols-6 gap-4 mt-2">
          {[1, 2, 3, 4, 5, 6].map((day) => (
            <Link key={day} href={`/ngay-${day}`} passHref>
              <Button
                className={`w-full ${
                  currentDay === day
                    ? "bg-yellow-500 hover:bg-yellow-600 text-black"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                Ngày {day}
              </Button>
            </Link>
          ))}
        </div>
    </div>
  )
}

