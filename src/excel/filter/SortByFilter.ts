import { IBaseData } from "@/types";
import { reactive } from "vue";
import { PartEditOmit, PartOmitField, EditPartType, FilterDataType, EFilterType } from "./Filter";
import { ESortType, ISortFilterOptions, SortFilter } from "./SortFilter";

interface ISortByFilterOptions extends ISortFilterOptions {
  sortBy: string;
}

export class SortByFilter extends SortFilter {
  public name = "数据排序（依据排序）";

  public editAttributes: PartEditOmit<ISortByFilterOptions, PartOmitField> = {
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
    sortBy: {
      desc: "排序依据",
      dataType: EditPartType.PICK,
    },
  };

  public filterOptions = reactive<ISortByFilterOptions>({
    name: "",
    type: FilterDataType.ROW,
    filterType: EFilterType.SORT,
    sortType: ESortType.Incremental,
    sortBy: "",
  });

//   public handleAttributeChange(value: ISortFilterOptions): void {
//     console.log("change", value);
//     if (value.sortType === ESortType.Incremental) {
//       this.updateDesc(`排序方式: 递增排列`);
//     } else {
//       this.updateDesc("排序方式: 递减排列");
//     }
//   }

  public receive(data: IBaseData): IBaseData {
    const first = data.length > 0 ? data[0] : [];
    const indexList = this.bubbleSort(first);
    const changeData = JSON.parse(JSON.stringify(data)) as IBaseData;
    return changeData.map((list) => {
      const nowList = [];
      for (const index of indexList) {
        nowList.push(list[index]);
      }
      list.splice(0, indexList.length - 1);
      return nowList.concat(list);
    });
  }

  /**
   * 冒泡排序，得到排序后的下标
   * @param list
   * @param desc
   * @returns
   */
  public bubbleSort(list: Array<number | string>, desc = ESortType.Incremental): Array<number> {
    const indexList = list.map((_, index) => index);
    const sortList = [...list];
    const length = sortList.length - 1;
    for (let i = 0; i < length; i++) {
      for (let j = 0; j < length - i - 1; j++) {
        if (
          (desc === ESortType.Incremental && sortList[j] > sortList[j + 1]) ||
          (desc === ESortType.Decrement && sortList[j] < sortList[j + 1])
        ) {
          const temp = sortList[j + 1];
          sortList[j + 1] = sortList[j];
          sortList[j] = temp;
          const indexTemp = indexList[j + 1];
          indexList[j + 1] = indexList[j];
          indexList[j] = indexTemp;
        }
      }
    }
    return indexList;
  }
}
