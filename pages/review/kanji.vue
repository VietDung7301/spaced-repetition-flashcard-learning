<script>
import VueDrawingCanvas from "vue-drawing-canvas";

export default {
  name: "ServeDev",
  components: {
    VueDrawingCanvas,
  },
  data() {
    return {
      initialImage: [
        {
          type: "dash",
          from: {
            x: 262,
            y: 154,
          },
          coordinates: [],
          color: "#000000",
          width: 5,
          fill: false,
        },
      ],
      x: 0,
      y: 0,
      image: "",
      eraser: false,
      disabled: false,
      fillShape: false,
      line: 5,
      color: "#000000",
      strokeType: "dash",
      lineCap: "square",
      lineJoin: "bevel",
      backgroundColor: "#FFFFFF",
      additionalImages: [],
    };
  },
  mounted() {
    if ("vue-drawing-canvas" in window.localStorage) {
      this.initialImage = JSON.parse(
        window.localStorage.getItem("vue-drawing-canvas")
      );
    }
  },
  methods: {
    getCoordinate(event) {
      let coordinates = this.$refs.VueCanvasDrawing.getCoordinates(event);
      this.x = coordinates.x;
      this.y = coordinates.y;
    },
  },
};
</script>

<template>
  <div class="flex flex-row justify-center overflow-x-hidden">
    <div>
      <div class="flex flex-col gap-3">
        <vue-drawing-canvas
          ref="VueCanvasDrawing"
          v-model:image="image"
          :width="400"
          :height="400"
          :stroke-type="strokeType"
          :line-cap="lineCap"
          :line-join="lineJoin"
          :fill-shape="fillShape"
          :eraser="eraser"
          :lineWidth="line"
          :color="color"
          :background-color="backgroundColor"
          :initial-image="initialImage"
          saveAs="png"
          :styles="{
            border: 'solid 1px #000',
          }"
          :lock="disabled"
          @mousemove="getCoordinate($event)"
          :additional-images="additionalImages"
        />
        <div class="flex flex-row justify-evenly w-full">
          <button type="button" @click.prevent="$refs.VueCanvasDrawing.undo()">
            <UIcon name="i-material-symbols:undo" class="w-10 h-10"></UIcon>
          </button>
          <button type="button" @click.prevent="$refs.VueCanvasDrawing.redo()">
            <UIcon name="i-material-symbols:redo" class="w-10 h-10"></UIcon>
          </button>
          <button type="button" @click.prevent="$refs.VueCanvasDrawing.reset()">
            <UIcon name="i-tdesign:clear-formatting-1" class="w-8 h-8"></UIcon>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>