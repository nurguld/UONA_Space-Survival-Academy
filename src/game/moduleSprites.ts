import mapBatteryImg from '../assets/map-battery.png'
import mapExerciseImg from '../assets/map-exercise.png'
import mapGreenhouseImg from '../assets/map-greenhouse.png'
import mapLifeSupportImg from '../assets/map-lifesupport.png'
import mapShieldImg from '../assets/map-shield.png'
import mapSolarImg from '../assets/map-solar.png'
import type { ModuleId } from '../types'

export const MODULE_SPRITES: Record<ModuleId, string> = {
  solar: mapSolarImg,
  lifeSupport: mapLifeSupportImg,
  battery: mapBatteryImg,
  greenhouse: mapGreenhouseImg,
  exercise: mapExerciseImg,
  shield: mapShieldImg,
}
