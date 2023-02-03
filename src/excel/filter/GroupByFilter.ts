import { IBaseData } from "@/types";
import { reactive } from "vue";
import {
  Filter,
  IBaseFIlterOption,
  FilterDataType,
  EFilterType,
  PartEditOmit,
  PartOmitField,
} from "./Filter";

export enum IGroupByType {
  VALUE,
  SELECT,
}

export interface IGroupByFilterOptions extends IBaseFIlterOption {
  groupByValue: number | string;
  groupType: IGroupByType;
}

export class GroupByFilter extends Filter<
  Array<Array<string | number>>,
  IBaseData,
  IGroupByFilterOptions
> {
  public name = "分组";

  public editAttributes: PartEditOmit<IGroupByFilterOptions, PartOmitField> = {
    groupType: {
      desc: "选择数据模式",
      value: "",
    },
  };

  public filterOptions = reactive({
    name: "",
    type: FilterDataType.ROW,
    groupType: IGroupByType.VALUE,
    groupByValue: "",
    filterType: EFilterType.GROUP_BY,
  });

  public receive(data: IBaseData): IBaseData {
    return data;
  }
}
