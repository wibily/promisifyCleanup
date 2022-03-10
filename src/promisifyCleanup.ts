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

type PromiseMethod = (values: Promise<unknown>[]) => Promise<unknown>;

const promisifyCombinator = (promiseCleanups: PromiseCleanup[]) => (
  promiseMethod: PromiseMethod
): Promise<unknown> => {
  const promises = promiseCleanups.map(([promise, _]) => promise);
  const cleanups = promiseCleanups.map(([, cleanup]) => cleanup);

  return promiseMethod(promises).finally(() => {
    console.log("cleaning house");
    cleanups.forEach((cleanup) => cleanup());
  });
};

export const promisifyRace = (
  promiseCleanups: PromiseCleanup[]
): Promise<unknown> => promisifyCombinator(promiseCleanups)(Promise.race);

export const promisifyAll = (
  promiseCleanups: PromiseCleanup[]
): Promise<unknown> => promisifyCombinator(promiseCleanups)(Promise.all);

export const promisifyAllSettled = (
  promiseCleanups: PromiseCleanup[]
): Promise<unknown> => promisifyCombinator(promiseCleanups)(Promise.allSettled);

export const promisifyAny = (
  promiseCleanups: PromiseCleanup[]
): Promise<unknown> => promisifyCombinator(promiseCleanups)(Promise.any);
