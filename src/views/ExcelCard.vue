<template>
  <div class="excel-card-container">
    <div v-if="loading" class="loading">
      <img src="../assets/loading.svg" />
    </div>
    <div>
      <img src="../assets/close.svg" class="card-close" @click="handleDelete" />
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
import { defineProps, ref, onBeforeMount, defineEmits } from "vue";

interface IProps {
  data: ExcelInfo;
  index: number;
}

const info = ref<IExcelInfo>({
  name: "",
  sheets: [],
});

const emits = defineEmits(["delete"]);

const loading = ref(true);

const props = defineProps<IProps>();

const handleSelectName = (name: string) => {
  props.data.updateSheetName(name);
};

const handleDelete = () => {
  emits("delete");
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
