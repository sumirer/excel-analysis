<template>
  <div class="table-wrapper">
    <VirtualTable :dataManager="dataManager" style="height: 100%"></VirtualTable>
  </div>
</template>

<script lang="ts" setup>
import VirtualDataManager from "@/components/virtualTable/core/VirtualDataManager";
import VirtualTable from "@/components/virtualTable/view/VirtualTable.vue";
import { defineProps } from "vue";

interface IProps {
  columns: Array<string | number>;
  data: Array<Array<string | number>>;
}

const props = defineProps<IProps>();

const createCol = (col: Array<string | number>) => {
  const width = ~~(800 / col.length) > 90 ? ~~(800 / col.length) : 120;
  return col.map((item, index) => {
    return {
      title: item || "",
      colKey: index,
      width: width + "px",
    };
  });
};

const dataManager = new VirtualDataManager(
  props.data,
  createCol(props.columns)
) as VirtualDataManager<unknown>;
</script>
