<template>
  <div class="upload-container">
    <input class="file-input" type="file" multiple @change="handleFileChange" />
    <div>点击添加Excel文件</div>
  </div>
</template>

<script lang="ts" setup>
import { defineEmits } from "vue";

const emits = defineEmits(["fileChange"]);

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const fileList = target.files;
  emits("fileChange", fileList);
  target.files = null;
  target.value = '';
};
</script>
