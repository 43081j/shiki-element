import * as assert from 'uvu/assert';
import * as shiki from 'shiki/dist/index.browser.mjs';
import {ShikiHighlightElement} from '../shiki-element.js';
import * as hanbi from 'hanbi';

shiki.setCDN('/node_modules/shiki/');

const waitForSelector = (
  node: HTMLElement | DocumentFragment,
  selector: string
) =>
  new Promise((res) => {
    const fn = () => {
      const el = node.querySelector(selector);
      if (el) {
        res(el);
      } else {
        setTimeout(fn, 10);
      }
    };

    fn();
  });

const waitForFunction = (assertion: () => boolean) =>
  new Promise<void>((res) => {
    const fn = () => {
      if (assertion()) {
        res();
      } else {
        setTimeout(fn, 10);
      }
    };

    fn();
  });

describe('shiki-highlight', () => {
  let element: ShikiHighlightElement;

  beforeEach(() => {
    element = document.createElement('shiki-highlight');
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
    hanbi.restore();
  });

  it('should upgrade to the correct element and set defaults', () => {
    assert.instance(element, ShikiHighlightElement);
    assert.equal(element.options, {
      theme: 'nord'
    });
    assert.equal(element.language, 'js');
  });

  it('should react to content changes', async () => {
    element.textContent = 'fn(param);';
    await waitForSelector(element.shadowRoot!, 'pre.shiki');

    element.textContent = '1 + 1 = 4;';
    await waitForFunction(
      () => element.shadowRoot!.textContent!.trim() === '1 + 1 = 4;'
    );
  });

  describe('language', () => {
    it('should be settable by attribute', () => {
      element.setAttribute('language', 'ts');
      assert.is(element.language, 'ts');
    });

    it('should trigger render when changed', async () => {
      element.textContent = 'fn(param: string);';
      element.language = 'ts';
      await waitForSelector(element.shadowRoot!, 'pre.shiki');
      assert.is(element.shadowRoot!.textContent!.trim(), 'fn(param: string);');
    });
  });

  describe('options', () => {
    it('should trigger render when changed', async () => {
      element.textContent = 'fn(param);';
      await waitForSelector(element.shadowRoot!, 'pre.shiki');

      const contents = element.shadowRoot!.innerHTML;

      element.options = {theme: 'github-light'};
      await waitForFunction(() => element.shadowRoot!.innerHTML !== contents);
    });
  });

  describe('CDN', () => {
    it('should exist', async () => {
      const descriptor = Object.getOwnPropertyDescriptor(
        Object.getPrototypeOf(element),
        'cdn'
      );
      assert.ok(descriptor?.set);
    });
  });
});
