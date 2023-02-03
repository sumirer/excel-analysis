import { IBaseData } from "@/types";

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

export type PartEditOmit<T, F extends keyof T> = {
  [K in keyof Omit<T, F>]?: {
    desc: string;
    value?: string | number;
    options?: Array<string | number>;
  };
};

export enum EFilterType {
  START,
  END,
  GROUP_BY,
}

export type PartOmitField = "filterType" | "name";

export abstract class Filter<T, O, C extends IBaseFIlterOption> {
  public abstract name: string;

  public abstract filterOptions: C;

  /**
   * 可编辑属性
   */
  public abstract editAttributes: PartEditOmit<C, PartOmitField>;

  /**
   * 接收数据，处理完毕后进行传递，进行中转后得到转换数据
   * @param data
   */
  public abstract receive(data: T): O;
}
