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

export class GroupByFilter<O> extends Filter<
  Array<Array<string | number>>,
  O,
  IGroupByFilterOptions
> {
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

  public receive(data: Array<Array<string | number>>): any {
    return data;
  }
}
