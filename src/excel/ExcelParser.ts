import Excel from "exceljs";

export default class ExcelParser {
  public workbook = new Excel.Workbook();

  public async readFile(file: File): Promise<void> {
    await this.workbook.xlsx.load(await file.arrayBuffer());
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
}
