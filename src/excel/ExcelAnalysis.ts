import { reactive } from "vue";
import { ExcelInfo } from "./ExcelInfo";

export class ExcelAnalysis {
  public excelList = reactive<Array<ExcelInfo>>([]);

  public dataRange = {
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
  };

  public addFile(file: File): void {
    this.excelList.push(new ExcelInfo(file));
  }

  public removeExcel(info: ExcelInfo): void {
    this.excelList.splice(this.excelList.indexOf(info), 1);
  }

  public setupDataRange(xyStart: [number, number], xyEnd: [number, number]): void {
    this.dataRange = {
      startX: xyStart[0],
      startY: xyStart[1],
      endX: xyEnd[0],
      endY: xyEnd[1],
    };
  }
}
