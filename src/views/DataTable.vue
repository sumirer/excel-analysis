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
      :renderPath="rowPath"
    >
      <template #rowPickKey="{ colIndex }">
        <div style="font-weight: bold">
          {{ colIndex }}
        </div>
      </template>
      <template #overlay>
        <div
          v-for="(item, index) in renderPath"
          :key="index"
          class="overlay"
          :style="{
            borderColor: item.color,
            left: item.path[0] + 'px',
            top: item.path[1] + 'px',
            width: item.type === PathType.ROW ? '100%' : item.path[2] - item.path[0] + 'px',
            height: item.type === PathType.COLUMN ? '100%' : item.path[3] - item.path[1] + 'px',
            background: item.color + '40',
          }"
        ></div>
      </template>
    </VirtualTable>
  </div>
</template>

<script lang="ts" setup>
import VirtualDataManager from "@/components/virtualTable/core/VirtualDataManager";
import VirtualTable from "@/components/virtualTable/view/VirtualTable.vue";
import { DataSelectInfo, PathData, PathType, RangeInfo } from "@/types/page";
import { ITableColumn } from "@/types/table";
import { getRandomColor } from "@/utils/Color";
import { defineProps, ref, defineExpose, computed, defineEmits, watch } from "vue";

interface IProps {
  columns: Array<string | number>;
  data: Array<Array<string | number>>;
  showHeader?: boolean;
  selectMode?: boolean;
  selectInfo?: Array<DataSelectInfo>;
}

const emits = defineEmits(["change"]);

const props = defineProps<IProps>();

const selectRangeData = ref<Array<DataSelectInfo>>(props.selectInfo ?? []);

const nowSelect = ref<PathData>({
  path: [0, 0, 0, 0],
  selectRange: [0, 0, 0, 0],
  type: PathType.RANGE,
  color: getRandomColor(),
  pathName: "数据1",
});

const renderPath = computed(() => {
  const pathList: Array<PathData> = [nowSelect.value];
  selectRangeData.value.forEach((item) => {
    pathList.push(...item.path.filter((_) => _.type !== PathType.ROW));
  });
  return pathList;
});

const rowPath = computed(() => {
  const pathList: Array<PathData> = [nowSelect.value];
  selectRangeData.value.forEach((item) => {
    pathList.push(...item.path.filter((_) => _.type === PathType.ROW));
  });
  return pathList;
});

let colWidth = 0;

const createCol = (col: Array<string | number>): ITableColumn[] => {
  colWidth = ~~((800 - 55) / col.length) > 90 ? ~~(800 - 50 / col.length) : 120;
  return [
    {
      title: "",
      colKey: "rowPickKey",
      width: 50 + "px",
      fixed: "left",
    },
    ...col.map((item, index) => {
      return {
        title: index + "",
        colKey: index,
        width: colWidth + "px",
      };
    }),
  ];
};

let startSelect = false;
let selectIndex: undefined | number = 0;

const handleSelectStart = (event: MouseEvent, target: HTMLDivElement) => {
  if (selectIndex === undefined) {
    return;
  }
  const rect = target.getClientRects()[0];
  const x = event.clientX - rect.left + target.scrollLeft;
  const y = event.clientY - rect.top + target.scrollTop;
  startSelect = true;
  nowSelect.value.path = [x, y, x, y];
};

const handleSelectMove = (event: MouseEvent, target: HTMLDivElement) => {
  if (!startSelect || selectIndex === undefined) {
    return;
  }
  const rect = target.getClientRects()[0];
  nowSelect.value.path[2] = event.clientX - rect.left + target.scrollLeft;
  nowSelect.value.path[3] = event.clientY - rect.top + target.scrollTop;
};

const handleSelectEnd = (
  event: MouseEvent,
  horizontal: Array<number>,
  vertical: Array<number>,
  verticalSize: Array<number>
) => {
  if (!startSelect || selectIndex === undefined) {
    return;
  }
  const selectTemp = nowSelect.value.path;
  let startX = null;
  let startXIndex = 0;
  let endXIndex = 0;
  let endX = null;
  let selectRow = false;
  if (selectTemp[0] <= 50 && selectTemp[2] <= 50) {
    startX = 0;
    startXIndex = 0;
    endX = 0;
    endXIndex = horizontal.length - 1;
    selectRow = true;
  } else {
    for (let index = 0; index < horizontal.length; index++) {
      if (horizontal[index] >= selectTemp[0] - 50 && startX === null) {
        startX = (horizontal[index - 1] ?? 0) + 50;
        startXIndex = index - 1;
      }
      if (horizontal[index] >= selectTemp[2] - 50 && endX === null) {
        endX = (horizontal[index] ?? 0) + 50;
        endXIndex = index - 1;
      }
      if (horizontal[horizontal.length - 1] < selectTemp[0] - 50) {
        startX = horizontal[horizontal.length - 1] + 50;
        startXIndex = horizontal.length - 1;
      }
      if (horizontal[horizontal.length - 1] < selectTemp[2] - 50) {
        endX = horizontal[horizontal.length - 1] + 50 + colWidth;
        endXIndex = horizontal.length - 1;
      }
    }
  }
  let startY = null;
  let endY = null;
  let startYIndex = 0;
  let endYIndex = 0;
  for (let index = 0; index < vertical.length; index++) {
    if (vertical[index] >= selectTemp[1] && startY === null) {
      startY = vertical[index - 1] ?? 0;
      startYIndex = index - 1 === -1 ? 0 : index - 1;
    }
    if (vertical[index] >= selectTemp[3] && endY === null) {
      endY = vertical[index] ?? 0;
      endYIndex = index - 1;
    }
    if (selectTemp[3] > vertical[vertical.length - 1]) {
      endYIndex = vertical.length - 1;
      endY = vertical[vertical.length - 1] + verticalSize[verticalSize.length - 1];
    }
    if (selectTemp[1] > vertical[vertical.length - 1]) {
      startYIndex = vertical.length - 1;
      startY = vertical[vertical.length - 1];
    }
  }
  if (selectRow) {
    nowSelect.value.type = PathType.ROW;
    endYIndex = startYIndex;
    nowSelect.value.rowIndex = startYIndex;
  }
  nowSelect.value.path = [startX, startY, endX, endY] as RangeInfo;
  nowSelect.value.selectRange = [startXIndex, startYIndex, endXIndex, endYIndex];
  updateAndAddSelectRange();
  startSelect = false;
};

const dataManager = new VirtualDataManager(
  props.data,
  createCol(props.columns)
) as VirtualDataManager<unknown>;

const updateSelectIndex = (index: number) => {
  selectIndex = index;
};

const reportChange = () => {
  emits("change");
};

const handleHeaderClick = (col: ITableColumn, sizeList: number[], dataLength: number) => {
  if (!props.selectMode || selectIndex === undefined) {
    return;
  }
  nowSelect.value.path = [
    sizeList[col.colKey as number] + 50,
    0,
    sizeList[Number(`${col.colKey}`)] + 50 + colWidth,
    dataLength,
  ];
  nowSelect.value.selectRange = [col.colKey as number, 0, Number(`${col.colKey}`), dataLength];
  nowSelect.value.color = getRandomColor();
  nowSelect.value.type = PathType.COLUMN;
  updateAndAddSelectRange();
};

const updateAndAddSelectRange = () => {
  if (selectIndex === undefined) {
    return;
  }
  selectRangeData.value[selectIndex].path.push(JSON.parse(JSON.stringify(nowSelect.value)));
  Object.assign(nowSelect.value, {
    pathName: "数据" + (renderPath.value.length + 1),
    path: [0, 0, 0, 0],
    selectRange: [0, 0, 0, 0],
    type: PathType.RANGE,
    color: getRandomColor(),
  });
};

watch(
  selectRangeData.value,
  () => {
    reportChange();
  },
  { deep: true }
);

defineExpose({ updateSelectIndex });
</script>
