<template>
  <div class="drag-viewport">
    <div class="filter-title">当前可用漏斗</div>
    <div class="filter-list-container">
      <div
        v-for="(filter, index) in defaultFilterList"
        :key="index"
        @click="filter.addCallback"
        class="filter-item"
      >
        {{ filter.name }}
      </div>
    </div>
    <svg
      @mouseout.left="handleMouseStop"
      @mousemove.left.stop.prevent="handleMouseMove($event)"
      @mouseup.left.stop.prevent="handleMouseStop"
      @mousedown.left.stop.prevent="handleViewportDown"
      :viewBox="viewBox.join(' ')"
      @wheel="handleMouseWheel"
      ref="svgRef"
    >
      <g
        v-for="path in filters"
        :key="path.id"
        @mousedown.left.stop.prevent="handleMouseDown($event, path)"
        @mouseup.left.stop.prevent="handleMouseUp(path)"
      >
        <rect
          :x="path.x"
          :y="path.y"
          width="100"
          height="100"
          fill="#ffbf6980"
          rx="10"
          ry="10"
          stroke="#ff9f1c"
        ></rect>
        <text :x="path.x + 10" :y="path.y + 17" style="font-size: 14px">{{ path.name }}</text>
      </g>
      <path
        v-for="(line, index) in linkLine"
        :key="index"
        :d="`M ${line[0].x},${line[0].y} C ${line[0].cx},${line[0].cy} ${line[1].cx},${line[1].cy} ${line[1].x},${line[1].y}`"
        stroke="#ff9f1c"
        fill="none"
      ></path>
    </svg>
  </div>
</template>

<script lang="ts" setup>
import { IFilterSource } from "@/excel/filter/Filter";
import { GroupByFilter } from "@/excel/filter/GroupByFilter";
import { ISvgCardPath, ISvgPath } from "@/types";
import { computed, ref, defineEmits, onMounted } from "vue";

const defaultFilterList = [
  {
    name: "分组",
    addCallback: () => addFilter(new GroupByFilter()),
  },
  {
    name: "分组",
    addCallback: () => addFilter(new GroupByFilter()),
  },
  {
    name: "分组",
    addCallback: () => addFilter(new GroupByFilter()),
  },
  {
    name: "分组",
    addCallback: () => addFilter(new GroupByFilter()),
  },
  {
    name: "分组",
    addCallback: () => addFilter(new GroupByFilter()),
  },
  {
    name: "分组",
    addCallback: () => addFilter(new GroupByFilter()),
  },
  {
    name: "分组",
    addCallback: () => addFilter(new GroupByFilter()),
  },
  {
    name: "分组",
    addCallback: () => addFilter(new GroupByFilter()),
  },
  {
    name: "分组",
    addCallback: () => addFilter(new GroupByFilter()),
  },
  {
    name: "分组",
    addCallback: () => addFilter(new GroupByFilter()),
  },
  {
    name: "分组",
    addCallback: () => addFilter(new GroupByFilter()),
  },
  {
    name: "分组",
    addCallback: () => addFilter(new GroupByFilter()),
  },
  {
    name: "分组",
    addCallback: () => addFilter(new GroupByFilter()),
  },
  {
    name: "分组",
    addCallback: () => addFilter(new GroupByFilter()),
  },
];

const createDefaultFilterData = () => {
  const pathData: Array<ISvgCardPath<IFilterSource>> = [
    {
      x: 200,
      y: 100,
      name: "起始",
      id: Date.now() + Math.random() + "_0",
    },
  ];
  pathData.push({
    x: 200,
    y: 400,
    name: "结束",
    id: Date.now() + Math.random() + "_" + pathData.length + 1,
  });
  return pathData;
};

const filters = ref<Array<ISvgCardPath<IFilterSource>>>(createDefaultFilterData());

const addFilter = (filter: IFilterSource) => {
  const last = filters.value[filters.value.length - 1];
  filters.value[filters.value.length - 1] = {
    x: 200,
    y: 100,
    name: filter.name,
    data: filter,
    id: Date.now() + Math.random() + "_" + (filters.value.length + 1),
  };
  filters.value.push(last);
};

const emits = defineEmits(["focus"]);

const viewBox = ref<[number, number, number, number]>([0, 0, 800, 764]);

const linkLine = computed<ISvgPath[][]>(() => {
  return filters.value.reduce((preValue, { x, y }, index) => {
    if (preValue.length === 0) {
      preValue.push([{ x: x + 50, y: y + 100, cx: x + 50, cy: y + 150 }]);
    } else {
      const vBefore = preValue[preValue.length - 1];
      const lastPoint = vBefore[0];
      const pointX = x + 50;
      const pointY = y;
      let cPointX = pointX;
      let cPointY = pointY - 50;
      if (lastPoint.x > pointX) {
        if (lastPoint.y > pointY) {
          cPointX += 100;
          lastPoint.cx -= 100;
        } else {
          cPointX += 50;
          lastPoint.cx -= 50;
        }
      } else {
        if (lastPoint.y > pointY) {
          cPointX -= 100;
          lastPoint.cx += 100;
        } else {
          cPointX -= 50;
          lastPoint.cx += 50;
        }
      }
      vBefore.push({ x: x + 50, y: y, cx: cPointX, cy: cPointY });
      if (index !== filters.value.length - 1) {
        preValue.push([{ x: x + 50, y: y + 100, cx: x + 50, cy: y + 150 }]);
      }
    }
    return preValue;
  }, [] as ISvgPath[][]);
});
const svgRef = ref<SVGAElement>();
const nowFocusId = ref("");
const lastPoint = { x: 0, y: 0 };
const recordPoint = { x: 0, y: 0 };
let recordObject: ISvgCardPath<IFilterSource>;
let clickDownTime = 0;

onMounted(() => {
  if (svgRef.value) {
    const rect = svgRef.value.getClientRects()[0];
    viewBox.value = [0, 0, rect.width, rect.height];
  }
});

const handleMouseDown = (event: MouseEvent, path: ISvgCardPath<IFilterSource>) => {
  nowFocusId.value = path.id;
  Object.assign(lastPoint, { x: event.clientX, y: event.clientY });
  Object.assign(recordPoint, { x: path.x, y: path.y });
  recordObject = path;
  clickDownTime = Date.now();
};

let lastViewPortRecord: { x: number; y: number } | undefined;
let lastViewportSize:
  | { x: number; y: number; eX: number; eY: number; width: number; height: number }
  | undefined;

const handleMouseMove = (event: MouseEvent) => {
  if (!nowFocusId.value) {
    if (lastViewPortRecord && lastViewportSize) {
      // 画布移动
      const { x, y, eX, eY, width, height } = lastViewportSize;
      const zoomLevelX = width / (eX - x);
      const zoomLevelY = height / (eY - y);
      const dx = (event.clientX - lastViewPortRecord.x) * zoomLevelX;
      const dy = (event.clientY - lastViewPortRecord.y) * zoomLevelY;
      viewBox.value[0] = x - dx;
      viewBox.value[1] = y - dy;
      viewBox.value[2] = eX - dx;
      viewBox.value[3] = eY - dy;
    }
    return;
  }
  recordObject.x = event.clientX - lastPoint.x + recordPoint.x;
  recordObject.y = event.clientY - lastPoint.y + recordPoint.y;
};

const handleMouseWheel = (event: WheelEvent) => {
  const deltaY = event.deltaY;
  const pointX = event.offsetX;
  const pointY = event.offsetY;
  const rect = (event.target as SVGAElement).getClientRects()[0];
  const svgWidth = rect.width;
  const svgHeight = rect.height;
  let zoom = 0.1;
  if (deltaY < 0) {
    zoom = -0.1;
  }
  const [x, y, eX, eY] = viewBox.value;
  viewBox.value[0] = x - pointX * zoom;
  viewBox.value[1] = y - pointY * zoom;
  viewBox.value[2] = (svgWidth - pointX) * zoom + eX;
  viewBox.value[3] = (svgHeight - pointY) * zoom + eY;
};

const handleViewportDown = (event: MouseEvent) => {
  lastViewPortRecord = {
    x: event.clientX,
    y: event.clientY,
  };
  const [x, y, eX, eY] = viewBox.value;
  const rect = (event.target as SVGAElement).getClientRects()[0];
  lastViewportSize = { x, y, eX, eY, width: rect.width, height: rect.height };
};

const handleMouseUp = (path: ISvgCardPath<IFilterSource>) => {
  if (nowFocusId.value && clickDownTime !== 0 && Date.now() - clickDownTime < 200) {
    handleFocus(path);
  }
  clickDownTime = 0;
  handleMouseStop();
};

const handleMouseStop = () => {
  nowFocusId.value = "";
  lastViewPortRecord = undefined;
  lastViewportSize = undefined;
};

const handleFocus = (path: ISvgCardPath<IFilterSource>) => {
  emits("focus", path);
};
</script>
