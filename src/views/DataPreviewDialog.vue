<template>
  <div class="dialog-container" :class="{ visible: props.visible }">
    <div class="mask" @click="handleHide"></div>
    <div class="dialog-body">
      <div>数据预览</div>
      <div class="tab-bar">
        <div
          v-for="(excel, index) in props.data"
          :key="index"
          @click="handleIndexChange(index)"
          :class="[{ 'bar-item': true, selected: index === showIndex }]"
          :title="excel.dataInfo.fileName + '-' + excel.dataInfo.sheetName"
          :ref="index === showIndex ? getRef : undefined"
        >
          {{ excel.dataInfo.fileName }}-({{ excel.dataInfo.sheetName }})
        </div>
      </div>
      <DataTable
        v-if="props.data[showIndex]"
        :key="showIndex"
        :columns="props.data[showIndex].col"
        :data="props.data[showIndex].data"
      ></DataTable>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { AnalysisData } from "@/types";
import { defineProps, defineEmits, ref, VNodeRef, nextTick } from "vue";
import DataTable from "./DataTable.vue";

interface IProps {
  visible: boolean;
  data: AnalysisData[];
}

const pickRef = ref<HTMLDivElement>();

const showIndex = ref(0);

const props = defineProps<IProps>();

const emits = defineEmits(["hide", "hided"]);

const getRef: VNodeRef = (ref: unknown) => {
  pickRef.value = ref as HTMLDivElement;
};

const handleHide = () => {
  emits("hide");
  setTimeout(() => {
    emits("hided");
  }, 200);
};

const handleIndexChange = (index: number) => {
  showIndex.value = index;
  nextTick(() => {
    if (pickRef.value) {
      pickRef.value.scrollIntoView({ inline: "center" });
    }
  });
};
</script>
