<template>
  <div class="model-container" :class="{ visible: props.visible }">
    <div class="mask" @click="handleHide"></div>
    <div class="left-container">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits } from "vue";

interface IProps {
  visible: boolean;
}

const props = defineProps<IProps>();

const emits = defineEmits(["hide"]);

const handleHide = () => {
  emits("hide");
};
</script>

