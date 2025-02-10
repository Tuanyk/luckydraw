import type { ApiResponse } from "@/types/slot-machine"

export async function fetchSlotMachineData(day: number): Promise<ApiResponse> {
  try {
    const response = await fetch(`https://vongquaymayman.pantravel.vn/luckydraw_${day}.json`)
    if (!response.ok) {
      throw new Error("Failed to fetch slot machine data")
    }
    return await response.json()
  } catch (error) {
    return {
      success: false,
      data: { items: [], finalResult: [], listItems: [] },
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

