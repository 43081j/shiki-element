import '../shiki-element.js';

import * as assert from 'uvu/assert';
import {ShikiHighlightElement} from '../shiki-element.js';
import * as hanbi from 'hanbi';

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
      theme: 'nord',
      lang: 'js'
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
      element.language = 'ts';
      element.textContent = 'fn(param: string);';
      await waitForFunction(
        () => element.shadowRoot!.textContent!.trim() === 'fn(param: string);'
      );
      assert.ok(element.shadowRoot!.querySelector('pre.shiki'));
    });
  });

  describe('options', () => {
    it('should trigger render when changed', async () => {
      element.textContent = 'fn(param);';
      await waitForSelector(element.shadowRoot!, 'pre.shiki');

      const contents = element.shadowRoot!.innerHTML;

      element.options = {theme: 'github-light', lang: 'js'};
      await waitForFunction(() => element.shadowRoot!.innerHTML !== contents);
    });
  });
});
