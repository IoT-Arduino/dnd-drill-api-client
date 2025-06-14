export type Id = string | number

export type Column = {
  id: 'drill' | 'stock'
  title: string
}

export type Drill = {
  id: Id
  columnId: Id
  content: DrillContent
  status: boolean
}

export type DrillWithoutId = Omit<Drill, 'id'>

export type DrillContent = {
  text: string
  url?: string
}

export type DrillChecked = {
  id: Id
  content: DrillContent
}

export type TodaysDrill = {
  date: string
  memo: string
  drillItemsChecked: DrillChecked[]
}


export type DrillHistoryItem = {
  id: Id
  useId: string
  memo: string
  drills: string[]
  createdAt: string
}