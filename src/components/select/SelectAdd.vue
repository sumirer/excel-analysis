<template>
  <div>
    <div v-for="(data, index) in props.modelValue" :key="index">
      {{ data.name }}
    </div>
    <Select
      :options="props.options"
      :value="props.modelValue"
      :reduce="(option: any) => option.data"
      @change="handleSelectChange"
    ></Select>
  </div>
</template>

<script setup lang="ts">
import Select from "vue-select";
import { defineProps, defineEmits } from "vue";
import { IFilterSelectData } from "@/types";

type IProps = {
  modelValue: IFilterSelectData;
  options: IFilterSelectData;
};

const emits = defineEmits(["update:modelValue"]);

const props = defineProps<IProps>();

const handleSelectChange = (changeData: IFilterSelectData) => {
  console.log(changeData);
  emits("update:modelValue", []);
};
</script>
