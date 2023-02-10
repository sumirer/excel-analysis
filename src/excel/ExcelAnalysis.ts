import { IAnalysisResult } from "@/types/data";
import { LinkedMap } from "@/utils/LinkedMap";
import { computed, reactive } from "vue";
import { ExcelInfo } from "./ExcelInfo";
import { IFilterSource } from "./filter/Filter";

export class ExcelAnalysis {
  public excelList = reactive<Array<ExcelInfo>>([]);

  public filters = new LinkedMap<IFilterSource>();

  public addFile(file: File): void {
    this.excelList.push(new ExcelInfo(file));
  }

  public removeExcel(info: ExcelInfo): void {
    this.excelList.splice(this.excelList.indexOf(info), 1);
  }

  public getExcelData = computed(() => {
    return this.excelList.map((item) => item.getExcelData);
  });

  public getAnalysisData(): IAnalysisResult {
    let data = JSON.parse(JSON.stringify(this.filters.firstNode?.selectData));
    for (const filter of this.filters) {
      const value = filter?.getValue();
      data = value?.receive(data);
    }
    return {
      showName: "分析结果",
      data: data,
      desc: [],
    };
  }
}
