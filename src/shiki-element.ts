/// <reference path="../custom_types/shiki.d.ts" />

import * as shiki from 'shiki/dist/index.browser.mjs';

declare global {
  interface CSSStyleSheet {
    replaceSync(contents: string): void;
  }

  interface ShadowRoot {
    adoptedStyleSheets: CSSStyleSheet[];
  }
}

const stylesheet = new CSSStyleSheet();
stylesheet.replaceSync(`
  :host {
    display: block;
  }

  pre.shiki {
    margin: 0;
    padding: var(--shiki-padding, .4em);
  }
`);

/**
 * Renders a block of code syntax highlighted using the shiki library.
 */
export class ShikiHighlightElement extends HTMLElement {
  protected _observer: MutationObserver;
  protected _highlighter?: shiki.Highlighter;
  protected _language: string = 'js';
  protected _options: shiki.HighlighterOptions = {
    theme: 'nord'
  };

  /**
   * Sets the CDN for shiki to load resources from.
   *
   * This can be local, e.g. "/node_modules".
   *
   * @param {string} val CDN path to set
   */
  public set cdn(val: string) {
    shiki.setCDN(val);
    this._initialiseHighlighter();
  }

  /**
   * Gets the language we want to highlight
   */
  public get language(): string {
    return this._language;
  }

  /**
   * Sets the language we want to highlight
   *
   * @param {string} val Language to set
   */
  public set language(val: string) {
    this._language = val;
    this._render();
  }

  /**
   * Gets the options to pass to shiki
   *
   * @return {shiki.HighlighterOptions}
   */
  public get options(): shiki.HighlighterOptions {
    return this._options;
  }

  /**
   * Sets the options to pass to shiki
   *
   * @param {shiki.HighlighterOptions } val Options to set
   */
  public set options(val: shiki.HighlighterOptions) {
    this._options = val;
    this._initialiseHighlighter();
  }

  /**
   * Gets the attributes we want to observe on the host
   */
  public static get observedAttributes(): string[] {
    return ['language'];
  }

  /** constructor */
  public constructor() {
    super();

    const root = this.attachShadow({mode: 'open'});
    root.adoptedStyleSheets = [stylesheet];
    this._render();

    this._observer = new MutationObserver((mutations) =>
      this._onDomChanged(mutations)
    );
  }

  /**
   * Called when an attribute on the host has changed.
   *
   * @param {string} name Name of the attribute which changed
   * @param {string} _oldValue Previous value the attribute was set to
   * @param {string} newValue New value the attribute has been set to
   * @return {void}
   */
  public attributeChangedCallback(
    name: string,
    _oldValue: string,
    newValue: string
  ): void {
    if (name === 'language') {
      this.language = newValue;
    }
  }

  /**
   * Called when the element is connected to the DOM tree.
   */
  public connectedCallback(): void {
    this._observer.observe(this, {
      characterData: true,
      subtree: true,
      childList: true
    });
    this._initialiseHighlighter();
  }

  /**
   * Called when the element is disconnected from the DOM tree.
   */
  public disconnectedCallback(): void {
    this._observer.disconnect();
  }

  /**
   * Initialises shiki's highlighter
   *
   * @return {Promise}
   */
  protected async _initialiseHighlighter(): Promise<void> {
    this._highlighter = await shiki.getHighlighter(this.options);
    this._render();
  }

  /**
   * Called when the element's light DOM has changed.
   *
   * @param {MutationRecord[]} _mutations Mutations which occurred
   * @return {void}
   */
  protected _onDomChanged(_mutations: MutationRecord[]): void {
    if (!this.shadowRoot) {
      return;
    }

    this._render();
  }

  /**
   * Renders the current text content via shiki
   *
   * @return {void}
   */
  protected _render(): void {
    if (!this.shadowRoot) {
      return;
    }

    if (!this._highlighter) {
      this.shadowRoot.innerHTML = '<slot></slot>';
      return;
    }

    const code = this._highlighter.codeToHtml(
      this.textContent ?? '',
      this.language
    );
    this.shadowRoot.innerHTML = code ?? '';
  }
}

window.customElements.define('shiki-highlight', ShikiHighlightElement);

declare global {
  interface HTMLElementTagNameMap {
    'shiki-highlight': ShikiHighlightElement;
  }
}
