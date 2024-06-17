import * as shiki from 'shiki';

declare global {
  interface CSSStyleSheet {
    replaceSync(contents: string): void;
  }

  interface ShadowRoot {
    adoptedStyleSheets: CSSStyleSheet[];
  }
}

type ShikiHighlightOptions = Parameters<typeof shiki.codeToHtml>[1];

const stylesheet = new CSSStyleSheet();
stylesheet.replaceSync(`
  :host {
    display: block;
  }

  pre.shiki {
    margin: 0;
    padding: var(--shiki-padding, .4em);
    overflow: var(--shiki-overflow, auto);
  }
`);

/**
 * Renders a block of code syntax highlighted using the shiki library.
 */
export class ShikiHighlightElement extends HTMLElement {
  protected _observer: MutationObserver;
  protected _highlightedContent?: string;
  protected _options: ShikiHighlightOptions = {
    theme: 'nord',
    lang: 'js'
  };

  /**
   * Gets the language we want to highlight
   */
  public get language(): string {
    return this._options.lang;
  }

  /**
   * Sets the language we want to highlight
   *
   * @param {string} val Language to set
   */
  public set language(val: string) {
    this._options = {
      ...this._options,
      lang: val
    };
    this._update();
  }

  /**
   * Gets the options to pass to shiki
   *
   * @return {ShikiHighlightOptions}
   */
  public get options(): ShikiHighlightOptions {
    return this._options;
  }

  /**
   * Sets the options to pass to shiki
   *
   * @param {ShikiHighlightOptions} val Options to set
   */
  public set options(val: ShikiHighlightOptions) {
    this._options = val;
    this._update();
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
    this._update();
  }

  /**
   * Called when the element is disconnected from the DOM tree.
   */
  public disconnectedCallback(): void {
    this._observer.disconnect();
  }

  protected _updating?: Promise<void>;

  /**
   * Queues an async update to rendering
   *
   * @return {Promise}
   */
  protected async _update(): Promise<void> {
    if (this._updating) {
      await this._updating;
    }

    this._updating = this._triggerUpdate();
  }

  /**
   * Triggers an async update to rendering
   *
   * @return {Promise}
   */
  protected async _triggerUpdate(): Promise<void> {
    this._highlightedContent = await shiki.codeToHtml(
      this.textContent ?? '',
      this.options
    );

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

    this._update();
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

    if (this._highlightedContent === undefined) {
      this.shadowRoot.innerHTML = '<slot></slot>';
      return;
    }

    this.shadowRoot.innerHTML = this._highlightedContent;
  }
}

window.customElements.define('shiki-highlight', ShikiHighlightElement);

declare global {
  interface HTMLElementTagNameMap {
    'shiki-highlight': ShikiHighlightElement;
  }
}
