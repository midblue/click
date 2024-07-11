<template>
  <div class="pageheight flexcenter gapbig2 padbig marauto">
    <div class="flexcolumn" style="width: 400px">
      <div class="textcenter fullwidth">
        <h1 class="bold marbotsmall">
          {{ c.r2(currentBpm, 0) }} BPM
        </h1>
        <div
          class="bar marbotsmall marleftbig marrightbig"
          v-if="bpmStartToEndInMinutes > 0"
        >
          <div
            class="fill"
            :style="{
              width: progress * 100 + '%',
            }"
          ></div>
        </div>

        <div class="fade">
          {{ c.r2(startBpm)
          }}<span
            v-if="
              startBpm !== endBpm &&
              bpmStartToEndInMinutes > 0
            "
            >—{{ c.r2(endBpm) }}</span
          >
          BPM
          <span v-if="bpmStartToEndInMinutes > 0">
            <span v-if="startBpm !== endBpm">over</span>
            <span v-else>for</span>
            {{ c.r2(bpmStartToEndInMinutes) }} min{{
              bpmStartToEndInMinutes > 1 ? 's' : ''
            }}<span v-if="jumpByIncrementsOf"
              >, blocks of
              {{ c.r2(jumpByIncrementsOf) }}</span
            ><span v-else-if="startBpm !== endBpm"
              >, gradual</span
            >
          </span>
          <span v-else> forever</span>
        </div>

        <!-- <div v-if="progress">
          {{ c.r2(progress * 100, 0) }}%
        </div> -->

        <div
          style="max-width: 200px"
          class="padtop marauto flexcolumn gapsmall"
        >
          <div class="flexstretch flexwrap gaptiny">
            <button
              class="small"
              :class="{
                primary: h.soundName.value === soundName,
              }"
              v-for="soundName in Object.keys(h.sounds)"
              @click="h.setSound(soundName as any)"
            >
              {{
                c.capitalize(c.camelCaseToWords(soundName))
              }}
            </button>
          </div>
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

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            :value="h.volume.value"
            @change="(e:any) => h.setVolume(e.target.value)"
          />
        </div>

        <div class="flexcenter gap">
          <button
            class="martopbig big"
            @click="togglePause()"
            :disabled="!playbackId"
          >
            {{ playState === 'pause' ? 'Resume' : 'Pause' }}
          </button>

          <button
            class="martopbig big warning"
            @click="stop()"
            :disabled="!playbackId"
          >
            Stop
          </button>
        </div>
      </div>
    </div>

    <div class="flexcolumn" style="width: 230px">
      <div class="flexcolumn gapsmall">
        <div class="flexstretch flexwrap gapsmall">
          <button class="small" @click="resetAndStart({})">
            60
          </button>
          <button
            class="small"
            @click="resetAndStart({ startBpm: 80 })"
          >
            80
          </button>
          <button
            class="small"
            @click="resetAndStart({ startBpm: 100 })"
          >
            100
          </button>
          <button
            class="small"
            @click="resetAndStart({ startBpm: 120 })"
          >
            120
          </button>
          <button
            class="small"
            @click="resetAndStart({ startBpm: 140 })"
          >
            140
          </button>
          <button
            class="small"
            @click="resetAndStart({ startBpm: 160 })"
          >
            160
          </button>
          <button
            class="small"
            @click="resetAndStart({ startBpm: 180 })"
          >
            180
          </button>
          <button
            class="small"
            @click="resetAndStart({ startBpm: 200 })"
          >
            200
          </button>
        </div>

        <hr />

        <button
          @click="
            resetAndStart({
              startBpm: 60,
              bpmStartToEndInMinutes: 2,
            })
          "
        >
          60, 2 mins
        </button>
        <button
          @click="
            resetAndStart({
              startBpm: 60,
              bpmStartToEndInMinutes: 5,
            })
          "
        >
          60, 5 mins
        </button>

        <button
          @click="
            resetAndStart({
              startBpm: 100,
              bpmStartToEndInMinutes: 5,
            })
          "
        >
          100, 5 mins
        </button>

        <hr />
        <!-- 
        <button
          @click="
            resetAndStart({
              startBpm: 60,
              endBpm: 120,
              bpmStartToEndInMinutes: 5,
            })
          "
        >
          60-120, 5 mins, gradual
        </button>
        <button
          @click="
            resetAndStart({
              startBpm: 70,
              endBpm: 200,
              bpmStartToEndInMinutes: 5,
            })
          "
        >
          70-200, 5 mins, gradual
        </button>
        <button
          @click="
            resetAndStart({
              startBpm: 120,
              endBpm: 200,
              bpmStartToEndInMinutes: 2,
            })
          "
        >
          120-200, 2 mins, gradual
        </button>

        <hr /> -->

        <button
          @click="
            resetAndStart({
              startBpm: 60,
              endBpm: 120,
              bpmStartToEndInMinutes: 5,
              jumpByIncrementsOf: 20,
            })
          "
        >
          60-120, 5 mins, blocks of 20
        </button>
        <button
          @click="
            resetAndStart({
              startBpm: 60,
              endBpm: 200,
              bpmStartToEndInMinutes: 5,
              jumpByIncrementsOf: 20,
            })
          "
        >
          60-200, 5 mins, blocks of 20
        </button>
        <button
          @click="
            resetAndStart({
              startBpm: 60,
              endBpm: 280,
              bpmStartToEndInMinutes: 5,
              jumpByIncrementsOf: 20,
            })
          "
        >
          60-280, 5 mins, blocks of 20
        </button>
      </div>
    </div>
    <div class="flexcolumn" style="width: 230px">
      <div>
        <div class="label">Start BPM</div>
        <input v-model="startBpm" type="number" />
      </div>

      <div
        :class="{ disabled: bpmStartToEndInMinutes <= 0 }"
      >
        <div class="label">End BPM</div>
        <input v-model="endBpm" type="number" />
      </div>

      <div>
        <div class="label">
          Minutes
          <span class="sub marleft">0 = forever</span>
        </div>
        <input
          v-model="bpmStartToEndInMinutes"
          type="number"
        />
      </div>

      <div
        :class="{ disabled: bpmStartToEndInMinutes <= 0 }"
      >
        <div class="label">
          Jump by blocks of
          <span class="sub marleft">0 = auto</span>
        </div>
        <input v-model="jumpByIncrementsOf" type="number" />
      </div>

      <button
        @click="
          () => {
            stop()
            go()
          }
        "
      >
        Go
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import * as c from '~/assets/common'
import * as h from '~/assets/howler'

const startBpm = ref(60)
const endBpm = ref(120)
const elapsedTimeInMs = ref(0)
const bpmStartToEndInMinutes = ref(1)
const jumpByIncrementsOf = ref(0)

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
  startBpm.value = _startBpm ?? _endBpm ?? 60
  bpmStartToEndInMinutes.value =
    _bpmStartToEndInMinutes ?? 0
  endBpm.value =
    bpmStartToEndInMinutes.value === 0
      ? startBpm.value
      : _endBpm ?? _startBpm ?? 60
  jumpByIncrementsOf.value = _jumpByIncrementsOf ?? 0
  go()
}

function togglePause() {
  if (playState.value === 'play') {
    playState.value = 'pause'
    clearTimeout(timeout)
  } else {
    playState.value = 'play'
    go(playbackId.value)
  }
}

function stop() {
  playState.value = 'stop'
  clearTimeout(timeout)
  elapsedTimeInMs.value = 0
  currentBpm.value = startBpm.value
  playbackId.value = null
  progress.value = 0
}

let timeout: any
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
    endBpm.value,
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

  const bpmToNext = bpmToMs(currentBpm.value)
  // c.log(bpmToNext)

  timeout = setTimeout(() => {
    elapsedTimeInMs.value += bpmToNext
    go(currentPlaybackId)
  }, bpmToNext)
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
  height: 0.3em;
  border-radius: 0.2em;
  overflow: hidden;
  background: var(--bg2);

  .fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: var(--highlight);
  }
}

hr {
  margin: 0.7em 0;
}
</style>
