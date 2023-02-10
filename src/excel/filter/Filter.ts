import { IBaseData, IFilterSelectData } from "@/types";
import { reactive, watch, Ref } from "vue";

export enum FilterDataType {
  COLUMN,
  ROW,
}

export type IFilterSource = Filter<IBaseData, IBaseData, IBaseFIlterOption>;

export interface IBaseFIlterOption {
  name: string;
  type: FilterDataType;
  filterType: EFilterType;
}

export enum EditPartType {
  SELECT,
  INPUT,
  PICK,
}

export type PartEditOmit<T, F extends keyof T> = {
  [K in keyof Omit<T, F>]?: {
    desc: string;
    value?: string | number;
    dataType: EditPartType;
    options?: Array<string | number | IOption>;
  };
};

export interface IOption {
  label: string;
  value: unknown;
}

export enum EFilterType {
  START,
  END,
  GROUP_BY,
  SORT,
}

export type PartOmitField = "filterType" | "name";

export abstract class Filter<T, O, C extends IBaseFIlterOption> {
  constructor() {
    setTimeout(() => {
      this.bindWatch();
    });
  }

  public abstract name: string;

  public abstract filterOptions: C;

  /**
   * 当前选中的数据
   */
  public selectData = reactive<{ value: IFilterSelectData }>({ value: [] }) as {
    value: IFilterSelectData;
  };

  /**
   * 可编辑属性
   */
  public abstract editAttributes: PartEditOmit<C, PartOmitField>;

  /**
   * 接收数据，处理完毕后进行传递，进行中转后得到转换数据
   * @param data
   */
  public abstract receive(data: T): O;

  /**
   * 描述
   */
  public desc = reactive<{ value: string }>({ value: "" });

  /**
   * 属性变化回调
   * @param value
   */
  public abstract handleAttributeChange(value: C): void;

  /**
   * 更新显示描述
   * @param text
   */
  public updateDesc(text: string): void {
    this.desc.value = text;
  }

  public bindWatch(): void {
    watch(
      this.filterOptions as unknown as Ref,
      (value) => {
        this?.handleAttributeChange?.(value);
      },
      { deep: true }
    );
  }

  public updateSelectData(selectData: IFilterSelectData): void {
    this.selectData.value = selectData;
  }
}
