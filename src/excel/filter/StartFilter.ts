import { IBaseData, IFilterSelectData } from "@/types";
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

interface IStartFilter extends IBaseFIlterOption {
  data: IFilterSelectData;
}

export class StartFilter extends Filter<IBaseData, IBaseData, IStartFilter> {
  public name = "数据选择（开始）";
  public filterOptions = reactive<IStartFilter>({
    name: "",
    type: FilterDataType.ROW,
    filterType: EFilterType.SORT,
    data: [],
  });

  public editAttributes: PartEditOmit<IStartFilter, PartOmitField> = {
    data: {
      desc: "选择的数据集",
      dataType: EditPartType.PICK,
    },
  };
  public receive(data: IBaseData): IBaseData {
    return data;
  }
  public handleAttributeChange(value: IStartFilter): void {
    console.log(value);
  }
}
