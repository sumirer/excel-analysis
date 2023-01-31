import { ITableColumn } from '@/types/table';
import { flatColumn } from '../utils/columnUtils';

export default class TableDataHolder {
  constructor(public columns: Array<ITableColumn>) {
    this.parseData(columns);
  }

  public leftFixedColumns: Array<ITableColumn> = [];

  public rightFixedColumns: Array<ITableColumn> = [];

  public otherColumns: Array<ITableColumn> = [];

  public headerRenderLeftFixedColumns: Array<ITableColumn> = [];

  public headerRenderRightFixedColumns: Array<ITableColumn> = [];

  public headerRenderOtherColumns: Array<ITableColumn> = [];

  public parseData(columns: Array<ITableColumn>): void {
    this.clearColumnData();
    columns.forEach((col) => {
      if (col.fixed === 'right') {
        this.headerRenderRightFixedColumns.push(col);
      } else if (col.fixed === 'left') {
        this.headerRenderLeftFixedColumns.push(col);
      } else {
        this.headerRenderOtherColumns.push(col);
      }
    });
    this.leftFixedColumns = flatColumn(this.headerRenderLeftFixedColumns);
    this.rightFixedColumns = flatColumn(this.headerRenderRightFixedColumns);
    this.otherColumns = flatColumn(this.headerRenderOtherColumns);
  }

  public clearColumnData(): void {
    this.leftFixedColumns = [];
    this.rightFixedColumns = [];
    this.otherColumns = [];
    this.headerRenderLeftFixedColumns = [];
    this.headerRenderRightFixedColumns = [];
    this.headerRenderOtherColumns = [];
  }
}
