import * as Constants from './annotation/Constants';
import * as Manager from './annotation/Manager';
import * as XpathAnnotator from './annotation/XpathAnnotator';
import * as Observer from './observe/Observer';

declare let tinymce: any;

const Plugin = (editor, url) => {
  const setAnnotations = (ranges) => {
    Manager.setAnnotations(editor, ranges);
  };

  const removeAllAnnotations = () => {
    Manager.removeAllAnnotations(editor);
  };

  const removeAnnotation = (uid) => {
    Manager.removeAnnotation(editor, uid);
  };

  const getAnnotations = () => {
    return Manager.getAnnotations(editor);
  };

  const observer = Observer.setup(
    getAnnotations,
    (info) => {
      editor.fire(Constants.annotationMovedEvent(), info);
    }
  );

  editor.on('remove', () => {
    observer.stop();
  });

  editor.on('init', () => {
    XpathAnnotator.setup(editor);
    observer.start(editor.contentDocument);
  });

  return {
    getAnnotations,
    removeAnnotation,
    removeAllAnnotations,
    setAnnotations
  };
};

tinymce.PluginManager.add('tinymce-xpath-annotations-example', Plugin);
export default function() { }
