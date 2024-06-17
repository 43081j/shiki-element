# shiki-element

A simple web component to render code using the
[shiki](https://github.com/shikijs/shiki) library for syntax highlighting.

## Install

```
$ npm i -S shiki-element
```

## Usage

You can load the `shiki-highlight` element by importing it in an ES module:

```ts
import 'shiki-element'; // registers the shiki highlight element
```

You may then use the element like so:

```html
<shiki-highlight>
  {
    console.log('Hello world!');
  }
</shiki-highlight>
```

You can specify the language:

```html
<shiki-highlight language="ts">
...
</shiki-highlight>
```

You can specify shiki options via the `options` property:

```ts
const node = document.querySelector('shiki-highlight');
node.options = {
  theme: 'nord',
  lang: 'ts'
};
```

### Styling

The following CSS variables are available:

| Name | Default | Summary |
| -- | -- | -- |
| `--shiki-padding` | `.4em` | Padding of the inner `pre` tag |
| `--shiki-overflow` | `auto` | Overflow of the inner `pre` tag |
