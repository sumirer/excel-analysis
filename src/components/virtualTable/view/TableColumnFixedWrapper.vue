<script lang="tsx">
import { IScrollPosition } from '@/types/virtual';
import { defineComponent, inject, nextTick, onBeforeUnmount, onMounted, ref, useSlots } from 'vue';
import { EVENT_PROVIDE_KEY, SIZE_PROVIDED_KEY } from '../core/Inject';
import ScrollEventHub from '../core/ScrollEventHub';
import { VirtualProvider } from '../core/VirtualProvider';

const TableColumnFixedWrapper = defineComponent({
  props: {
    position: {
      type: String,
    },
  },
  setup(props) {
    const virtualProvider = inject<VirtualProvider>(SIZE_PROVIDED_KEY) as VirtualProvider;

    const eventHub = inject<ScrollEventHub>(EVENT_PROVIDE_KEY) as ScrollEventHub;

    const showFixedAction = ref(false);

    const handleScrollChange = (position: IScrollPosition) => {
      if (props.position === 'left' && position.x > 0) {
        showFixedAction.value = true;
        return;
      }
      if (
        props.position === 'right' &&
        position.x < (virtualProvider.scrollMaxWidth as unknown as number)
      ) {
        showFixedAction.value = true;
        return;
      }
      showFixedAction.value = false;
    };

    onMounted(() => {
      eventHub.registerX(handleScrollChange);
      nextTick(() => {
        handleScrollChange({ x: 0, y: 0 });
      });
    });

    onBeforeUnmount(() => {
      eventHub.unregisterX(handleScrollChange);
    });

    const className = `sapphire-virtual__ping-${props.position}`;
    const layout = virtualProvider.layout;
    const slots = useSlots();
    return () => {
      return (
        <div
          class={{
            'sapphire-virtual__tabled-fixed': true,
            [className]: showFixedAction.value,
          }}
          style={{
            right: 0,
            width: layout.rightFixedWidth + 'px',
            height: `${layout.areaHeight}px`,
          }}
        >
          {slots?.default?.()}
        </div>
      );
    };
  },
});

export default TableColumnFixedWrapper;
</script>
