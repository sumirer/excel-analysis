<script lang="tsx">
import { IScrollPosition, ITableLayout } from "@/types/virtual";
import {
  defineComponent,
  VNode,
  onMounted,
  inject,
  ref,
  CSSProperties,
  nextTick,
  onBeforeUnmount,
  PropType,
} from "vue";
import { ITableColumn } from "@/types/table";
import { EVENT_PROVIDE_KEY, SIZE_PROVIDED_KEY } from "../core/Inject";
import ScrollEventHub from "../core/ScrollEventHub";
import { VirtualProvider } from "../core/VirtualProvider";
import { flatColumn, getMaxColumnDeepLength } from "../utils/columnUtils";

const TableHeader = defineComponent({
  props: {
    columns: {
      type: Array,
    },
    leftColumns: {
      type: Array,
    },
    rightColumns: {
      type: Array,
    },
    onHeaderClick: {
      type: Function as PropType<(col: ITableColumn) => void>,
    },
  },
  setup(props) {
    const sizeProvider = inject<VirtualProvider>(SIZE_PROVIDED_KEY) as VirtualProvider;

    const eventHub = inject<ScrollEventHub>(EVENT_PROVIDE_KEY) as ScrollEventHub;

    const headerRef = ref<HTMLDivElement>();

    const fixedAction = ref({
      left: false,
      right: false,
    });

    const handleScrollChange = (position: IScrollPosition) => {
      if (position.x > 0) {
        fixedAction.value.left = true;
      } else {
        fixedAction.value.left = false;
      }
      if (position.x < (sizeProvider.scrollMaxWidth as unknown as number)) {
        fixedAction.value.right = true;
      } else {
        fixedAction.value.right = false;
      }
    };

    const renderChildren = (
      col: ITableColumn,
      offset: number,
      index: string
    ): { node: VNode; width: number } => {
      if (!col.children) {
        return {
          node: (
            <div
              key={col.colKey + "_" + index}
              style={{
                width: col.width,
                left: offset + "px",
              }}
              class="header-title"
              onClick={() => props.onHeaderClick?.(col)}
            >
              <div class="sapphire-virtual__table-container">{col.title}</div>
            </div>
          ),
          width: parseFloat(col.width ?? "0"),
        };
      }
      let renderWidth = 0;
      const renderData = col.children.map((colChild, _index) => {
        return renderChildren(colChild, 0, `${index}_${_index}`);
      });
      renderData.forEach((item) => {
        renderWidth += item.width;
      });
      return {
        node: (
          <div
            class="header-title with-children"
            key={col.colKey + "_" + index}
            style={{
              left: offset + "px",
              width: renderWidth + "px",
            }}
          >
            <div class="sapphire-virtual__table-container row-title">{col.title}</div>
            <div class="header-item">{renderData.map((item) => item.node)}</div>
          </div>
        ),
        width: renderWidth,
      };
    };

    const getTrueRenderIndex = (
      columns: Array<ITableColumn>,
      renderIndex: [number, number]
    ): [number, number] => {
      let startIndex = -1;
      let recordIndex = 0;
      let endIndex = columns.length - 1;
      for (let index = 0; index < columns.length; index++) {
        const col = columns[index];
        if (col.children) {
          const flat = flatColumn(col.children);
          recordIndex += flat.length;
        } else {
          recordIndex++;
        }
        if (startIndex === -1 && recordIndex >= renderIndex[0]) {
          startIndex = index;
        }
        if (recordIndex >= renderIndex[1]) {
          endIndex = Math.abs(index - endIndex) < 4 ? endIndex : index;
          break;
        }
      }
      return startIndex === -1 ? renderIndex : [startIndex, endIndex];
    };

    const renderHeader = (
      renderIndex: [number, number],
      columns: Array<ITableColumn>,
      needUseTrueIndex = true,
      keyPrefix = ""
    ): { views: VNode[]; width: number } => {
      const views: VNode[] = [];
      const newRenderIndex = needUseTrueIndex
        ? getTrueRenderIndex(columns, renderIndex)
        : renderIndex;
      let renderPosition = 0;
      let width = 0;
      if (columns.length > 0) {
        for (let index = 0; index <= newRenderIndex[1]; index++) {
          const col = columns[index];
          if (index >= newRenderIndex[0]) {
            const renderData = renderChildren(
              columns[index],
              renderPosition,
              `${keyPrefix}_${index}`
            );
            views.push(renderData.node);
            renderPosition += renderData.width;
            width += renderData.width;
          } else {
            const flatCol = flatColumn([col]);
            flatCol.forEach((item) => {
              renderPosition += parseFloat(item.width ?? "0");
            });
          }
        }
      }

      return { views, width };
    };

    const renderFixedHeader = (
      renderIndex: [number, number],
      columns: Array<ITableColumn>,
      styles: CSSProperties,
      classNames: { [key: string]: boolean }
    ) => {
      const renderData = renderHeader(renderIndex, columns, false, Object.keys(styles)[0]);
      return (
        <div
          class={{ "sapphire-virtual__header-fixed": true, ...classNames }}
          style={{ ...styles, width: renderData.width + "px" }}
        >
          {renderData.views}
        </div>
      );
    };

    onMounted(() => {
      const maxDeepLength = getMaxColumnDeepLength(props.columns as Array<ITableColumn>);
      if (sizeProvider) {
        sizeProvider.layout.headerHeight = 40 * maxDeepLength;
      }
      if (headerRef.value) {
        eventHub?.registerScrollWithTarget(headerRef.value);
      }
      eventHub.registerX(handleScrollChange);
      nextTick(() => {
        handleScrollChange({ x: 0, y: 0 });
      });
    });

    onBeforeUnmount(() => {
      eventHub.unregisterX(handleScrollChange);
    });

    return () => {
      const provider = sizeProvider as VirtualProvider;
      const leftColumns = props.leftColumns as Array<ITableColumn>;
      const rightColumns = props.rightColumns as Array<ITableColumn>;
      const renderIndex: [number, number] = [
        provider.renderInfo.horizontalStartIndex,
        provider.renderInfo.horizontalEndIndex,
      ];
      const layout = sizeProvider?.layout as ITableLayout;
      const renderBody = renderHeader(renderIndex, props.columns as Array<ITableColumn>);
      return (
        <div
          class="sapphire-virtual__table-header"
          style={{
            height: layout.headerHeight + "px",
          }}
        >
          {leftColumns.length > 0 &&
            renderFixedHeader(
              [0, leftColumns.length - 1],
              leftColumns,
              { left: 0 },
              { "left-fixed": true, "sapphire-virtual__ping-left": fixedAction.value.left }
            )}
          <div
            class="sapphire-virtual__header-wrapper"
            ref={headerRef}
            style={{
              height: layout.headerHeight + "px",
              width: layout.viewportWidth + "px",
            }}
          >
            <div
              class="sapphire-virtual__header-body"
              style={{
                height: layout.headerHeight + "px",
              }}
            >
              {renderBody.views}
            </div>
          </div>
          {rightColumns.length > 0 &&
            renderFixedHeader(
              [0, rightColumns.length - 1],
              rightColumns,
              { right: 0 },
              {
                "right-fixed": true,
                "sapphire-virtual__ping-right": fixedAction.value.right,
              }
            )}
          <div
            class="sapphire-virtual__header-fixed scroll-fixed"
            style={{ width: layout.viewportWidth - layout.scrollBodyWidth + "px" }}
          ></div>
        </div>
      );
    };
  },
});

export default TableHeader;
</script>
