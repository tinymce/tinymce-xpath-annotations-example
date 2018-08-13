import * as Constants from './Constants';

const setup = (editor) => {
  editor.annotator.register(Constants.name(), {
    decorate: (uid, data) => {
      return {
        attributes: { },
        classes: [ Constants.clazz() ]
      };
    }
  });

  editor.addCommand(Constants.command(), (ui, value) => {
    const { uid } = value;
    editor.annotator.annotate(Constants.name(), {
      uid
    });
  });

  editor.annotator.annotationChanged(
    Constants.name(),
    (state, name, obj) => {
      if (!state) {
        editor.fire(Constants.noAnnotationEvent());
      } else {
        editor.fire(Constants.hasAnnotationEvent(), { uid: obj.uid });
      }
    }
  );
};

export {
  setup
};
