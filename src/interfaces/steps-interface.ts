export interface StepsIF {
  id: string
  step: number
  icon: string
  text: string
  to: string,
  component: any // Work around: Do components have types?
}
