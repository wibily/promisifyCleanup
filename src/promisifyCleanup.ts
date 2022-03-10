export type Effect = () => void;
export type CleanupFn = Effect;

type Resolve = (value: unknown) => void;
type Reject = (reason?: any) => void;

export type PromiseEffect = (resolve: Resolve, reject: Reject) => CleanupFn;

type PromiseCleanup = [Promise<unknown>, CleanupFn];

export const promisify = (f: PromiseEffect): PromiseCleanup => {
  let cleanupFn: Effect | undefined;
  const executor = (resolve: Resolve, reject: Reject) => {
    cleanupFn = f(resolve, reject);
  };
  return [new Promise(executor), cleanupFn as Effect];
};

export const promisifyRace = (
  promiseCleanups: PromiseCleanup[]
): Promise<unknown> => {
  const promises = promiseCleanups.map(([promise, _]) => promise);
  const cleanups = promiseCleanups.map(([, cleanup]) => cleanup);

  return Promise.race(promises).finally(() => {
    cleanups.forEach((cleanup) => cleanup());
  });
};

export const promisifyAll = (
  promiseCleanups: PromiseCleanup[]
): Promise<unknown> => {
  const promises = promiseCleanups.map(([promise, _]) => promise);
  const cleanups = promiseCleanups.map(([, cleanup]) => cleanup);

  return Promise.all(promises).finally(() => {
    cleanups.forEach((cleanup) => cleanup());
  });
};

export const promisifyAllSettled = (
  promiseCleanups: PromiseCleanup[]
): Promise<unknown> => {
  const promises = promiseCleanups.map(([promise, _]) => promise);
  const cleanups = promiseCleanups.map(([, cleanup]) => cleanup);

  return Promise.allSettled(promises).finally(() => {
    cleanups.forEach((cleanup) => cleanup());
  });
};

export const promisifyAny = (
  promiseCleanups: PromiseCleanup[]
): Promise<unknown> => {
  const promises = promiseCleanups.map(([promise, _]) => promise);
  const cleanups = promiseCleanups.map(([, cleanup]) => cleanup);

  return Promise.any(promises).finally(() => {
    cleanups.forEach((cleanup) => cleanup());
  });
};