<script lang="tsx">
import {
  defineComponent,
  provide,
  onMounted,
  ref,
  onBeforeUnmount,
  useSlots,
  nextTick,
  VNode,
} from "vue";
import { EVENT_PROVIDE_KEY, SIZE_PROVIDED_KEY } from "../core/Inject";
import ScrollEventHub from "../core/ScrollEventHub";
import { VirtualProvider } from "../core/VirtualProvider";
import VirtualRow from "./VirtualRow.vue";
import "../style/index.scss";
import TableHeader from "./TableHeader.vue";
import { executeDebounce } from "../utils/executeUtils";
import { EDataChangeEnum, IRenderData, IScrollPosition } from "@/types/virtual";
import TableColumnFixedWrapper from "./TableColumnFixedWrapper.vue";
import { IDictionaries } from "@/types";
import VirtualDataManager from "../core/VirtualDataManager";
const VirtualTable = defineComponent({
  props: {
    dataManager: {
      type: VirtualDataManager,
    },
    presetHeight: {
      type: Number,
      default: () => 60,
    },
  },
  setup(props) {
    const columnRef = ref<HTMLDivElement>();

    const viewportRef = ref<HTMLDivElement>();

    const observer = ref(new VirtualProvider());

    const scrollRef = ref<HTMLDivElement>();

    const eventHub = ref(new ScrollEventHub());

    const virtualProvider = observer.value as unknown as VirtualProvider;

    provide<VirtualProvider>(SIZE_PROVIDED_KEY, virtualProvider);

    provide<ScrollEventHub>(EVENT_PROVIDE_KEY, eventHub.value);

    const dataManager = props.dataManager as VirtualDataManager<unknown>;

    virtualProvider.initVerticalPresetSize(dataManager.getDataLength(), props.presetHeight);

    const handleScrollChange = (event: Event) => {
      const target = event.target as HTMLDivElement;
      eventHub.value.handleScrollChange(target.scrollLeft, target.scrollTop);
    };

    const resizeTask = executeDebounce(() => {
      //
    }, 200);

    const handleResize = () => {
      resizeTask.replace(() => {
        if (viewportRef.value && columnRef.value) {
          virtualProvider.setupViewportData(viewportRef.value);
          virtualProvider.initScrollBodySize(columnRef.value);
        }
      });
    };

    const handleAreaScrollChange = (position: IScrollPosition) => {
      virtualProvider.updateScrollPositionChange(position, dataManager.otherColumns);
    };

    const initColumnData = () => {
      virtualProvider.initFixedWidth(dataManager.leftFixedColumns, dataManager.rightFixedColumns);
      if (scrollRef.value) {
        virtualProvider.initHorizontalPresetSize(dataManager.otherColumns, scrollRef.value);
      }
    };

    onMounted(() => {
      if (columnRef.value && viewportRef.value && scrollRef.value) {
        virtualProvider.setupViewportData(viewportRef.value);
        initColumnData();
        virtualProvider.reLayoutCell();
        columnRef.value.addEventListener("scroll", handleScrollChange);
        eventHub.value.register(handleAreaScrollChange);
        nextTick(() => {
          if (columnRef.value) virtualProvider.initScrollBodySize(columnRef.value);
        });
      }
      handleAreaScrollChange({ x: 0, y: 0 });
      window.addEventListener("resize", handleResize);
    });

    dataManager.registerDataWatch(
      (data: Array<unknown>, type: EDataChangeEnum, lastLength: number) => {
        switch (type) {
          case EDataChangeEnum.SLICE:
          case EDataChangeEnum.PUSH:
            handleDataSizeChange(data, lastLength);
            break;
          case EDataChangeEnum.REPLACE:
            break;
          case EDataChangeEnum.CHANGE:
            handleDataSourceChange(data);
          default:
            break;
        }
      }
    );

    const handleDataSizeChange = (data: Array<unknown>, length: number) => {
      if (data.length > length) {
        virtualProvider.initVerticalPresetSize(data.length, props.presetHeight, length - 1);
      } else if (data.length < length) {
        virtualProvider.resizeDataVerticalSizeChange(data.length);
      }
      virtualProvider.reLayoutCell();
      handleAreaScrollChange(virtualProvider.scrollPosition);
      nextTick(() => {
        if (columnRef.value) virtualProvider.initScrollBodySize(columnRef.value);
      });
    };

    const handleDataSourceChange = (data: Array<unknown>) => {
      virtualProvider.resizeDataVerticalSizeChange(data.length);
      virtualProvider.reLayoutCell();
      handleAreaScrollChange(virtualProvider.scrollPosition);
      nextTick(() => {
        if (columnRef.value) virtualProvider.initScrollBodySize(columnRef.value);
      });
    };

    const handleColumnChange = () => {
      initColumnData();
      virtualProvider.reLayoutCell();
      handleAreaScrollChange(virtualProvider.scrollPosition);
      nextTick(() => {
        if (columnRef.value) virtualProvider.initScrollBodySize(columnRef.value);
      });
    };

    dataManager.registerColumnChangeCallback(handleColumnChange);

    onBeforeUnmount(() => {
      if (columnRef.value) {
        columnRef.value.removeEventListener("scroll", handleScrollChange);
        eventHub.value.unregister(handleAreaScrollChange);
      }
      virtualProvider.dispose();
      window.removeEventListener("resize", handleResize);
    });

    const handleHover = (index: number) => {
      virtualProvider.updateHoverIndex(index);
    };

    const handleUnHover = () => {
      virtualProvider.updateHoverIndex(-1);
    };

    const slots = useSlots();

    const renderViewsCache = {
      fixedLeftViews: [],
      views: [],
      fixedRightViews: [],
    };

    const lastRenderData: IRenderData = {
      horizontalEndIndex: 0,
      horizontalStartIndex: 0,
      verticalEndIndex: 0,
      verticalStartIndex: 0,
    };

    const renderDataDiff = (newRender: IRenderData, oldRender: IRenderData): boolean => {
      return (
        newRender.verticalEndIndex === oldRender.verticalEndIndex &&
        newRender.verticalStartIndex === oldRender.verticalStartIndex
      );
    };

    return () => {
      let fixedLeftViews: VNode[] = [];
      let views: VNode[] = [];
      let fixedRightViews: VNode[] = [];
      const hasLeftFixed = dataManager.leftFixedColumns.length > 0;
      const hasRightFixed = dataManager.rightFixedColumns.length > 0;
      const layout = virtualProvider.layout;
      const renderInfo = virtualProvider.renderInfo;
      const dataValue = dataManager.getData() as Array<IDictionaries>;
      if (renderDataDiff(renderInfo, lastRenderData)) {
        fixedLeftViews = renderViewsCache.fixedLeftViews;
        fixedRightViews = renderViewsCache.fixedRightViews;
        views = renderViewsCache.views;
      } else {
        for (
          let index = renderInfo.verticalStartIndex;
          index < renderInfo.verticalEndIndex;
          index++
        ) {
          const height = virtualProvider.cellSize.vertical[index];
          if (hasLeftFixed)
            fixedLeftViews.push(
              <VirtualRow
                key={`left_${index}`}
                style={{ position: "absolute", top: height + "px", left: 0 }}
                rowIndex={index}
                column={dataManager.leftFixedColumns}
                renderIndex={[0, dataManager.leftFixedColumns.length - 1]}
                rowData={dataValue[index]}
                sizeObserver={true}
                onHover={handleHover}
                onUnHover={handleUnHover}
              >
                {slots}
              </VirtualRow>
            );
          if (hasRightFixed)
            fixedRightViews.push(
              <VirtualRow
                key={`right_${index}`}
                style={{ position: "absolute", top: height + "px", left: 0 }}
                rowIndex={index}
                column={dataManager.rightFixedColumns}
                renderIndex={[0, dataManager.rightFixedColumns.length - 1]}
                rowData={dataValue[index]}
                sizeObserver={true}
                onHover={handleHover}
                onUnHover={handleUnHover}
              >
                {slots}
              </VirtualRow>
            );
          views.push(
            <VirtualRow
              key={`center_${index}`}
              style={{ position: "absolute", top: height + "px", left: 0 }}
              rowIndex={index}
              column={dataManager.otherColumns}
              rowData={dataValue[index]}
              sizeObserver={true}
              onHover={handleHover}
              onUnHover={handleUnHover}
            >
              {slots}
            </VirtualRow>
          );
        }
        Object.assign(renderViewsCache, {
          fixedLeftViews,
          fixedRightViews,
          views,
        });
      }

      return (
        <div ref={viewportRef} class="sapphire-virtual" style={{ height: "500px" }}>
          <TableHeader
            columns={dataManager.headerRenderOtherColumns}
            leftColumns={dataManager.headerRenderLeftFixedColumns}
            rightColumns={dataManager.headerRenderRightFixedColumns}
          ></TableHeader>
          <div ref={columnRef} class="sapphire-virtual__table-scroll-body">
            <div
              class="sapphire-virtual__table-scroll-body-wrapper"
              style={{
                width: `${layout.areaWidth + layout.leftFixedWidth + layout.rightFixedWidth}px`,
              }}
            >
              {hasLeftFixed ? (
                <TableColumnFixedWrapper
                  style={{
                    left: 0,
                    width: layout.leftFixedWidth + "px",
                    height: `${layout.areaHeight}px`,
                  }}
                  position="left"
                >
                  {fixedLeftViews}
                </TableColumnFixedWrapper>
              ) : null}
              <div
                ref={scrollRef}
                class="sapphire-virtual__table-body"
                style={{
                  height: layout.areaHeight + "px",
                  width: layout.areaWidth + "px",
                }}
              >
                {views}
              </div>
              {hasRightFixed ? (
                <TableColumnFixedWrapper
                  style={{
                    right: 0,
                    width: layout.rightFixedWidth + "px",
                    height: `${layout.areaHeight}px`,
                  }}
                  position="right"
                >
                  {fixedRightViews}
                </TableColumnFixedWrapper>
              ) : null}
            </div>
          </div>
        </div>
      );
    };
  },
});

export default VirtualTable;
</script>
