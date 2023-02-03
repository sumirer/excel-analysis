<template>
  <div class="model-container" :class="{ visible: props.visible }">
    <div class="mask" @click="handleHide"></div>
    <div class="modal-container right-container flex-column">
      <div class="title">漏斗配置</div>
      <DragContainer @focus="handleEditAttributes"></DragContainer>
      <div class="modal-container inner-modal" :class="{ 'inner-modal-visible': innerVisible }">
        <div @click="innerVisible = false">
            收起
        </div>
        <div>
          <div v-for="(value, key) in editFilterData?.data?.editAttributes" :key="key">
            <div>{{ key }}</div>
            <div>{{ value }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits, ref } from "vue";
import DragContainer from "./DragContainer.vue";
import { IFilterSource } from "@/excel/filter/Filter";
import { ISvgCardPath } from "@/types";

interface IProps {
  visible: boolean;
}

const innerVisible = ref(false);

const editFilterData = ref<ISvgCardPath<IFilterSource>>();

const props = defineProps<IProps>();

const emits = defineEmits(["hide"]);

const handleHide = () => {
  innerVisible.value = false;
  emits("hide");
};

const handleEditAttributes = (path: ISvgCardPath<IFilterSource>) => {
  console.log(path);
  innerVisible.value = true;
  editFilterData.value = path;
};
</script>
