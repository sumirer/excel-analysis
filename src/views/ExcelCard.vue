<template>
  <div class="excel-card-container">
    <div v-if="loading" class="loading">
      <img src="../assets/loading.svg" />
    </div>
    <div>
      <div class="file-title">{{ info.name }}</div>
      <div class="flex-container tag-info-container">
        <div>内部表名称:</div>
        <div class="flex-container tag-list">
          <span
            class="excel-sheet-tag"
            v-for="(sheet, index) in info.sheets"
            :key="index"
            :class="{ select: sheet.name === props.data.sheetName.name }"
            @click="handleSelectName(sheet.name)"
            >{{ sheet.name }}</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ExcelInfo, IExcelInfo } from "@/excel/ExcelInfo";
import { defineProps, ref, onBeforeMount } from "vue";

interface IProps {
  data: ExcelInfo;
  index: number;
}

const info = ref<IExcelInfo>({
  name: "",
  sheets: [],
});

const loading = ref(true);

const props = defineProps<IProps>();

const handleSelectName = (name: string) => {
  props.data.updateSheetName(name);
};

onBeforeMount(() => {
  props.data.getExcelInfo().then((res) => {
    info.value = res;
    setTimeout(() => {
      loading.value = false;
    }, 1000);
  });
});
</script>
