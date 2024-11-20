<template>
  <div class="slider" @mousedown.stop="clickSlider">
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
        {{ c.r2(value)
        }}<span class="small">{{
          valueAddendum || ''
        }}</span>
        <span class="topLabel"
          >{{ c.r2(value)
          }}<span class="small">{{
            valueAddendum || ''
          }}</span></span
        >
      </div>
      <div
        class="sliderThumbHigh"
        v-if="range"
        @mousedown.stop="startDragUpper"
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
        {{ c.r2(upperValue)
        }}<span class="small">{{
          valueAddendum || ''
        }}</span>
        <span class="topLabel"
          >{{ c.r2(upperValue)
          }}<span class="small">{{
            valueAddendum || ''
          }}</span></span
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
    exponentialScale?: boolean
    showValues?: boolean
    valueAddendum?: string
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
const value = ref(
  c.clamp(
    props.min,
    Math.round(props.initialValue / props.step) *
      props.step,
    props.max,
  ),
)
const upperValue = ref(
  c.clamp(
    props.min,
    Math.round(
      (props.initialUpperValue || props.max) / props.step,
    ) * props.step,
    props.max,
  ),
)
watch(
  () => props.range,
  () => {
    upperValue.value = c.clamp(
      props.min,
      Math.round(
        (props.initialUpperValue || props.max) / props.step,
      ) * props.step,
      props.max,
    )
  },
)
const isDraggingLower = ref(false)
const isDraggingUpper = ref(false)
const exponentialScaleDegree = ref(2)

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
function clickSlider(event: MouseEvent) {
  if (!track.value) return
  const trackBCR =
    track.value.getBoundingClientRect() as DOMRect
  let percentAlongBar =
    (event.clientX - trackBCR.left) / trackBCR.width
  if (props.exponentialScale)
    percentAlongBar =
      percentToExponentialScale(percentAlongBar)
  const newValue =
    props.min + (props.max - props.min) * percentAlongBar
  const rounded =
    Math.round(newValue / props.step) * props.step
  if (props.range && rounded >= upperValue.value) {
    const prev = upperValue.value
    upperValue.value = rounded
    if (prev !== rounded) emitUpdate('updateUpper', rounded)
    startDragUpper(event)
  } else {
    const prev = value.value
    value.value = rounded
    if (prev !== rounded) emitUpdate('update', rounded)
    startDragLower(event)
  }
}
function startDragLower(event: MouseEvent) {
  isDraggingLower.value = true
  window.addEventListener('mousemove', mouseMove)
  window.addEventListener('mouseup', dragEnd)
  window.addEventListener('mouseleave', dragEnd)
}
function startDragUpper(event: MouseEvent) {
  isDraggingUpper.value = true
  window.addEventListener('mousemove', mouseMove)
  window.addEventListener('mouseup', dragEnd)
  window.addEventListener('mouseleave', dragEnd)
}
function mouseMove(event: MouseEvent) {
  const prevLower = value.value
  const prevUpper = upperValue.value
  const trackBCR = (
    track.value as HTMLDivElement
  ).getBoundingClientRect() as DOMRect
  let percentAlongBar =
    (event.clientX - trackBCR.left) / trackBCR.width
  if (props.exponentialScale)
    percentAlongBar =
      percentToExponentialScale(percentAlongBar)
  if (isDraggingLower.value) {
    const newValue = c.clamp(
      props.min,
      props.min + (props.max - props.min) * percentAlongBar,
      props.max,
    )
    value.value =
      Math.round(newValue / props.step) * props.step
    if (prevLower !== value.value)
      emitUpdate('update', value.value)
    if (value.value > upperValue.value) {
      upperValue.value = value.value
      if (prevUpper !== upperValue.value)
        emitUpdate('updateUpper', value.value)
    }
  }
  if (isDraggingUpper.value) {
    const newValue = c.clamp(
      props.min,
      props.min + (props.max - props.min) * percentAlongBar,
      props.max,
    )
    upperValue.value =
      Math.round(newValue / props.step) * props.step
    if (prevUpper !== upperValue.value)
      emitUpdate('updateUpper', upperValue.value)
    if (value.value > upperValue.value) {
      value.value = upperValue.value
      if (prevLower !== value.value)
        emitUpdate('update', upperValue.value)
    }
  }
}
function dragEnd(event: MouseEvent) {
  isDraggingLower.value = false
  isDraggingUpper.value = false
  window.removeEventListener('mousemove', mouseMove)
  window.removeEventListener('mouseup', dragEnd)
  window.removeEventListener('mouseleave', dragEnd)
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
      background: var(--colorD);
    }

    svg {
      .bg {
        fill: var(--color);
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
    z-index: 2;
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
      bottom: 110%;
      left: 50%;
      transform: translateX(-50%);
      font-size: 2em;
      color: var(--color);
      text-shadow: 0 0 0.5em var(--bg), 0 0 0.4em var(--bg),
        0 0 0.3em var(--bg), 0 0 0.2em var(--bg);
      font-weight: 700;
      pointer-events: none;
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
}
</style>
