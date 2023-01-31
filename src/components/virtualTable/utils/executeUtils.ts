type VoidFunction = () => void;

export interface IExecute {
  replace: (newRunner: VoidFunction) => void;
}

/**
 * 执行操作防抖，函数在 [duration] 时间内重复触发，会清理上一次的任务
 * 然后重新刷新计时
 * @param runner 执行函数
 * @param duration 防抖时间
 */
function executeThrottle(runner: VoidFunction, duration: number): IExecute {
  let runnerTarget = runner;
  let timer = setTimeout(() => {
    runnerTarget();
    clearTimeout(timer);
  }, duration);
  return {
    replace(newRunner: VoidFunction) {
      runnerTarget = newRunner;
      clearTimeout(timer);
      timer = setTimeout(() => {
        runnerTarget();
        clearTimeout(timer);
      }, duration);
    },
  };
}

/**
 * 执行节流操作，函数在 [duration] 重复调用，只会留下最后一次
 * 在 [duration] 时间后，执行最后一个函数
 * 节流函数可以重复使用
 * @param runner
 * @param duration
 */
function executeDebounce(runner: VoidFunction, duration: number): IExecute {
  let runnerTarget = runner;
  let finished = false;
  let timer = setTimeout(() => {
    runnerTarget();
    clearTimeout(timer);
    finished = true;
  }, duration);
  return {
    replace(newRunner: VoidFunction) {
      runnerTarget = newRunner;
      // 如果已经结束了，需要重新执行，重复使用闭包
      if (finished) {
        finished = false;
        timer = setTimeout(() => {
          runnerTarget();
          clearTimeout(timer);
          finished = true;
        }, duration);
      }
    },
  };
}

export { executeThrottle, executeDebounce };
