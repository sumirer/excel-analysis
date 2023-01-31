<script lang="tsx">
import {
  defineComponent,
  inject,
  onMounted,
  ref,
  onBeforeUnmount,
  useSlots,
  VNode,
  nextTick,
  onUpdated,
  watch,
} from 'vue';
import { ITableColumn } from '@/types/table';
import { SIZE_PROVIDED_KEY } from '../core/Inject';
import { IDictionaries } from '@/types/index';
import { VirtualProvider } from '../core/VirtualProvider';

const VirtualRow = defineComponent({
  props: {
    rowIndex: {
      type: Number,
    },
    rowData: {
      type: Object,
    },
    column: {
      type: Array,
    },
    renderIndex: {
      type: Array,
    },
    position: {
      type: String,
    },
    sizeObserver: {
      type: Boolean,
    },
  },
  emits: ['hover', 'unHover'],
  setup(props, ctx) {
    const columnRef = ref<HTMLDivElement>();

    const sizeProvider = inject<VirtualProvider>(SIZE_PROVIDED_KEY) as VirtualProvider;

    const showItemMaxHeight = ref<boolean>(false);

    const isHover = ref<boolean>(false);

    watch(sizeProvider.hoverIndex, (val) => {
      if (val.value === props.rowIndex) {
        isHover.value = true;
        return;
      }
      if (isHover.value) isHover.value = false;
    });

    const handleColumnHover = () => {
      ctx.emit('hover', props.rowIndex);
    };

    const handleColumUnHover = () => {
      ctx.emit('unHover', props.rowIndex);
    };

    onMounted(() => {
      if (columnRef.value) {
        if (props.sizeObserver) {
          sizeProvider?.addResizeObserver(columnRef.value);
        }
        columnRef.value.addEventListener('mouseenter', handleColumnHover);
        columnRef.value.addEventListener('mouseleave', handleColumUnHover);
      }
      nextTick(() => {
        showItemMaxHeight.value = true;
      });
    });

    onUpdated(() => {
      if (columnRef.value && props.sizeObserver) {
        if (columnRef.value) {
          let showMaxHeight = 0;
          for (let index = 0; index < columnRef.value.children.length; index++) {
            const element = columnRef.value.children.item(index);
            const itemHeight = element?.children.item(0)?.getClientRects()[0]?.height ?? 0;
            showMaxHeight = Math.max(itemHeight, showMaxHeight);
          }
          const lastRecordHeight = sizeProvider?.getRowHeight(props.rowIndex as number) ?? 0;
          if (lastRecordHeight < showMaxHeight) {
            sizeProvider?.setRowHeight(props.rowIndex as number, showMaxHeight);
          }
        }
      }
    });

    onBeforeUnmount(() => {
      if (columnRef.value) {
        sizeProvider?.removeResizeObserver(columnRef.value);
        columnRef.value.removeEventListener('mouseenter', handleColumnHover);
        columnRef.value.removeEventListener('mouseleave', handleColumUnHover);
      }
    });

    const column = props.column as Array<ITableColumn>;

    const data = props.rowData || {};

    const slots = useSlots();

    const renderColumnByScrollPosition = (
      data: IDictionaries,
      renderIndex: [number, number]
    ): Array<VNode> => {
      const views: Array<VNode> = [];
      let positionX = 0;
      for (let index = 0; index <= renderIndex[1]; index++) {
        const col = column[index];
        if (index >= renderIndex[0]) {
          views.push(
            <div
              key={col.colKey + '_' + index}
              class="sapphire-virtual__table-cell"
              style={{
                width: col.width,
                left: positionX + 'px',
                height: showItemMaxHeight.value ? '100%' : '',
              }}
            >
              <div class="sapphire-virtual__table-container">
                {slots[col.colKey]
                  ? slots[col.colKey]?.({
                      data,
                      colIndex: props.rowIndex,
                      rowIndex: index,
                      key: col.colKey,
                    })
                  : data[col.colKey]}
              </div>
            </div>
          );
        }
        positionX += parseFloat(col.width ?? '0');
      }
      return views;
    };

    return () => {
      let renderIndex: [number, number] = [0, 0];
      if (props.renderIndex) {
        renderIndex = props.renderIndex as [number, number];
      } else {
        renderIndex = [
          sizeProvider?.renderInfo.horizontalStartIndex ?? 0,
          sizeProvider?.renderInfo.horizontalEndIndex ?? 0,
        ];
      }
      return (
        <div
          ref={columnRef}
          class={{ 'sapphire-virtual__table-row': true, 'row-hover': isHover.value }}
          style={{
            height: sizeProvider?.getRowHeight(props.rowIndex as number) + 'px',
          }}
        >
          {renderColumnByScrollPosition(data, renderIndex)}
        </div>
      );
    };
  },
});

export default VirtualRow;
</script>
