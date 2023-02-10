import { IBaseData } from "@/types";
import { reactive } from "vue";
import {
  EditPartType,
  EFilterType,
  Filter,
  FilterDataType,
  IBaseFIlterOption,
  PartEditOmit,
  PartOmitField,
} from "./Filter";

export enum ESortType {
  /**
   * 递减
   */
  Decrement = "Decrement",
  /**
   * 递增
   */
  Incremental = "Incremental",
}

export interface ISortFilterOptions extends IBaseFIlterOption {
  sortType: ESortType;
}

export class SortFilter extends Filter<
  IBaseData,
  IBaseData,
  ISortFilterOptions
> {
  public name = "数据排序";

  public editAttributes: PartEditOmit<ISortFilterOptions, PartOmitField> = {
    sortType: {
      desc: "排序方式",
      dataType: EditPartType.SELECT,
      options: [
        {
          label: "递增",
          value: ESortType.Incremental,
        },
        {
          label: "递减",
          value: ESortType.Decrement,
        },
      ],
    },
  };

  public filterOptions = reactive<ISortFilterOptions>({
    name: "",
    type: FilterDataType.ROW,
    filterType: EFilterType.SORT,
    sortType: ESortType.Incremental,
  });

  public handleAttributeChange(value: ISortFilterOptions): void {
    console.log("change", value);
    if (value.sortType === ESortType.Incremental) {
      this.updateDesc("排序方式: 递增排列");
    } else {
      this.updateDesc("排序方式: 递减排列");
    }
  }

  public receive(data: IBaseData): IBaseData {
    if (this.filterOptions.sortType == ESortType.Incremental) {
      return data.map((list) => list.sort((a, b) => (a > b ? -1 : 1)));
    } else {
      return data.map((list) => list.sort((a, b) => (a < b ? -1 : 1)));
    }
  }
}
