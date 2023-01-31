export interface ITableColumn {
  title?: string| number;
  width?: string;
  colKey: string | number;
  isSelectColumn?: boolean;
  widthDrag?: boolean;
  fixed?: 'left' | 'right';
  children?: Array<ITableColumn>;
}
