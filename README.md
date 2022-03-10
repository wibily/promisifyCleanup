# Promisify Cleanup

Have you ever needed to unsubscribe an event listener or clear a timeout or do some sort of un-effect and integrate that with Promise code? This package attempts this.

## Key idea:
- Convert your asynchronous code to take in a Promise executor and return back a cleanup function
- Pass it through to promisify to convert it to a [Promise, cleanup function].
- Pass the [Promise, cleanup function] to any of the promisisfy combinators to return a Promise that will cleanup in the finally block.
- As the promisify combinators return back a Promise, you may then continue chaining. For example, to finally perform some state update.

```typescript
import { PromiseEffect, promisify, promisifyRace } from "./promisifyCleanup";

//timeout example
const timeoutEnd = (duration: number): PromiseEffect => (resolve, reject) => {
  const id = setTimeout(() => {
    resolve('timeout: '+ duration);
  }, duration);
  
  return () => {clearTimeout(id)};
};

promisifyRace([
  promisify(timeoutEnd(200)),
  promisify(timeoutEnd(1000)) // this one will be cleared before it fires
]).finally(
  () => console.log('some state update here');
)
```

## Additional resources
- Dev.to article: https://dev.to/derp/promisifying-css-animation-with-timeout-fallback-28ml
- Codesandbox link: https://codesandbox.io/s/animationend-fiddle-o2scuh
