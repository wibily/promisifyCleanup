import "./styles.css";

import { PromiseEffect, promisify, promisifyRace } from "./promisifyCleanup";

const noop = () => {};

const transitionEnd = (element: Element | null): PromiseEffect => (
  resolve,
  reject
) => {
  if (!element) {
    reject("Element does not exist");
    return noop;
  }

  const eventListener: EventListener = (evt) => {
    console.log("Transitionend event fired");
    resolve(evt);
  };

  const cleanupFn = () => {
    element.removeEventListener("transitionend", eventListener);
  };

  element.addEventListener("transitionend", eventListener);
  return cleanupFn;
};

const timeoutEnd = (duration: number): PromiseEffect => (resolve, reject) => {
  const id = setTimeout(() => {
    console.log("timeout fired");
    reject("Time out, did you forget to add the transition/animation?");
  }, duration);
  const cleanupFn = () => {
    clearTimeout(id);
  };
  return cleanupFn;
};

const btn = document.getElementById("btn");
const block = document.getElementById("block");

const DURATION = 5000;

const transitionP = () => promisify(transitionEnd(block));
const durationP = () => promisify(timeoutEnd(DURATION));

const stateUpdate = () => console.log("state update");

btn?.addEventListener("click", () => {
  promisifyRace([transitionP(), durationP()])
    .finally(stateUpdate)
    .catch(console.error);
  block?.classList.toggle("animate");
});
