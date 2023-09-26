export interface StepsIF {
  id: string
  step: number
  icon: string
  text: string
  to: string,
  disabled: boolean,
  component: any // Work around: Do components have types?
}
