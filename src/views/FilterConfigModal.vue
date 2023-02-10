<template>
  <div class="model-container" :class="{ visible: props.visible }">
    <div class="mask" @click="handleHide"></div>
    <div class="modal-container right-container flex-column">
      <div class="title">漏斗配置</div>
      <DragContainer @focus="handleEditAttributes" :data="props.data"></DragContainer>
      <div class="modal-container inner-modal" :class="{ 'inner-modal-visible': innerVisible }">
        <div class="title">配置项</div>
        <div>
          <div>操作选项</div>
          <div class="filter-op-container">
            <div class="file-op-item" @click="innerVisible = false">收起</div>
            <div class="file-op-item">删除</div>
            <div class="file-op-item">重新连接</div>
          </div>
        </div>
        <div class="filter-container">
          <div
            v-for="(value, key) in editFilterData?.data?.editAttributes"
            :key="key"
            class="filter-edit-card"
          >
            <div class="filter-edit-item">属性名称: {{ value?.desc }}</div>
            <div class="filter-edit-item">
              <div class="filter-item-title">数据值</div>
              <VueSelect
                v-if="value?.dataType === EditPartType.SELECT"
                style="width: 80%"
                :clearable="false"
                :options="value.options"
                v-model.value="editFilterData!.data!.filterOptions[key]"
                :reduce="(option: any) => option.value"
              ></VueSelect>
              <input
                v-if="value?.dataType === EditPartType.INPUT"
                v-model="editFilterData!.data!.filterOptions[key]"
              />
              <SelectAdd
                v-if="value?.dataType === EditPartType.PICK"
                style="width: 80%"
                v-model="editFilterData!.data!.filterOptions[key]"
                :options="editFilterData!.data!.selectData.value"
              ></SelectAdd>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits, ref } from "vue";
import DragContainer from "./DragContainer.vue";
import { IFilterSource, EditPartType } from "@/excel/filter/Filter";
import { ISvgCardPath } from "@/types";
import VueSelect from "vue-select";
import { LinkedMap } from "@/utils/LinkedMap";
import SelectAdd from "@/components/select/SelectAdd.vue";

interface IProps {
  visible: boolean;
  data: LinkedMap<IFilterSource>;
}

const innerVisible = ref(false);

const editFilterData = ref<ISvgCardPath<IFilterSource>>();

const props = defineProps<IProps>();

const emits = defineEmits(["hide"]);

const handleHide = () => {
  innerVisible.value = false;
  emits("hide");
};

const handleEditAttributes = (path: ISvgCardPath<IFilterSource>) => {
  console.log(path);
  innerVisible.value = true;
  editFilterData.value = path;
};
</script>
