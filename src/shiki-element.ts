import * as shiki from 'shiki/dist/index.browser.mjs';

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
  constructor() {
    super();

    this.attachShadow({mode: 'open'});
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
    this._observer.observe(this, {characterData: true, subtree: true});
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
    if (!this.shadowRoot || !this._highlighter) {
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
