import * as c from '~/assets/common'
import { Howl, Howler } from 'howler'

export const sounds = {
  beepHigh: 'beepHigh.mp3',
  beep: 'beep.mp3',
  block: 'DWoodBlock.wav',
  tabla: 'DTablaLow.wav',
  tap: 'tap.mp3',
  hat: 'hat.mp3',
}
export const volume = ref(0.5)
export const primarySoundName = ref(
  Object.keys(sounds)[0] as keyof typeof sounds,
)
export const secondarySoundName = ref(
  Object.keys(sounds)[1] as keyof typeof sounds,
)
let primaryHowl: Howl
let secondaryHowl: Howl
setSound(primarySoundName.value, 'primary')
setSound(secondarySoundName.value, 'secondary')

export function setVolume(newVolume: number | string) {
  c.log('setVolume', newVolume)
  newVolume = parseFloat(`${newVolume}`)
  volume.value = newVolume
  primaryHowl.volume(volume.value)
}

export function setSound(
  newSoundName: keyof typeof sounds,
  whichHowl: 'primary' | 'secondary' = 'primary',
) {
  if (!sounds[newSoundName])
    newSoundName = Object.keys(
      sounds,
    )[0] as keyof typeof sounds
  const soundName =
    whichHowl === 'primary'
      ? primarySoundName
      : secondarySoundName
  soundName.value = newSoundName
  const newHowl = new Howl({
    src: [sounds[soundName.value]],
    volume: volume.value,
  })
  if (whichHowl === 'primary') primaryHowl = newHowl
  else secondaryHowl = newHowl
}

export function playOneShot(
  primaryOrSecondary: 'primary' | 'secondary' = 'primary',
  volumeMultiplier?: number,
) {
  const howl =
    primaryOrSecondary === 'primary'
      ? primaryHowl
      : secondaryHowl

  if (volumeMultiplier)
    howl.volume(volume.value * volumeMultiplier)
  else howl.volume(volume.value)

  howl.play()
}
