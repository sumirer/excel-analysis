import ExcelParser from "./ExcelParser";
import Excel from "exceljs";

export interface IExcelInfo {
  name: string;
  sheets: Array<Excel.Worksheet>;
}

export class ExcelInfo {
  constructor(file: File) {
    this.loadFileInfo(file);
    this.parser = new ExcelParser();
    this.parser.readFile(file).then(() => {
      this.loaded = true;
      this.fileReadCallback();
    });
  }

  public loaded = false;

  public fileName = "";

  public parser!: ExcelParser;

  public loadedCallbackList: Array<() => void> = [];

  public fileReadCallback(): void {
    this.loadedCallbackList.forEach((callback) => {
      callback();
    });
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
    return {
      sheets,
      name: this.fileName,
    };
  }
}
