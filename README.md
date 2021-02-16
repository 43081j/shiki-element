# shiki-element

A simple web component to render code using the
[shiki](https://github.com/shikijs/shiki) library for syntax highlighting.

## Install

```
$ npm i -S shiki-element
```

## Usage

First, **you must tell shiki where to load external resources** (e.g. themes
and languages).

You can do this via `setCDN`:

```js
// could be 'shiki' if you're using a bundler
import {setCDN} from 'shiki/dist/index.browser.mjs';

// some path on your server which contains shiki
setCDN('/node_modules/shiki/');

// or use a CDN
setCDN('https://unpkg.com/shiki/')
```

You can then load the `shiki-highlight` element via a script tag:

```html
<script src="./node_modules/shiki-element/lib/shiki-element.js" type="module">
</script>
```

or an import:

```ts
import 'shiki-element';

// or if you have no bundler/import maps
import './node_modules/shiki-element/lib/shiki-element.js';
```

You may then use the element like so:

```html
<shiki-highlight>
  {
    console.log('Hello world!');
  }
</shiki-highlight>
```
