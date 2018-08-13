import { Pipeline, RawAssertions, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Obj } from '@ephox/katamari';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import 'tinymce';
import Plugin from '../../../../main/ts/Plugin';

Plugin();

UnitTest.asynctest('browser.tinymce.plugins.xpath-annotations.PluginTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  TinyLoader.setup(function(editor, onSuccess, onFailure) {
    var tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      tinyApis.sFocus,
      Step.sync(function() {
        var pluginArray = Obj.keys(editor.plugins);
        RawAssertions.assertEq('Has annotations plugin', ['tinymce-xpath-annotations-example'], pluginArray);
      })
    ], onSuccess, onFailure);
  }, {
    plugins: 'tinymce-xpath-annotations-example'
  }, success, failure);
});
