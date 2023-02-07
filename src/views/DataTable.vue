<template>
  <div class="table-wrapper">
    <VirtualTable
      :dataManager="dataManager"
      style="height: 100%"
      :showHeader="props.showHeader"
      :selectMode="props.selectMode"
      :onSelectStart="handleSelectStart"
      :onSelectMove="handleSelectMove"
      :onSelectEnd="handleSelectEnd"
      :class="{ 'excel-select-mode': props.selectMode }"
      :onHeaderClick="handleHeaderClick"
    >
      <!-- <template #0="{ data, key }">
        <div style="font-weight: bold">{{ data[key] }}</div>
      </template> -->
      <template #overlay>
        <div
          v-for="(item, index) in selectRangeData"
          :key="index"
          class="overlay"
          :style="{
            borderColor: item.color || colors[index],
            left: item.path[0] + 'px',
            top: item.path[1] + 'px',
            width: item.path[2] - item.path[0] + 'px',
            height: item.path[3] - item.path[1] + 'px',
            background: (item.color || colors[index]) + '40',
          }"
        ></div>
      </template>
    </VirtualTable>
  </div>
</template>

<script lang="ts" setup>
import VirtualDataManager from "@/components/virtualTable/core/VirtualDataManager";
import VirtualTable from "@/components/virtualTable/view/VirtualTable.vue";
import { DataSelectInfo, PathData } from "@/types/page";
import { ITableColumn } from "@/types/table";
import { defineProps, ref, defineExpose } from "vue";

interface IProps {
  columns: Array<string | number>;
  data: Array<Array<string | number>>;
  showHeader?: boolean;
  selectMode?: boolean;
  selectInfo?: Array<DataSelectInfo>;
}

const props = defineProps<IProps>();

const colors = [
  "#FEA47F",
  "#25CCF7",
  "#EAB543",
  "#55E6C1",
  "#F8EFBA",
  "#3B3B98",
  "#D6A2E8",
  "#F97F51",
  "#FEA47F",
  "#25CCF7",
  "#EAB543",
  "#55E6C1",
  "#F8EFBA",
  "#3B3B98",
  "#D6A2E8",
  "#F97F51",
  "#FEA47F",
  "#25CCF7",
  "#EAB543",
  "#55E6C1",
  "#F8EFBA",
  "#3B3B98",
  "#D6A2E8",
  "#F97F51",
];

const selectRangeData = ref<Array<DataSelectInfo>>(props.selectInfo ?? []);

const createCol = (col: Array<string | number>): ITableColumn[] => {
  const width = ~~((800 - 5) / col.length) > 90 ? ~~(800 / col.length) : 120;
  console.log(col);
  return col.map((item, index) => {
    return {
      title: index + "",
      colKey: index,
      width: width + "px",
      // fixed: index === 0 ? "left" : undefined,
    };
  });
};

let startSelect = false;
let selectIndex: undefined | number = undefined;

const handleSelectStart = (event: MouseEvent, target: HTMLDivElement) => {
  if (selectIndex === undefined) {
    return;
  }
  const rect = target.getClientRects()[0];
  const x = event.clientX - rect.left + target.scrollLeft;
  const y = event.clientY - rect.top + target.scrollTop;
  startSelect = true;
  selectRangeData.value[selectIndex].path = [x, y, x, y];
};

const handleSelectMove = (event: MouseEvent, target: HTMLDivElement) => {
  if (!startSelect || selectIndex === undefined) {
    return;
  }
  const rect = target.getClientRects()[0];
  selectRangeData.value[selectIndex].path[2] = event.clientX - rect.left + target.scrollLeft;
  selectRangeData.value[selectIndex].path[3] = event.clientY - rect.top + target.scrollTop;
};

const handleSelectEnd = (event: MouseEvent, horizontal: Array<number>, vertical: Array<number>) => {
  if (!startSelect || selectIndex === undefined) {
    return;
  }
  const selectTemp = selectRangeData.value[selectIndex].path;
  let startX = null;
  let startXIndex = 0;
  let endXIndex = 0;
  let endX = null;
  for (let index = 0; index < horizontal.length; index++) {
    if (horizontal[index] >= selectTemp[0] && startX === null) {
      startX = horizontal[index - 1] ?? 0;
      startXIndex = index - 1;
    }
    if (horizontal[index] >= selectTemp[2] && endX === null) {
      endX = horizontal[index] ?? 0;
      endXIndex = index;
    }
  }
  let startY = null;
  let endY = null;
  let startYIndex = 0;
  let endYIndex = 0;
  for (let index = 0; index < vertical.length; index++) {
    if (vertical[index] >= selectTemp[1] && startY === null) {
      startY = vertical[index - 1] ?? 0;
      startYIndex = index - 1;
    }
    if (vertical[index] >= selectTemp[3] && endY === null) {
      endY = vertical[index] ?? 0;
      endYIndex = index;
    }
  }
  selectRangeData.value[selectIndex].path = [startX, startY, endX, endY] as PathData;
  selectRangeData.value[selectIndex].selectRange = [startXIndex, startYIndex, endXIndex, endYIndex];
  selectRangeData.value[selectIndex].color = colors[selectIndex];
  selectIndex = undefined;
  startSelect = false;
};

const dataManager = new VirtualDataManager(
  props.data,
  createCol(props.columns)
) as VirtualDataManager<unknown>;

const updateSelectIndex = (index: number) => {
  selectIndex = index;
};

const handleHeaderClick = (col: ITableColumn) => {
  if (!props.selectMode) {
    return;
  }
  console.log(col);
};

defineExpose({ updateSelectIndex });
</script>
