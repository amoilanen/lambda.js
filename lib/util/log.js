const debug = false;

export const log = (...args) => {
  if (debug) {
    console.log.apply(console, args);
  }
}