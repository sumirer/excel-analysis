<template>
  <div class="model-container" :class="{ visible: props.visible }">
    <div class="mask" @click="handleHide"></div>
    <div
      class="modal-container left-container"
      @dragenter="handleDragEnter"
      @dragleave="handleDragLeave"
      @drop="handleFileDrop"
      @dragover="handleDragOver"
    >
      <div class="title">当前加载文件列表，可拖拽或者选择文件加载</div>
      <div>
        <ExcelCard
          v-for="(item, index) in props.excelList"
          :data="item"
          :key="index"
          :index="index"
        ></ExcelCard>
      </div>
      <FileUpload @file-change="handleFilePick" />
    </div>
    <div class="upload-mask" :class="{ 'show-upload': showUploadMask }">
      拖入此区域加载文件(.xls、.xslx)
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ExcelInfo } from "@/excel/ExcelInfo";
import { defineProps, defineEmits, ref } from "vue";
import ExcelCard from "./ExcelCard.vue";
import FileUpload from "./FileUpload.vue";

interface IProps {
  visible: boolean;
  excelList: Array<ExcelInfo>;
}

const props = defineProps<IProps>();

const showUploadMask = ref(false);

const emits = defineEmits(["hide", "file-change"]);

const handleHide = () => {
  emits("hide");
};

const handleFilePick = (fileList: FileList) => {
  emits("file-change", fileList);
};

const handleDragEnter = () => {
  showUploadMask.value = true;
};
const handleDragLeave = () => {
  showUploadMask.value = false;
};

const handleDragOver = (event: Event) => {
  event.preventDefault();
};

const handleFileDrop = (event: DragEvent) => {
  showUploadMask.value = false;
  event.preventDefault();
  const files = event.dataTransfer?.files;
  if (files) {
    handleFilePick(files);
  }
};
</script>
