import ExcelParser from "./ExcelParser";
import Excel from "exceljs";
import { computed, reactive } from "vue";
import { AnalysisData } from "@/types";

export interface IExcelInfo {
  name: string;
  sheets: Array<Excel.Worksheet>;
}

export class ExcelInfo {
  constructor(file: File) {
    this.loadFileInfo(file);
    this.parser = new ExcelParser();
    this.parser.readFile(file).then(() => {
      const sheets = this.parser.getSheetInfo();
      if (sheets.length > 0) {
        this.updateSheetName(sheets[0].name);
      }
      this.loaded = true;
      this.fileReadCallback();
    });
  }

  public pickExcelSheetData = reactive<{ value: Excel.RowValues[] }>({ value: [] });

  public dataRange = reactive({
    startX: 1,
    startY: 1,
    endX: 10,
    endY: 150,
  });

  public loaded = false;

  public fileName = "";

  public parser!: ExcelParser;

  public sheetName = reactive({ name: "" });

  public loadedCallbackList: Array<() => void> = [];

  public worksheets: Excel.Worksheet[] = [];

  public setupDataRange(xyStart: [number, number], xyEnd: [number, number]): void {
    this.dataRange = {
      startX: xyStart[0],
      startY: xyStart[1],
      endX: xyEnd[0],
      endY: xyEnd[1],
    };
  }

  public updateDefaultDataInfo(): void {
    this.pickExcelSheetData.value = this.parser.getAllCellDataWithSheetName(this.sheetName.name);
    let xLength = ((this.pickExcelSheetData.value[0] || this.pickExcelSheetData.value[1])?.length ??
      0) as number;
    xLength = xLength > 0 ? xLength : 0;
    const yLength = this.pickExcelSheetData.value.length;
    this.setupDataRange([1, 1], [xLength, yLength]);
  }

  public fileReadCallback(): void {
    this.loadedCallbackList.forEach((callback) => {
      callback();
    });
  }

  public updateSheetName(name: string): void {
    this.sheetName.name = name;
    this.updateDefaultDataInfo();
  }

  public loadFileInfo(file: File): void {
    this.fileName = file.name;
  }

  public getFileSheets(): Promise<Excel.Worksheet[]> {
    return new Promise((resolve) => {
      if (this.loaded) {
        resolve(this.parser.getSheetInfo());
      } else {
        this.loadedCallbackList.push(() => {
          resolve(this.parser.getSheetInfo());
        });
      }
    });
  }

  public async getExcelInfo(): Promise<IExcelInfo> {
    const sheets = await this.getFileSheets();
    this.worksheets.push(...sheets);
    return {
      sheets,
      name: this.fileName,
    };
  }

  public getExcelInfoAsync(): IExcelInfo | undefined {
    if (this.loaded) {
      return {
        sheets: this.parser.getSheetInfo(),
        name: this.fileName,
      };
    }
  }

  public getExcelData: AnalysisData = computed(() => {
    const { startX, startY, endX, endY } = this.dataRange;
    if (!this.parser.loaded.loaded) {
      return {
        col: [],
        data: [],
        dataInfo: {
          fileName: this.fileName,
          sheetName: "",
        },
      };
    }
    const result = this.getData(startX, endX, startY, endY);
    return {
      col: result[0],
      data: result,
      dataInfo: {
        fileName: this.fileName,
        sheetName: this.parser.workbook.getWorksheet(this.sheetName.name).name,
      },
    };
  }) as unknown as AnalysisData;

  public getData(
    startX: number,
    endX: number,
    startY: number,
    endY: number
  ): Array<Array<string | number>> {
    const data: Array<Array<string | number>> = [];
    for (let index = startY; index < endY; index++) {
      const rowData = [];
      for (let x = startX; x < endX; x++) {
        const row = this.pickExcelSheetData.value[index] as (string | number)[];
        rowData.push(row?.[x]);
      }
      data.push(rowData);
    }
    return data;
  }
}
