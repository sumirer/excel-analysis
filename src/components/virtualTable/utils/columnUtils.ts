import { ITableColumn } from '@/types/table';

export function flatColumn(columns: Array<ITableColumn>): Array<ITableColumn> {
  const newColumns: Array<ITableColumn> = [];
  columns.forEach((col) => {
    if (!col.children) {
      newColumns.push(col);
    } else {
      newColumns.push(...flatColumn(col.children));
    }
  });
  return newColumns;
}

export function getMaxColumnDeepLength(columns: Array<ITableColumn>): number {
  if (columns == null) return 0;
  let height = 0;
  let queue: Array<ITableColumn> = Array.from(columns);
  queue.push();
  let size = queue.length;
  while (queue.length > 0) {
    const node = queue.pop();
    queue = (node?.children ?? []).concat(queue);
    size -= 1;
    if (size === 0) {
      size = queue.length;
      height += 1;
    }
  }
  return height;
}
