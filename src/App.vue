<template>
  <Model :visible="showModel" @hide="showModel = false">
    <div>Excel列表</div>
    <div>
      <ExcelCard
        v-for="(item, index) in excel.excelList"
        :data="item"
        :key="index"
        :index="index"
      ></ExcelCard>
    </div>
    <FileUpload @file-change="handleFilePick" />
  </Model>
  <div class="body-header">
    <div class="model-open" @click="showModel = !showModel">已导入Excel</div>
  </div>
  <div class="body-container">
    <div></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ExcelCard from "./views/ExcelCard.vue";
import FileUpload from "./views/FileUpload.vue";
import Model from "./views/Model.vue";
import "./views/index.scss";
import { ExcelAnalysis } from "./excel/ExcelAnalysis";

export default defineComponent({
  name: "App",
  components: {
    FileUpload,
    ExcelCard,
    Model,
  },
  data() {
    return {
      excel: new ExcelAnalysis(),
      showModel: false,
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
