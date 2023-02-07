<template>
  <div class="dialog-container" :class="{ visible: props.visible }">
    <div class="mask" @click="handleHide"></div>
    <div class="dialog-body" style="width: 80vw; height: 80vh">
      <div>数据选择</div>
      <div class="flex-row">
        <DataTable
          :columns="props.data.col"
          :data="props.data.data"
          :show-header="true"
          class="excel-select-mode"
          :select-info="dataSelect"
          :select-mode="true"
          ref="dataTableRef"
        ></DataTable>
        <div class="data-select-list">
          <div class="title">数据选择</div>
          <div
            v-for="(item, index) in dataSelect"
            :key="index"
            @click="updateIndex(index)"
            class="data-select-container"
            :class="{ checked: currentIndex === index }"
          >
            <div>名称: {{ item.name }}</div>
            <div>选择数据: {{ item.selectRange.join(",") }}</div>
            <div>
              数据标记颜色:
              <span
                style="display: inline-block; width: 10px; height: 10px"
                :style="{ background: item.color }"
              ></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { AnalysisData } from "@/types";
import { DataSelectInfo } from "@/types/page";
import { defineProps, defineEmits, ref } from "vue";
import DataTable from "./DataTable.vue";

interface IProps {
  visible: boolean;
  data: AnalysisData;
}

interface IDataTableRef {
  updateSelectIndex: (index: number) => void;
}

const dataTableRef = ref<IDataTableRef>();

const currentIndex = ref<number | undefined>(0);

const dataSelect = ref<Array<DataSelectInfo>>([
  { name: "横向标题", path: [0, 0, 0, 0], selectKey: "horizontal", selectRange: [0, 0, 0, 0] },
  { name: "标题", path: [0, 0, 0, 0], selectKey: "horizontal", selectRange: [0, 0, 0, 0] },
  { name: "数据", path: [0, 0, 0, 0], selectKey: "data", selectRange: [0, 0, 0, 0] },
]);

const props = defineProps<IProps>();

const emits = defineEmits(["hide", "hided"]);

const updateIndex = (index: number) => {
  if (dataTableRef.value) {
    dataTableRef.value.updateSelectIndex(index);
  } 
  currentIndex.value = index;
};

const handleHide = () => {
  emits("hide");
  setTimeout(() => {
    emits("hided");
  }, 200);
};
</script>
