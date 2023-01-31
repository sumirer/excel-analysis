import Excel from "exceljs";
import { reactive } from "vue";

export default class ExcelParser {
  public workbook = new Excel.Workbook();

  public loaded = reactive({ loaded: false });

  public async readFile(file: File): Promise<void> {
    await this.workbook.xlsx.load(await file.arrayBuffer());
    this.loaded.loaded = true;
  }

  public getColumns(sheet: Excel.Worksheet): void {
    const cols = sheet.columns;
    cols.forEach((item) => {
      console.log("col", item);
    });
  }

  public getSheetInfo(): Array<Excel.Worksheet> {
    return this.workbook.worksheets;
  }

  public getAllCellDataWithSheetName(indexOrName: string | number): Excel.RowValues[] {
    const sheet = this.workbook.getWorksheet(indexOrName);
    return sheet.getSheetValues();
  }
}
