import * as c from '~/assets/common'
import { Howl, Howler } from 'howler'

export const sounds = {
  woodBlock: 'DWoodBlock.wav',
  tabla: 'DTablaLow.wav',
}
export const volume = ref(0.5)
export const soundName = ref(
  Object.keys(sounds)[0] as keyof typeof sounds,
)
let activeHowl: Howl
setSound(soundName.value)

export function setVolume(newVolume: number | string) {
  c.log('setVolume', newVolume)
  newVolume = parseFloat(`${newVolume}`)
  volume.value = newVolume
  activeHowl.volume(volume.value)
}

export function setSound(
  newSoundName: keyof typeof sounds,
) {
  if (!sounds[newSoundName])
    newSoundName = Object.keys(
      sounds,
    )[0] as keyof typeof sounds
  soundName.value = newSoundName
  activeHowl = new Howl({
    src: [sounds[soundName.value]],
    volume: volume.value,
  })
}

export function playOneShot() {
  activeHowl.play()
}
