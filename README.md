# tinymce-xpath-annnotations-example

A reference implementation for integrating xpaths with TinyMCE annotations

## Description

The `tinymce-xpath-annotations-example` plugin provides the ability to set and get annotations
using XPath selectors. It is based on the annotator API, available
from TinyMCE 4.8.2. The xpath capability is provided by the npm library
`xpath-range`. The supplied `example.html` file shows how to use the
majority of the plugin's capabilities.

## Installation

1. Clone this repo
2. Run `npm install`
3. Run `npx grunt webpack`

## Running tests

1. npm run test

## Usage

### Browser Compatibility

At the moment, the plugin only works on Safari, Chrome, and Firefox. There is no
current support for Microsoft Edge or Internet Explorer. Microsoft Edge support
is more challenging than the other modern browsers because its normalization
approaches are not as compatible with its range APIs. This is highlighted by
this fiddle: https://jsfiddle.net/jm2dv5Lw/17/

Internet Explorer support is complicated by its different implementation of various
APIs that `xpath-range` relies upon. We tried some polyfills with limited success.
More investigation is required.

### Running the example.

The example requires `tinymce 4.8.2` or higher. It should be listed in your
`package.json` file. Then:

1. Run `npm install`
2. Run `npx http-server . &> /dev/null &`
3. Run `npx grunt`

Navigate to `http://localhost:8080/dist/tinymce-xpath-annotations-example/example.html` (where `8080` is the port `http-server` is using).

The following sections outline the different parts of the example page:

### Example.html

The supplied `example.html` file shows the various capabilities of the
`tinymce-xpath-annotations-example` plugin. It contains:

a) a TinyMCE instance, with buttons to manage annotations
b) a table showing the current annotations present in the content

The first button in the toolbar is used to add an annotation at the current
cursor position. The second button performs three actions in sequence:

1. get all the annotations from the content and store them in memory
2. remove all annotations from the content
3. five seconds later, restore all the annotations from step (1)

The table also shows the xpath. As you type in the document, this table should
change to show the current xpaths of the annotations. If the cursor is
inside any annotation, that annotation will be highlighted in the table.

### Understanding the Table

In the example page, there is a table showing real-time changes to all the annotations in the content. Each annotation
present is represented by a single row. A row has three columns:

a) a unique identifier (uid)
b) an xpath
c) a delete button

#### UID Column

This uniquely identifies this annotation. It must not conflict with any other annotation. When calling the
`xpath.add-annotation` command, you must supply the UID. A UID will not change.

#### Xpath Column

The xpath column shows a possible xpath for locating this particular annotation. The format of the `xpath` is
very similar to a DOM range object. We are using the `xpath-range` library to calculate
the xpath. Essentially, it is:

```
{
  start: XPath selector string,
  startOffset: number,
  end: XPath selector string,
  endOffset: number
}
```

The xpaths calculated will assume no text fragmentation, and will assume that the annotation markers themselves are
not present.

Note, the `xpath.annotation-moved` event on editor is fired every time we detect a change in the content. In the example,
we use that event to update the XPaths in the table. As you type in the document, you should see the xpaths change where
applicable.

The code excerpt is something like this:

```
var annotations = editor.plugins['tinymce-xpath-annotations-example'].getAnnotations();
```

Note, that the `xpath.annotation-moved` event will be fired separately for every annotation that has a new XPath
location. The event will carry information about the UID and the new xpath. However, the example code is just
retrieving all annotations again to show how that works.


#### Delete Column

For each annotation, there is an 'X' button in the far right column. If you click this button, that is equivalent
to executing `removeAnnotation(uid)` where uid is the identifier for that row. The annotation will be removed
from the content, and the table in the example will be updated acccordingly.

### APIS

The APIs are available on the `tinymce-xpath-annotations-example` plugin itself. Specifically, they can be accessed through
`editor.plugins['tinymce-xpath-annotations-example']`. For example:

```
var annotations = editor.plugins['tinymce-xpath-annotations-example'].getAnnotations();
```

An explanation of the available APIs is below.

#### getAnnotations: () => Array AnnotationInfo

The `getAnnotations` API returns an array of the annotations in the content. The array is ordered
by the DOM position of the first annotation marker. Each annotation contains the following information:

* uid: the unique identifier for the annotation
* original: the first annotation marker in the content. We will probably stop including this soon. Consider
it deprecated.
* xpath: the xpath location of the entire annotation range in the format specified by the XPath section above

#### removeAnnotation: (uid: string) => void

The `removeAnnotation` API removes a specified annotation from the content. The annotation is specified
via its unique identifier (uid). Any annotation markers associated with that anontation will also be removed.

#### removeAllAnnotation: () => void

The `removeAllAnnotations` API removes every annotation from the content. All associated annotation markers
will also be removed.

#### setAnnotations: (annotations: Array AnnotationInfo) => void

The `setAnnotations` API takes an array of ordered annotations (by DOM position), and applies them to the
content. We currently don't handle if it can't resolve the xpath in the content. This would be a likely
improvement in the future.

### Commands

The `tinymce-xpath-annotations-example` plugin also adds a single command to TinyMCE: `xpath.add-annotation`

#### xpath.add-annotation

The `xpath.add-annotation` command creates a annotation with the specified `uid` **at the current cursor**.
If the selection is collapsed, it will try and grab the nearest 'word' first. This API differs from the other
APIs as it directly interacts with the user's current selection.

The format of the command is this:

```
editor.execComand('xpath.add-annotation', {
  uid: 'this-is-the-identifier-I-want-to-use'
});
```

This API is built on the experimental Annotator API. You can pass through additional things as well as
uid if you want, but at the moment, they won't do anything.

### Events

The `tinymce-xpath-annotations-example` plugin adds several events to `editor`. These are:

* xpath.annotation-moved
* xpath.no-annotation-selected
* xpath.annotation-selected

Note, these event names are all expected to change in the future.

#### xpath.annotation-moved

This event is fired when the xpath of a particular annotation has changed. The event will be
passed the uid of the annotation, and its new xpath.

```
ed.on('xpath.annotation-moved', function (data) {
  console.log('Annotation: ' + data.uid, 'New xpath', data.xpath);
})
```

#### xpath.no-annotation-selected

This event is fired when the user moves the cursor to a location in the content that is
not within a xpath annotation. No data is passed to it.

```
editor.on('xpath.no-annotation-selected', function () {
  console.log('The cursor is not in an annotation');
});
```

#### xpath.annotation-selected

This event is fired when the user moves the cursor to a location that **is** within
a xpath annotation. It is passed data containing the annotation uid.

```
editor.on('xpath.annotation-selected', function (data) {
  console.log('The cursor in in annotation: ' + data.uid);
});
```
