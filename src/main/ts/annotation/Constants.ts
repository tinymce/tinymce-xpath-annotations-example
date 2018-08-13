const name = () => 'xpath-annotation';

const command = () => 'xpath.add-annotation';

const clazz = () => 'xpath-annotation-marker';

const noAnnotationEvent = () => 'xpath.no-annotation-selected';

const hasAnnotationEvent = () => 'xpath.annotation-selected';

const annotationMovedEvent = () => 'xpath.annotation-moved';

export {
  name,
  command,
  clazz,
  noAnnotationEvent,
  hasAnnotationEvent,
  annotationMovedEvent
};
