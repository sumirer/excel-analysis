import { ref, watch, Ref } from "vue";

export function useLocationStore<T>(
  key: string,
  defaultValue: T
): [Ref<T | undefined>, (value: T) => void] {
  const currentValue = ref<T>();
  watch<T | undefined>(
    currentValue,
    (val: T | undefined) => {
      localStorage.setItem(key, JSON.stringify(val));
    },
    { deep: true }
  );
  try {
    const data = localStorage.getItem(key);
    if (data) {
      currentValue.value = JSON.parse(data);
    } else {
      currentValue.value = defaultValue;
    }
  } catch (e) {
    currentValue.value = defaultValue;
  }
  const updateValue = (value: T) => {
    currentValue.value = value;
  };
  return [currentValue, updateValue];
}
