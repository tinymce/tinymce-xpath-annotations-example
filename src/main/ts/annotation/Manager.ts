
import { Element as NativeElement, Range } from '@ephox/dom-globals';
import { Arr, Obj, Result } from '@ephox/katamari';
import { Compare, DocumentPosition, Element, Remove, SelectorFilter } from '@ephox/sugar';
import * as xpathRange from 'xpath-range';
import * as Constants from './Constants';

const { toRange: xpathToRange, fromRange: rangeToXpath } = xpathRange;

export interface XPath {
  start: string;
  startOffset: number;
  end: string;
  endOffset: number;
}

export interface Calculation {
  uid: string;
  original: NativeElement;
  xpath: XPath;
}

const preserveCursor = (editor, f: () => void): void => {
  const bookmark = editor.selection.getBookmark();
  f();
  editor.selection.moveToBookmark(bookmark);
};

const setAnnotations = (editor: any, ranges: Calculation[]): void => {
  // Before setting annotations, normalize any text nodes. All annotations
  // have been retrieved on normalized content.
  editor.getBody().normalize();

  // For each xpath range to set, identify the equivalent selection range.
  // TODO: Investigate what happens if these ranges conflict with each other
  const selections = Arr.map(ranges, (r) => {
    return {
      rng: xpathToRange(r.xpath.start, r.xpath.startOffset, r.xpath.end, r.xpath.endOffset, editor.getBody()) as Range,
      data: r};
  });

  // Store the old range so that we can backup to it after settings the annotations.
  preserveCursor(editor, () => {
    Arr.each(selections, (sel) => {
      // TODO: Allow annotator to take a range as part of data
      editor.selection.setRng(sel.rng);
      editor.execCommand(Constants.command(), null, sel.data);
    });
  });
};

const removeAnnotationAtNode = (node: NativeElement): void => {
  Remove.unwrap(
    Element.fromDom(node)
  );
};

const removeAllAnnotations = (editor): void => {
  preserveCursor(editor, () => {
    const annotations = editor.annotator.getAll(Constants.name());
    Obj.each(annotations, (nodes, uid) => {
      Arr.each(nodes, removeAnnotationAtNode);
    });
  });
};

const findMarkers = (body: Element, uid: string): Element[] => {
  // NOTE: Should support this through the annotator API
  // This should not need to know the format of the markers.
  return SelectorFilter.descendants(body, '[data-mce-annotation-uid="' + uid + '"]');
};

const removeAnnotation = (editor, uid: string): void => {
  preserveCursor(editor, () => {
    const body = Element.fromDom(editor.getBody());
    const markers = findMarkers(body, uid);
    Arr.each(markers, Remove.unwrap);
  });
};

const calculatePath = (clone: Element, uid: string, original: NativeElement): Result<Calculation, string> => {
  const markers = findMarkers(clone, uid);
  if (markers.length > 0) {
    const first = markers[0];
    const last = markers[markers.length - 1];
    const firstInMarker = first.dom().childNodes[0];
    const lastInMarker = last.dom().childNodes[last.dom().childNodes.length - 1];
    Remove.unwrap(first);
    if (! Compare.eq(first, last)) {
      Remove.unwrap(last);
    }
    const r = first.dom().ownerDocument.createRange();
    r.setStartBefore(firstInMarker);
    r.setEndAfter(lastInMarker);
    clone.dom().normalize();
    // Remove.unwrap(Element.fromDom(v));

    const xpath = rangeToXpath(r, clone.dom());
    return Result.value({ uid, original, xpath });
  } else {
    return Result.error('Could not find corresponding markers in cloned body');
  }
    // v came from original node.
    // return { uid: uid, node: v[0], xpath: rangeToXpath(r, clone.dom())};
};

const getAnnotations = (editor): Calculation[] => {
  const clone = Element.fromDom(editor.getBody().cloneNode(true));
  clone.dom().normalize();
  const annotations: Record<string, NativeElement[]> = editor.annotator.getAll(Constants.name());
  const values = Obj.mapToArray(annotations, (originals, uid) => {
    return calculatePath(clone, uid, originals[0]).getOrDie();
  });

  return Arr.sort(values, (a, b) => {
    return DocumentPosition.after(Element.fromDom(a.original), 0, Element.fromDom(b.original), 0) ? 1 : -1;
  });
};

export {
  getAnnotations,
  setAnnotations,
  removeAllAnnotations,
  removeAnnotation
};
