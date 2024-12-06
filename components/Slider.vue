<template>
  <div
    class="slider"
    @mousedown.stop="clickSlider"
    @touchstart.stop="clickSlider"
  >
    <div class="trackHolder">
      <div
        class="sliderTrack"
        :class="{ line: line }"
        ref="track"
      >
        <svg
          v-if="!line"
          width="100%"
          height="100%"
          viewBox="0 0 100 20"
          preserveAspectRatio="none"
        >
          <path
            class="bg"
            d="M 0 10 L 100 1 L 100 19 Z"
          ></path>

          <defs>
            <mask id="mask">
              <rect
                :x="
                  range
                    ? ((value - min) / spanSize) * 100
                    : 0
                "
                y="0"
                :width="
                  range
                    ? ((upperValue - value) / spanSize) *
                      100
                    : ((value - min) / spanSize) * 100
                "
                height="20"
                fill="white"
              />
            </mask>
          </defs>
          <path
            class="active"
            mask="url(#mask)"
            d="M 0 10 L 100 1 L 100 19 Z"
          ></path>
        </svg>
      </div>
      <div
        class="sliderThumb"
        ref="thumb"
        @mousedown.stop="startDragLower"
        @touchstart.stop="startDragLower"
        :style="{
          left:
            exponentialToPercent(
              (value - min) / (max - min),
            ) *
              100 +
            '%',
        }"
        :class="{
          dragging: isDraggingLower,
          somethingDragging:
            isDraggingLower || isDraggingUpper,
        }"
      >
        {{ customLabel?.(value) || c.r2(value)
        }}<span
          class="small"
          v-if="valueAddendum && !customLabel?.(value)"
          >{{ valueAddendum || '' }}</span
        >
        <span class="topLabel"
          >{{ customLabel?.(value) || c.r2(value)
          }}<span
            class="small"
            v-if="valueAddendum && !customLabel?.(value)"
            >{{ valueAddendum || '' }}</span
          ></span
        >
      </div>
      <div
        class="sliderRangeHighlight"
        v-if="range"
        :style="{
          left:
            exponentialToPercent(
              (value - min) / (max - min),
            ) *
              100 +
            '%',
          width:
            exponentialToPercent(
              (upperValue - value) / (max - min),
            ) *
              100 +
            '%',
        }"
      ></div>
      <div
        class="sliderRangeHighlight fillTo"
        :class="fillTo"
        v-if="fillTo && !range"
        :style="{
          left:
            fillTo === 'start'
              ? `calc(-1 * var(--thumbWidth) / 2)`
              : exponentialToPercent(
                  (value - min) / (max - min),
                ) *
                  100 +
                '%',
          width:
            fillTo === 'start'
              ? 'calc(' +
                exponentialToPercent(
                  (value - min) / (max - min),
                ) *
                  100 +
                '% + var(--thumbWidth) / 2)'
              : 'calc(' +
                (100 -
                  exponentialToPercent(
                    (value - min) / (max - min),
                  ) *
                    100) +
                '% + var(--thumbWidth) / 2)',
        }"
      ></div>
      <div
        class="sliderThumbHigh"
        v-if="range"
        @mousedown.stop="startDragUpper"
        @touchstart.stop="startDragUpper"
        :style="{
          left:
            exponentialToPercent(
              (upperValue - min) / (max - min),
            ) *
              100 +
            '%',
        }"
        :class="{
          dragging: isDraggingUpper,
          somethingDragging:
            isDraggingLower || isDraggingUpper,
        }"
      >
        {{ customLabel?.(upperValue) || c.r2(upperValue)
        }}<span
          class="small"
          v-if="valueAddendum && !customLabel?.(upperValue)"
          >{{ valueAddendum || '' }}</span
        >
        <span class="topLabel"
          >{{ customLabel?.(upperValue) || c.r2(upperValue)
          }}<span
            class="small"
            v-if="
              valueAddendum && !customLabel?.(upperValue)
            "
            >{{ valueAddendum || '' }}</span
          ></span
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as c from '~/assets/common'

const props = withDefaults(
  defineProps<{
    min?: number
    max?: number
    step?: number
    range?: boolean
    initialValue?: number
    initialUpperValue?: number
    line?: boolean
    exponentialScale?: boolean | number
    showValues?: boolean
    valueAddendum?: string
    fillTo?: 'start' | 'end'
    customLabel?: (
      value: number,
    ) => string | undefined | null
    maintainGap?: number
  }>(),
  {
    min: 0,
    max: 1,
    step: 0.1,
    range: false,
    initialValue: 0,
    initialUpperValue: undefined,
    line: false,
    exponentialScale: false,
  },
)

const spanSize = ref(props.max - props.min)

const value = ref(props.initialValue)
const upperValue = ref(
  props.initialUpperValue || props.initialValue,
)

onMounted(() => clampValues({ sendUpdates: true }))
watch(
  () => props.range,
  () => clampValues({ sendUpdates: true }),
)
watch(
  () => props.min,
  () => clampValues(),
)
watch(
  () => props.max,
  () => clampValues(),
)
function clampValues(
  options: { sendUpdates?: boolean } | undefined = {
    sendUpdates: false,
  },
) {
  value.value = c.clamp(
    props.min,
    Math.round(props.initialValue / props.step) *
      props.step,
    props.max - (props.range ? props.maintainGap || 0 : 0),
  )
  upperValue.value = c.clamp(
    props.min + (props.maintainGap || 0),
    Math.round(
      (props.initialUpperValue || props.initialValue) /
        props.step,
    ) * props.step,
    props.max,
  )

  if (options?.sendUpdates) {
    if (value.value !== props.initialValue)
      emitUpdate('update', value.value)
    if (upperValue.value !== props.initialUpperValue)
      emitUpdate('update:upper', upperValue.value)
  }
}
const isDraggingLower = ref(false)
const isDraggingUpper = ref(false)
const exponentialScaleDegree = ref(
  typeof props.exponentialScale === 'number'
    ? props.exponentialScale
    : 2,
)
watch(
  () => props.exponentialScale,
  () => {
    exponentialScaleDegree.value =
      typeof props.exponentialScale === 'number'
        ? props.exponentialScale
        : 2
  },
)

const emit = defineEmits()
function emitUpdate(event: string, value: number) {
  emit(event, value)
}
function percentToExponentialScale(percent: number) {
  if (!props.exponentialScale) return percent
  return Math.pow(percent, exponentialScaleDegree.value)
}
function exponentialToPercent(percent: number) {
  if (!props.exponentialScale) return percent
  return Math.pow(percent, 1 / exponentialScaleDegree.value)
}
const track = ref<HTMLDivElement | null>(null)
function clickSlider(event: MouseEvent | TouchEvent) {
  const clickX =
    (event as MouseEvent).clientX ||
    (event as TouchEvent).touches[0].clientX
  if (!track.value) return
  const trackBCR =
    track.value.getBoundingClientRect() as DOMRect
  let percentAlongBar = c.clamp(
    0,
    (clickX - trackBCR.left) / trackBCR.width,
    1,
  )
  if (props.exponentialScale)
    percentAlongBar =
      percentToExponentialScale(percentAlongBar)
  const newValue =
    props.min + (props.max - props.min) * percentAlongBar
  const rounded =
    Math.round(newValue / props.step) * props.step

  const willMoveLowerValue =
    !props.range ||
    Math.abs(rounded - value.value) <=
      Math.abs(rounded - upperValue.value)
  c.log({ willMoveLowerValue })
  if (!willMoveLowerValue) {
    const prev = upperValue.value
    upperValue.value = rounded
    if (prev !== rounded) emitUpdate('updateUpper', rounded)
    startDragUpper(event)
  } else {
    const prev = value.value
    value.value = c.clamp(
      props.min,
      rounded,
      props.max -
        (props.range ? props.maintainGap || 0 : 0),
    )
    if (prev !== rounded) emitUpdate('update', rounded)
    startDragLower(event)
  }
}
function startDragLower(event: MouseEvent | TouchEvent) {
  isDraggingLower.value = true
  window.addEventListener('mousemove', mouseMove)
  window.addEventListener('mouseup', dragEnd)
  window.addEventListener('mouseleave', dragEnd)

  window.addEventListener('touchmove', mouseMove)
  window.addEventListener('touchend', dragEnd)
  window.addEventListener('touchcancel', dragEnd)
}
function startDragUpper(event: MouseEvent | TouchEvent) {
  isDraggingUpper.value = true
  window.addEventListener('mousemove', mouseMove)
  window.addEventListener('mouseup', dragEnd)
  window.addEventListener('mouseleave', dragEnd)

  window.addEventListener('touchmove', mouseMove)
  window.addEventListener('touchend', dragEnd)
  window.addEventListener('touchcancel', dragEnd)
}
function mouseMove(event: MouseEvent | TouchEvent) {
  const clickX =
    (event as MouseEvent).clientX ||
    (event as TouchEvent).touches[0].clientX

  const prevLower = value.value
  const prevUpper = upperValue.value

  const trackBCR = (
    track.value as HTMLDivElement
  ).getBoundingClientRect() as DOMRect
  let percentAlongBar = c.clamp(
    0,
    (clickX - trackBCR.left) / trackBCR.width,
    1,
  )

  if (props.exponentialScale)
    percentAlongBar =
      percentToExponentialScale(percentAlongBar)

  if (isDraggingLower.value) {
    const newValue = c.clamp(
      props.min,
      props.min + (props.max - props.min) * percentAlongBar,
      props.max -
        (props.range ? props.maintainGap || 0 : 0),
    )
    value.value =
      Math.round(newValue / props.step) * props.step
    if (prevLower !== value.value)
      emitUpdate('update', value.value)
    if (
      value.value + (props.maintainGap || 0) >
      upperValue.value
    ) {
      upperValue.value = c.clamp(
        props.min,
        value.value + (props.maintainGap || 0),
        props.max,
      )
      if (prevUpper !== upperValue.value)
        emitUpdate('updateUpper', value.value)
    }
  }

  if (isDraggingUpper.value) {
    const newValue = c.clamp(
      props.min + (props.maintainGap || 0),
      props.min + (props.max - props.min) * percentAlongBar,
      props.max,
    )
    upperValue.value =
      Math.round(newValue / props.step) * props.step
    if (prevUpper !== upperValue.value)
      emitUpdate('updateUpper', upperValue.value)
    if (
      value.value + (props.maintainGap || 0) >
      upperValue.value
    ) {
      value.value = c.clamp(
        props.min,
        upperValue.value - (props.maintainGap || 0),
        props.max,
      )
      if (prevLower !== value.value)
        emitUpdate('update', upperValue.value)
    }
  }
}
function dragEnd(event: MouseEvent | TouchEvent) {
  isDraggingLower.value = false
  isDraggingUpper.value = false
  window.removeEventListener('mousemove', mouseMove)
  window.removeEventListener('mouseup', dragEnd)
  window.removeEventListener('mouseleave', dragEnd)

  window.removeEventListener('touchmove', mouseMove)
  window.removeEventListener('touchend', dragEnd)
  window.removeEventListener('touchcancel', dragEnd)
}
</script>

<style lang="scss" scoped>
.slider {
  position: relative;
  --tbPad: 0.5em;
  --thumbWidth: 40px;
  height: calc(var(--thumbWidth) + var(--tbPad) * 2);
  user-select: none;
  width: 100%;
  padding: var(--tbPad) calc(var(--thumbWidth) / 2)
    var(--tbPad) calc(var(--thumbWidth) / 2);

  --color: var(--highlight);
  --colorD: var(--bg4);
  --text: var(--bg);

  .trackHolder {
    width: 100%;
    height: var(--thumbWidth);
    position: relative;
  }

  .sliderTrack {
    position: absolute;
    z-index: 1;
    width: 100%;
    height: var(--thumbWidth);
    top: 50%;
    transform: translateY(-50%);
    &.line {
      height: 3px;
      border-radius: 2px;
      background: var(--colorD);
    }

    svg {
      .bg {
        fill: var(--colorD);
      }
      .active {
        stroke: var(--text);
        stroke-width: 1px;
        fill: var(--highlight);
      }
    }
  }

  .sliderThumb,
  .sliderThumbHigh {
    position: absolute;
    z-index: 3;
    top: 50%;
    transform: translateY(-50%) translateX(-50%);
    left: 0;
    width: var(--thumbWidth);
    height: var(--thumbWidth);
    background: var(--color);
    // box-shadow: inset 0 0 0 1px var(--colorD);
    border-radius: 50%;
    color: var(--text);
    letter-spacing: -1px;
    text-align: center;
    font-weight: bold;
    font-size: calc(var(--thumbWidth) / 2.4);
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: grab;
    transform-origin: center;

    &:hover:not(.somethingDragging),
    &.dragging {
      filter: brightness(1.2);
      z-index: 3;
    }

    .topLabel {
      opacity: 0;
      position: absolute;
      z-index: 4;
      bottom: calc(100% + 0.5em);
      left: 50%;
      transform: translateX(-50%);
      font-size: 1.8em;
      width: 2.75em;
      height: 2.75em;
      border-radius: 50%;
      display: flex;
      align-items: center;
      text-align: center;
      justify-content: center;
      background: var(--bg3);
      color: var(--color);
      // text-shadow: 0 0 0.5em var(--bg), 0 0 0.4em var(--bg),
      //   0 0 0.3em var(--bg), 0 0 0.2em var(--bg);
      font-weight: 700;
      pointer-events: none;

      &:after {
        // down arrow
        content: '';
        position: absolute;
        top: calc(100% - 0.35em);
        width: 0;
        height: 0;
        border-left: 0.75em solid transparent;
        border-right: 0.75em solid transparent;
        border-top: 0.75em solid var(--bg3);
      }
    }

    &.dragging {
      cursor: grabbing;
      transform: translateY(-50%) translateX(-50%)
        scale(1.2);
      color: transparent;

      .topLabel {
        opacity: 1;
      }
    }
  }

  .sliderRangeHighlight {
    position: absolute;
    z-index: 2;
    top: 50%;
    transform: translateY(-50%);
    height: var(--thumbWidth);
    background: var(--color);
    opacity: 1;

    &.fillTo {
      &.start {
        border-top-left-radius: calc(var(--thumbWidth) / 2);
        border-bottom-left-radius: calc(
          var(--thumbWidth) / 2
        );
      }
      &.end {
        border-top-right-radius: calc(
          var(--thumbWidth) / 2
        );
        border-bottom-right-radius: calc(
          var(--thumbWidth) / 2
        );
      }
    }
  }
}
</style>
