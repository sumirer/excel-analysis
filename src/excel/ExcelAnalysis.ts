import { computed, reactive } from "vue";
import { ExcelInfo } from "./ExcelInfo";

export class ExcelAnalysis {
  public excelList = reactive<Array<ExcelInfo>>([]);

  public addFile(file: File): void {
    this.excelList.push(new ExcelInfo(file));
  }

  public removeExcel(info: ExcelInfo): void {
    this.excelList.splice(this.excelList.indexOf(info), 1);
  }

  public getExcelData = computed(() => {
    return this.excelList.map((item) => item.getExcelData);
  });
}
