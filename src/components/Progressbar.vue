<template>
  <div v-if="this.visiblity" :data-text="this.text" class="progress">
    <div
      role="progressbar"
      class="progress-bar progress-bar-striped progress-bar-animated"
      style="width: 100%; position: absolute; height: 5px; opacity: 0.4;"
    ></div>

    <div
      role="progressbar"
      class="progress-bar progress-bar-striped progress-bar-animated bg-success"
      :style="'width:'+this.value+'%'"
    ></div>
  </div>
</template>

<script>
export default {
  props: ["visiblity", "value", "text"]
};
</script>

<style lang="scss">
.progress {
  height: 5px;
  border-radius: 0;
  position: absolute;
  bottom: -1px;
  left: -1px;
  width: 100%;
  overflow: visible !important;

  &::after {
    content: attr(data-text);
    display: block;
    color: #687a8c;
    position: absolute;
    top: -19px;
    left: 3px;
    font-size: 12px;
  }
}
</style>