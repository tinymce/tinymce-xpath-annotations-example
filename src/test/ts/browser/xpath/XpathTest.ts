import { Assertions, Pipeline, RawAssertions, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Arr, Obj } from '@ephox/katamari';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import 'tinymce';
import Plugin from '../../../../main/ts/Plugin';

Plugin();

UnitTest.asynctest('browser.tinymce.plugins.tinymce-xpath-annotations-example.XPathTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  TinyLoader.setup(function(editor, onSuccess, onFailure) {
    var tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      tinyApis.sFocus,
      tinyApis.sSetContent([
        `<p>This is one word after a <strong>bold</strong> tag now</p>`
      ].join('')),

      tinyApis.sSetSelection([ 0, 2 ], ' '.length, [ 0, 2 ], ' tag'.length),
      Step.sync(function() {
        editor.execCommand('xpath.add-annotation', null, { uid: 'test-one' });
      }),
      Step.sync(() => {
        const annotations = editor.plugins['tinymce-xpath-annotations-example'].getAnnotations();
        Assertions.assertEq(
          'Checking xpath',
          [{
            uid: 'test-one',
            xpath: {
              start: '/p[1]/text()[2]',
              startOffset: 1,
              end: '/p[1]/text()[2]',
              endOffset: 4
            }
          }],
          Arr.map(annotations, (a) => ({ uid: a.uid, xpath: a.xpath }))
        );
      })
    ], onSuccess, onFailure);
  }, {
    plugins: 'tinymce-xpath-annotations-example'
  }, success, failure);
});
