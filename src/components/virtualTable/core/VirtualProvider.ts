import { ICellSize, IRenderData, IScrollPosition, ITableLayout, LifeCycle } from "@/types/virtual";
import { reactive, RendererElement, RendererNode, VNode, nextTick, computed } from "vue";
import { ITableColumn } from "@/types/table";
import ResizeObserver from "resize-observer-polyfill";

export class VirtualProvider implements LifeCycle {
  public sizeCache = reactive<{
    horizontal: Array<number>;
    vertical: Array<number>;
  }>({
    horizontal: [],
    vertical: [],
  });

  public cellSize = reactive<{
    horizontal: Array<number>;
    vertical: Array<number>;
  }>({
    horizontal: [],
    vertical: [],
  });

  public renderInfo = reactive<IRenderData>({
    horizontalStartIndex: 0,
    horizontalEndIndex: 0,
    verticalStartIndex: 0,
    verticalEndIndex: 0,
  });

  public layout = reactive<ITableLayout>({
    areaWidth: 0,
    areaHeight: 0,
    leftFixedWidth: 0,
    rightFixedWidth: 0,
    viewportHeight: 0,
    viewportWidth: 0,
    renderFillDistance: 100,
    headerHeight: 40,
    scrollBodyHeight: 0,
    scrollBodyWidth: 0,
  });

  public hoverIndex = reactive<{ value: number }>({ value: -1 });

  public scrollMaxWidth = computed(
    () =>
      this.layout.areaWidth -
      this.layout.scrollBodyWidth +
      this.layout.leftFixedWidth +
      this.layout.rightFixedWidth
  );

  /**
   * 记录上次渲染的位置，用于判断渲染位置，减少计算量
   */
  public lastRenderPositionRecord = {
    scrollX: 0,
    scrollY: 0,
    horizontalIndex: 0,
    verticalIndex: 0,
  };

  public scrollPosition = { x: 0, y: 0 };

  public sizeObserver: ResizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]) =>
    this.handleSizeChange(entries)
  );

  public getCellSize(rowIndex: number, columnIndex: number): ICellSize {
    if (rowIndex > this.sizeCache.vertical.length) {
      throw RangeError(
        "row size out of range, the max size is: " +
          this.sizeCache.vertical.length +
          ", get size: " +
          rowIndex
      );
    }
    return {
      width: this.sizeCache.horizontal[columnIndex],
      height: this.sizeCache.vertical[rowIndex],
    };
  }

  public updateHoverIndex(index: number): void {
    this.hoverIndex.value = index;
  }

  /**
   * 对表格进行布局更改，每个cell对应一个偏移距离，将距离缓存，不用每次计算造成消耗
   * @param updateRowIndex 开始更新的行的索引
   * @param updateColumnIndex 开始更新的列索引
   * @param updateHorizontal 是否更新水平方向的偏移量
   * @param updateVertical  是否更新竖直方向的偏移量
   */
  public reLayoutCell(
    updateRowIndex?: number,
    updateColumnIndex?: number,
    updateHorizontal = true,
    updateVertical = true
  ): void {
    if (updateHorizontal) {
      let recordWidth =
        updateColumnIndex != undefined ? this.cellSize.horizontal[updateColumnIndex] : 0;
      const horizontalLength = this.sizeCache.horizontal.length;
      for (let index = updateColumnIndex ?? 0; index < horizontalLength; index++) {
        const horizontalWidth = this.sizeCache.horizontal[index];
        this.cellSize.horizontal[index] = recordWidth;
        recordWidth += horizontalWidth;
      }
      this.layout.areaWidth = recordWidth;
    }
    if (updateVertical) {
      let recordHeight = updateRowIndex != undefined ? this.cellSize.vertical[updateRowIndex] : 0;
      const verticalLength = this.sizeCache.vertical.length;
      for (let index = updateRowIndex ?? 0; index < verticalLength; index++) {
        const verticalHeight = this.sizeCache.vertical[index];
        this.cellSize.vertical[index] = recordHeight;
        recordHeight += verticalHeight;
      }
      this.layout.areaHeight = recordHeight;
    }
  }

  /**
   * 设置行的高度
   * @param columnIndex 行下标索引
   * @param width 宽度
   */
  public setRowWidth(columnIndex: number, width: number): void {
    if (width !== this.sizeCache.horizontal[columnIndex]) {
      this.sizeCache.horizontal[columnIndex] = width;
      this.reLayoutCell(undefined, columnIndex, true, false);
    }
  }

  public getRowWidth(columnIndex: number): number {
    return this.sizeCache.horizontal[columnIndex];
  }

  public setRowHeight(rowIndex: number, height: number): void {
    if (height !== this.sizeCache.vertical[rowIndex]) {
      this.sizeCache.vertical[rowIndex] = height;
      this.reLayoutCell(rowIndex, undefined, false, true);
    }
  }

  public getRowHeight(rowIndex: number): number {
    return this.sizeCache.vertical[rowIndex];
  }

  /**
   * 处理行的尺寸变化，用于更新行的大小，完成对布局的修改
   * @param entries
   */
  public handleSizeChange(entries: ResizeObserverEntry[]): void {
    let needUpdateSize = false;
    for (const element of entries) {
      const node = element.target as HTMLDivElement & {
        __vnode: VNode<RendererNode, RendererElement> & { ctx: { ctx: { rowIndex: number } } };
      };
      if (node.__vnode) {
        const vNode = node.__vnode.ctx.ctx;
        const rowIndex = vNode?.rowIndex ?? 0;
        const size = element.target.getClientRects()[0];
        if (size && this.sizeCache.vertical[rowIndex] !== size.height) {
          this.sizeCache.vertical[rowIndex] = size.height;
          if (!needUpdateSize) {
            needUpdateSize = true;
          }
        }
      }
    }
    if (needUpdateSize) this.reLayoutCell();
  }

  public addResizeObserver(element: Element): void {
    this.sizeObserver.observe(element);
  }

  public removeResizeObserver(element: Element): void {
    this.sizeObserver.unobserve(element);
  }

  public setupViewportData(element: HTMLDivElement): void {
    this.layout.viewportWidth = element.clientWidth;
    this.layout.viewportHeight = element.clientHeight;
  }

  /**
   * 初始化预设一个接近的高度，让行的高度有一个预设值，等行汇报当前渲染最高高度后，使用行最高高度
   * @param size
   * @param height
   */
  public initVerticalPresetSize(size: number, height: number, startIndex = 0): void {
    for (let index = startIndex; index < size; index++) {
      this.sizeCache.vertical[index] = height;
    }
  }

  public resizeDataVerticalSizeChange(length: number): void {
    if (this.sizeCache.vertical.length > length) {
      this.sizeCache.vertical.splice(length - 1, this.sizeCache.vertical.length - 1);
      this.cellSize.vertical.splice(length - 1, this.cellSize.vertical.length - 1);
    }
  }

  /**
   * 对水平方向的宽度进行初始化，然后获取到第一个元素的宽度，作为渲染区域的最大宽度
   * @param column
   * @param element
   */
  public initHorizontalPresetSize(column: Array<ITableColumn>, element: HTMLDivElement): void {
    for (let index = 0; index < column.length; index++) {
      if (column[index].width) {
        this.sizeCache.horizontal[index] = parseFloat(column[index]?.width ?? "0");
      } else {
        // 对没有宽度的列进行宽度预设
        this.sizeCache.horizontal[index] = 100;
      }
    }
    nextTick(() => {
      const firstChild = element.children.item(0) as HTMLDivElement;
      if (firstChild) {
        this.layout.areaWidth = firstChild.clientWidth;
      }
    });
  }

  /**
   * 初始化滚动区域的尺寸
   * @param element
   */
  public initScrollBodySize(element: HTMLDivElement): void {
    this.layout.scrollBodyHeight = element.clientHeight;
    this.layout.scrollBodyWidth = element.clientWidth;
  }

  /**
   * 初始化固定区域的尺寸
   * @param left
   * @param right
   */
  public initFixedWidth(left: Array<ITableColumn>, right: Array<ITableColumn>): void {
    let leftWidth = 0;
    let rightWidth = 0;
    left.forEach((item) => {
      leftWidth += parseFloat(item.width ?? "0");
    });
    right.forEach((item) => {
      rightWidth += parseFloat(item.width ?? "0");
    });
    this.layout.leftFixedWidth = leftWidth;
    this.layout.rightFixedWidth = rightWidth;
  }

  /**
   * 更新滚动位置，以此来更新可视区域的视图渲染
   * @param position
   */
  public updateScrollPositionChange = (
    position: IScrollPosition,
    columns: Array<ITableColumn>
  ): void => {
    this.scrollPosition.x = position.x;
    this.scrollPosition.y = position.y;
    this.updateVerticalIndexWithScrollPosition();
    this.getRenderColIndex(columns);
  };

  /**
   * 获取横向渲染下标索引
   * @param x
   * @param columns
   */
  public getRenderColumnIndexByXPosition(
    x: number,
    columns: Array<ITableColumn>
  ): [number, number] {
    let startIndex = 0;
    let endIndex = columns.length - 1;
    const minRenderWidth = Math.max(x - this.layout.renderFillDistance, 0);
    for (let index = 0; index < this.cellSize.horizontal.length; index++) {
      const recordWidth = this.cellSize.horizontal[index];
      if (recordWidth > x + this.layout.viewportWidth + this.layout.renderFillDistance) {
        endIndex = Math.abs(index - endIndex) < 4 ? endIndex : index;
        break;
      }
      if (recordWidth <= minRenderWidth) {
        const cellWidth = this.sizeCache.horizontal[index];
        if (recordWidth + cellWidth > minRenderWidth || minRenderWidth <= recordWidth) {
          startIndex = Math.max(index, startIndex);
        }
      }
    }
    return [startIndex, endIndex];
  }

  /**
   * 根据滚动位置，获取渲染区域
   * @param columns
   */
  public getRenderColIndex(columns: Array<ITableColumn>): void {
    const renderIndex = this.getRenderColumnIndexByXPosition(this.scrollPosition.x, columns);
    this.renderInfo.horizontalStartIndex = renderIndex[0];
    this.renderInfo.horizontalEndIndex = renderIndex[1];
  }

  /**
   * 数据列渲染
   * @param renderCallback
   */
  public updateVerticalIndexWithScrollPosition(): void {
    const heightMinPosition = Math.max(this.scrollPosition.y - this.layout.renderFillDistance, 0);
    let startIndex = 0;
    let needUpdateRecord = false;
    let endIndex = this.cellSize.vertical.length;
    if (this.scrollPosition.y >= this.lastRenderPositionRecord.scrollY) {
      startIndex = this.lastRenderPositionRecord.verticalIndex;
      this.lastRenderPositionRecord.scrollY = this.scrollPosition.y;
      needUpdateRecord = true;
    } else {
      // 往上滚动，起始位置未知，重置index
      this.lastRenderPositionRecord.verticalIndex = 0;
      this.lastRenderPositionRecord.scrollY = this.scrollPosition.y;
    }
    const maxRenderHeightPosition =
      this.layout.viewportHeight + this.layout.renderFillDistance + this.scrollPosition.y;
    let getStart = false;
    for (let index = startIndex; index < endIndex; index++) {
      const recordHeight = this.cellSize.vertical[index];
      if (maxRenderHeightPosition < recordHeight) {
        endIndex = index;
        break;
      }
      const cellHeight = this.sizeCache.vertical[index];
      // 最前面一列正好在显示中间，且大于预渲染区域，需要显示这一列
      if (recordHeight + cellHeight > heightMinPosition || heightMinPosition <= recordHeight) {
        // renderCallback(index, recordHeight);
        if (!getStart) {
          startIndex = index;
          getStart = true;
        }
      }
    }
    this.renderInfo.verticalStartIndex = startIndex;
    this.renderInfo.verticalEndIndex = endIndex;
    if (needUpdateRecord) {
      this.lastRenderPositionRecord.verticalIndex = startIndex;
    }
  }

  dispose(): void {
    this.sizeObserver.disconnect();
  }
}
