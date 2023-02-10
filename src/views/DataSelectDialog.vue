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
          @change="handleDataUpdate"
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
            <div class="card-title">
              <span>名称:</span>
              <input v-model="item.name" class="card-input" />
            </div>
            <div v-for="(path, index) in item.path" :key="index" class="path-edit-card">
              <img
                src="../assets/close.svg"
                class="edit-remove"
                @click="handleRemoveItem(item.path, path)"
              />
              <div class="card-item">
                <span>数据名称: </span>
                <input v-model="path.pathName" class="card-input" />
              </div>
              <div>数据范围: [{{ path.selectRange.join(",") }}]</div>
              <div class="card-item">
                标记颜色:
                <span
                  style="display: inline-block; width: 10px; height: 10px; margin-left: 5px"
                  :style="{ background: path.color }"
                ></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { AnalysisData } from "@/types";
import { DataSelectInfo, PathData } from "@/types/page";
import { defineProps, defineEmits, ref } from "vue";
import DataTable from "./DataTable.vue";

interface IProps {
  visible: boolean;
  data: AnalysisData;
}

interface IDataTableRef {
  updateSelectIndex: (index: number) => void;
}

const props = defineProps<IProps>();

const dataTableRef = ref<IDataTableRef>();

const currentIndex = ref<number | undefined>(0);

const getPropsData = props.data.excelInfo.getSelectRangeData();

const dataSelect = ref<Array<DataSelectInfo>>(
  getPropsData.length === 0
    ? [
        { name: "横向标题", path: [], selectKey: "horizontal" },
        { name: "标题", path: [], selectKey: "horizontal" },
        { name: "数据", path: [], selectKey: "data" },
      ]
    : getPropsData
);

const emits = defineEmits(["hide", "hided"]);

const updateIndex = (index: number) => {
  if (dataTableRef.value) {
    dataTableRef.value.updateSelectIndex(index);
  }
  currentIndex.value = index;
};

const handleDataUpdate = () => {
  props.data.excelInfo.updateSelectRange(JSON.parse(JSON.stringify(dataSelect.value)));
};

const handleRemoveItem = (path: Array<PathData>, item: PathData) => {
  path.splice(path.indexOf(item), 1);
};

const handleHide = () => {
  emits("hide");
  setTimeout(() => {
    emits("hided");
  }, 200);
};
</script>
