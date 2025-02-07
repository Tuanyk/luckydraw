export interface SlotMachineData {
    items: number[]
    finalResult: number[]
  }
  
  export interface ApiResponse {
    success: boolean
    data: SlotMachineData
    error?: string
  }
  
  