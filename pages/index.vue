<template>
  <div class="pageheight flexcenter gapbig2 padbig marauto">
    <div
      class="flexcolumn"
      style="width: 300px; max-width: 100%"
    >
      <div class="textcenter fullwidth">
        <h1 class="bold" :class="{ fade2: !playbackId }">
          {{ c.r2(currentBpm, 0)
          }}<span class="small2 marlefttiny">bpm</span>
        </h1>

        <div
          class="barHolder padtop padbot fullwidth"
          :class="{
            disabled: !playbackId,
            pointer: bpmStartToEndInMinutes,
          }"
          ref="progressBar"
          @click="clickBar"
          @mousemove="barHover"
          @mouseleave="barHoverPercent = 0"
        >
          <div class="bar">
            <div
              class="fill"
              :style="{
                width: progress * 100 + '%',
              }"
            ></div>
            <div
              v-if="!mobile && bpmStartToEndInMinutes"
              class="barHoverFill"
              :style="{
                width: barHoverPercent * 100 + '%',
              }"
            ></div>
          </div>
        </div>

        <div class="fade marbotbig">
          {{ c.r2(startBpm)
          }}<span
            v-if="
              isRange &&
              startBpm !== effectiveEndBpm &&
              bpmStartToEndInMinutes > 0
            "
            >—{{ c.r2(effectiveEndBpm) }}</span
          >
          bpm
          <span v-if="bpmStartToEndInMinutes > 0">
            <span v-if="startBpm !== effectiveEndBpm"
              >over</span
            >
            <span v-else>for</span>
            {{ c.r2(bpmStartToEndInMinutes) }} min{{
              bpmStartToEndInMinutes > 1 ? 's' : ''
            }}<span v-if="isRange && jumpByIncrementsOf"
              >, blocks of
              {{ c.r2(jumpByIncrementsOf) }}</span
            ><span
              v-else-if="
                isRange && startBpm !== effectiveEndBpm
              "
              >, gradual</span
            >
          </span>
          <span v-else> forever</span>
        </div>
        <!-- <div v-if="progress">
          {{ c.r2(progress * 100, 0) }}%
        </div> -->

        <div
          style="max-width: 100%"
          class="padtop marauto flexcolumn gapsmall"
        >
          <!--  <div class="flexstretch flexwrap gaptiny">
            <button
              class="small"
              v-for="soundName in Object.keys(h.sounds)"
              :class="{
                primary2:
                  h.secondarySoundName.value === soundName,
                primary:
                  h.primarySoundName.value === soundName,
              }"
              @click="h.setSound(soundName as any)"
              @dblclick="
                h.setSound(soundName as any, 'secondary')
              "
            >
              {{
                c.capitalize(c.camelCaseToWords(soundName))
              }}
            </button>
          </div> -->

          <!-- <select
            @change="(sound: any) => h.setSound(sound.target.value)"
            :value="h.soundName.value"
          >
            <option
              v-for="sound in Object.keys(h.sounds)"
              :value="sound"
            >
              {{ c.capitalize(c.camelCaseToWords(sound)) }}
            </option>
          </select> -->

          <!-- <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            :value="h.volume.value"
            @change="(e:any) => h.setVolume(e.target.value)"
          /> -->

          <div class="flexcenter gap fullwidth">
            <Icon
              name="material-symbols:music-note"
              class="icon"
            />
            <Slider
              :min="40"
              :max="300"
              :step="10"
              :range="isRange"
              :initialValue="startBpm"
              :initialUpperValue="endBpm"
              :line="true"
              :showValues="true"
              :maintainGap="40"
              @update="
                (lower) => {
                  startBpm = lower
                  if (!playbackId) currentBpm = startBpm
                }
              "
              @updateUpper="(upper) => (endBpm = upper)"
            />
          </div>

          <div class="flexcenter gap fullwidth">
            <Icon
              name="material-symbols:timer"
              class="icon"
            />
            <Slider
              :min="isRange ? 1 : 0"
              :max="30"
              :step="1"
              :exponentialScale="1.3"
              :initialValue="bpmStartToEndInMinutes"
              :line="true"
              :showValues="true"
              valueAddendum=":00"
              fillTo="start"
              :customLabel="
                (val) => (val ? undefined : '∞')
              "
              @update="
                (val) => (bpmStartToEndInMinutes = val)
              "
            />
          </div>
        </div>

        <div
          class="buttonRow fullwidth marbot martop flexstretch"
        >
          <button
            class="small icon steps"
            :class="{
              primary: !isRange,
            }"
            @click="isRange = false"
          >
            <Icon name="material-symbols:point-scan" />
          </button>
          <button
            class="small icon steps"
            :class="{
              primary: isRange && jumpByIncrements,
            }"
            @click="
              () => {
                jumpByIncrements = true
                if (!isRange) {
                  if (endBpm <= startBpm)
                    endBpm = Math.min(startBpm + 60, 300)
                  if (bpmStartToEndInMinutes === 0)
                    bpmStartToEndInMinutes = 1
                  isRange = true
                }
              }
            "
          >
            <Icon
              name="material-symbols:turn-sharp-right-sharp"
            />
          </button>
          <button
            class="small icon linear"
            :class="{
              primary: isRange && !jumpByIncrements,
            }"
            @click="
              () => {
                jumpByIncrements = false
                if (!isRange) {
                  if (endBpm <= startBpm)
                    endBpm = Math.min(startBpm + 60, 300)
                  if (bpmStartToEndInMinutes === 0)
                    bpmStartToEndInMinutes = 1
                  isRange = true
                }
              }
            "
          >
            <Icon name="ph:arrow-up-right-bold" />
          </button>
        </div>

        <div
          class="flexcenter fullwidth buttonRow flexstretch"
        >
          <button
            @click="subdivide = 1"
            class="small icon"
            :class="{ primary: subdivide === 1 }"
          >
            <Icon name="material-symbols:music-note" />
            <!-- ♩ -->
          </button>
          <button
            @click="subdivide = 2"
            class="small icon"
            :class="{ primary: subdivide === 2 }"
          >
            <Icon name="mynaui:music" />
            <!-- ♫ -->
          </button>
          <button
            @click="subdivide = 3"
            class="small icon"
            :class="{ primary: subdivide === 3 }"
          >
            <Icon
              name="material-symbols:counter-3-rounded"
            />
            <!-- ♪³ -->
          </button>
          <button
            @click="subdivide = 4"
            class="small icon"
            :class="{ primary: subdivide === 4 }"
          >
            <Icon
              name="material-symbols:counter-4-rounded"
            />
            <!-- ♬♬ -->
          </button>
        </div>

        <div class="flexcenter martopbig buttonRow">
          <button
            class="icon"
            @click="togglePause()"
            v-if="playbackId"
          >
            <Icon
              v-if="playState === 'pause'"
              name="material-symbols:play-arrow"
            />
            <Icon v-else name="material-symbols:pause" />
          </button>

          <button
            class="icon"
            @click="go()"
            v-if="!playbackId && playState === 'stop'"
          >
            <Icon name="material-symbols:play-arrow" />
          </button>

          <button
            class="warning icon"
            @click="stop()"
            v-else-if="playbackId"
          >
            <Icon name="material-symbols:stop" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import * as c from '~/assets/common'
import * as h from '~/assets/howler'

const startBpm = ref(120)
const endBpm = ref(180)
const isRange = ref(false)
const elapsedTimeInMs = ref(0)
const bpmStartToEndInMinutes = ref(5)
const jumpByIncrements = ref(false)
const subdivide = ref(1)

const mobile = computed(() => {
  return (window?.innerWidth || 0) < 600
})

const effectiveEndBpm = computed(() => {
  if (!isRange.value) return startBpm.value
  return endBpm.value
})

const jumpByIncrementsOf = computed(() => {
  if (!jumpByIncrements.value) return 0
  const gapPerMinute =
    (effectiveEndBpm.value - startBpm.value) /
    bpmStartToEndInMinutes.value
  if (gapPerMinute < 20) return 10
  if (gapPerMinute < 100) return 20
  return 30
})

const currentBpm = ref(startBpm.value)
const progress = ref(0)
type PlayState = 'play' | 'pause' | 'stop'
const playState: Ref<PlayState> = ref('stop')

onMounted(() => {
  window.addEventListener('keydown', keyListener)
})
onUnmounted(() => {
  window.removeEventListener('keydown', keyListener)
})

function bpmToMs(bpm: number) {
  return 60000 / bpm
}

const playbackId: Ref<string | null> = ref(null)

function resetAndStart({
  startBpm: _startBpm,
  endBpm: _endBpm,
  bpmStartToEndInMinutes: _bpmStartToEndInMinutes,
  jumpByIncrementsOf: _jumpByIncrementsOf,
}: {
  startBpm?: number
  endBpm?: number
  bpmStartToEndInMinutes?: number
  jumpByIncrementsOf?: number
}) {
  stop()
  // startBpm.value = _startBpm ?? _endBpm ?? 60
  // bpmStartToEndInMinutes.value =
  //   _bpmStartToEndInMinutes ?? 0
  // endBpm.value =
  //   bpmStartToEndInMinutes.value === 0
  //     ? startBpm.value
  //     : _endBpm ?? _startBpm ?? 60
  go()
}

function togglePause() {
  if (playState.value === 'play') {
    playState.value = 'pause'
    clearTimeout(nextHitTimeout)
    for (let t in nextSubdivisionTimeouts) clearTimeout(t)
  } else {
    playState.value = 'play'
    go(playbackId.value)
  }
}

function stop() {
  playState.value = 'stop'
  clearTimeout(nextHitTimeout)
  for (let t in nextSubdivisionTimeouts) clearTimeout(t)
  elapsedTimeInMs.value = 0
  currentBpm.value = startBpm.value
  playbackId.value = null
  progress.value = 0
}

let nextHitTimeout: any
let nextSubdivisionTimeouts: any[] = []
function go(currentPlaybackId: string | null = null) {
  if (
    (currentPlaybackId &&
      currentPlaybackId !== playbackId.value) ||
    (!currentPlaybackId && playbackId.value)
  ) {
    return
  }

  playState.value = 'play'

  if (!playbackId.value) {
    playbackId.value = c.generateId()
    currentPlaybackId = playbackId.value
    elapsedTimeInMs.value = 0
  }
  h.playOneShot()

  progress.value =
    elapsedTimeInMs.value /
    ((bpmStartToEndInMinutes.value || Infinity) * 1000 * 60)

  currentBpm.value = c.lerp(
    startBpm.value,
    effectiveEndBpm.value,
    progress.value,
  )
  if (jumpByIncrementsOf.value) {
    currentBpm.value =
      Math.round(
        currentBpm.value / jumpByIncrementsOf.value,
      ) * jumpByIncrementsOf.value
  }

  if (progress.value >= 1) {
    stop()
    return
  }

  const msToNext = bpmToMs(currentBpm.value)
  // c.log(msToNext)
  nextHitTimeout = setTimeout(() => {
    elapsedTimeInMs.value += msToNext
    go(currentPlaybackId)
  }, msToNext)

  for (let t of nextSubdivisionTimeouts) clearTimeout(t)
  nextSubdivisionTimeouts = []
  if (subdivide.value > 1) {
    const msToNextSubdivision = msToNext / subdivide.value
    for (let i = 1; i < subdivide.value; i++)
      nextSubdivisionTimeouts.push(
        setTimeout(() => {
          h.playOneShot('secondary', 0.3)
        }, msToNextSubdivision * i),
      )
  }
}

const progressBar = ref<HTMLElement | null>(null)
const barHoverPercent = ref(0)
function barHover(e: MouseEvent) {
  if (!progressBar.value) return
  const rect = progressBar.value.getBoundingClientRect()
  const percent = (e.clientX - rect.left) / rect.width
  barHoverPercent.value = percent
}
function clickBar(e: MouseEvent) {
  if (!progressBar.value) return
  if (!bpmStartToEndInMinutes.value) return
  const rect = progressBar.value.getBoundingClientRect()
  const percent = (e.clientX - rect.left) / rect.width

  // progress.value =
  //   elapsedTimeInMs.value /
  //   ((bpmStartToEndInMinutes.value || Infinity) * 1000 * 60)

  progress.value = percent
  elapsedTimeInMs.value =
    (bpmStartToEndInMinutes.value || Infinity) *
    1000 *
    60 *
    percent
}

function keyListener(e: KeyboardEvent) {
  if (e.key === ' ') {
    e.preventDefault()
    if (playbackId.value) {
      togglePause()
    } else {
      go()
    }
  } else if (['Escape', 'Backspace'].includes(e.key)) {
    stop()
  }
}
</script>

<style scoped lang="scss">
.bar {
  position: relative;
  height: 1em;
  border-radius: 0.5em;
  overflow: hidden;
  background: var(--bg2);

  .fill {
    z-index: 2;
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: var(--highlight3);
  }
  .barHoverFill {
    z-index: 3;
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: var(--highlight3);
    filter: brightness(0.7);
    opacity: 0.5;
  }
}

hr {
  margin: 0.7em 0;
}
</style>
