import { Document, MutationObserver } from '@ephox/dom-globals';
import { Arr, Cell, Throttler } from '@ephox/katamari';
import { Calculation, XPath } from '../annotation/Manager';

export interface Observer {
  start: (doc: Document) => void;
  stop: () => void;
}

const setup = (
  getAnnotations: () => Calculation[],
  triggerEvent: (obj: { uid: string, xpath: XPath}) => void
): Observer => {
  const cache: Cell<Record<string, XPath>> = Cell({ });

  const mutationThrottle = Throttler.last(() => {
    const previous = cache.get();
    const updated = { };
    const current = getAnnotations();
    Arr.each(current, (c) => {
      const uid = c.uid;
      if (previous.hasOwnProperty(uid)) {
        // We already had a value for this one. Check if it has changed.
        const prev = previous[uid];
        if (
          (prev.start !== c.xpath.start) ||
          (prev.startOffset !== c.xpath.startOffset) ||
          (prev.end !== c.xpath.end) ||
          (prev.endOffset !== c.xpath.endOffset)
        ) {
          triggerEvent({ uid, xpath: c.xpath });
          updated[uid] = c.xpath;
        }
      } else {
        updated[uid] = c.xpath;
      }
    });
    cache.set(updated);
  }, 100);

  const observer = new MutationObserver(() => {
    mutationThrottle.throttle();
  });

  const start = (doc: Document): void => {
    observer.observe(doc, {
      childList: true,
      subtree: true,
      attributes: false,
      characterData: true
    });
  };

  const stop = (): void => {
    mutationThrottle.cancel();
    observer.disconnect();
  };

  return {
    start,
    stop
  };
};

export {
  setup
};
