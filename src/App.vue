<template>
  <FileManageModel
    :visible="showModel"
    @hide="showModel = false"
    @file-change="handleFilePick"
    :excel-list="excel.excelList"
    @delete="handleDeleteExcel"
  >
  </FileManageModel>
  <DataPreviewDialog
    v-if="showPreview"
    :visible="showPreviewVisible"
    :data="excel.getExcelData"
    @hide="showPreviewVisible = false"
    @hided="showPreview = false"
  ></DataPreviewDialog>
  <FilterConfigModal
    :visible="showFilterConfigVisible"
    @hide="showFilterConfigVisible = !showFilterConfigVisible"
    :data="excel.filters"
  ></FilterConfigModal>
  <DataSelectDialog
    v-if="showSelect"
    :visible="showDataSelectVisible"
    @hide="showDataSelectVisible = false"
    @hided="showSelect = false"
    :data="excelData"
  ></DataSelectDialog>
  <div class="tools-container">
    <div class="tool-item" @click="showModel = !showModel">
      <img class="tool-icon" src="./assets/excel.svg" />
      <span>已导入Excel</span>
    </div>
    <div class="tool-item" @click="handleOpenPreview">
      <img class="tool-icon" src="./assets/preview.svg" />
      <span>查看数据</span>
    </div>
    <div class="tool-item" @click="showFilterConfigVisible = !showFilterConfigVisible">
      <img class="tool-icon" src="./assets/filter.svg" />
      <span>配置漏斗</span>
    </div>
    <div v-if="excel.excelList.length > 0" class="tool-item" @click="handleOpenSelect">
      <img class="tool-icon" src="./assets/filter.svg" />
      <span>选择数据</span>
    </div>
  </div>
  <div class="body-container">
    <div></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, nextTick } from "vue";
import FileManageModel from "./views/FileManageModal.vue";
import "./views/index.scss";
import { ExcelAnalysis } from "./excel/ExcelAnalysis";
import DataPreviewDialog from "./views/DataPreviewDialog.vue";
import FilterConfigModal from "./views/FilterConfigModal.vue";
import { ExcelInfo } from "./excel/ExcelInfo";
import DataSelectDialog from "./views/DataSelectDialog.vue";
import "vue-select/dist/vue-select.css";

export default defineComponent({
  name: "App",
  components: {
    FileManageModel,
    DataPreviewDialog,
    FilterConfigModal,
    DataSelectDialog,
  },
  data() {
    return {
      excel: new ExcelAnalysis(),
      excelData: {
        data: [],
        dataInfo: {
          fileName: "",
          sheetName: "",
        },
        col: [],
        excelInfo: null as unknown as ExcelInfo
      },
      showModel: false,
      showPreview: false,
      showPreviewVisible: false,
      showFilterConfigVisible: false,
      showDataSelectVisible: false,
      showSelect: false,
    };
  },
  methods: {
    handleFilePick(files: FileList) {
      for (let index = 0; index < files.length; index++) {
        const file = files.item(index);
        if (file) {
          this.excel.addFile(file);
        }
      }
    },
    handleOpenPreview() {
      this.showPreview = !this.showPreview;
      nextTick(() => {
        this.showPreviewVisible = !this.showPreviewVisible;
      });
    },
    handleOpenSelect() {
      this.showSelect = true;
      Object.assign(this.excelData, this.excel.getExcelData[0]);
      nextTick(() => {
        this.showDataSelectVisible = !this.showDataSelectVisible;
      });
    },
    handleDeleteExcel(excel: ExcelInfo) {
      this.excel.removeExcel(excel);
    },
  },
  mounted() {
    setTimeout(() => {
      document.getElementById("loading-mask")?.classList.add("hidden");
      setTimeout(() => {
        this.showModel = true;
      }, 200);
    }, 1000);
  },
});
</script>

<style lang="scss">
#app {
  font-family: Tahoma, Arial, "Helvetica Neue", "Hiragino Sans GB", Simsun, sans-self;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
