export interface SlotMachineData {
    items: number[]
    finalResult: number[]
    listItems: string[]
  }
  
  export interface ApiResponse {
    success: boolean
    data: SlotMachineData
    error?: string
  }
  
  