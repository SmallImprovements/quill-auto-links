# Quill Auto Links Module

A module for the [Quill Rich Text Editor](https://quilljs.com) to
transform http links (typed or pasted) to `<a>` tags automatically.


## Demo

[Plunker](https://plnkr.co/edit/GqPEPNGVsBSat9tklWpx?p=preview)

## Usage

```javascript
import Quill from 'quill';
import AutoLinks from 'quill-auto-links';

Quill.register('modules/autoLinks', AutoLinks);

const quill = new Quill(editor, {
  modules: {
    autoLinks: true
  }
});
```

## Options

- `paste` Enable link formatting when pasting text - defaults to `true`
- `type ` Enable link formatting when typing text - defaults to `true`

Examples:
```javascript

// Enable for pasting and typing
const quill1 = new Quill(editor, {
  modules: {
    autoLinks: true
  }
});

// Disable for pasting and typing
const quill2 = new Quill(editor, {
  modules: {
    autoLinks: {
      paste: false,
      type: false
    }
  }
});


// Disable for pasting, but enable for typing

const quill3 = new Quill(editor, {
  modules: {
    autoLinks: {
      paste: false,
      type: true
    }
  }
});

```


--------------------------------------------

[![Small Improvements](https://www.small-improvements.com/images/logo/complete/40.png "Small Improvements")](http://www.small-improvements.com)
