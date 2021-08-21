import { translate as $l } from "@padloc/locale/src/translate";
import { Vault } from "@padloc/core/src/vault";
import { Tag } from "@padloc/core/src/item";
import { app } from "../globals";
import { shared } from "../styles";
import { Input } from "./input";
import "./icon";
import { customElement, property, query, state } from "lit/decorators.js";
import { css, html, LitElement } from "lit";

@customElement("pl-tags-input")
export class TagsInput extends LitElement {
    @property({ type: Boolean })
    editing: boolean = false;

    @property({ attribute: false })
    vault: Vault | null = null;

    @property({ attribute: false })
    tags: Tag[] = [];

    @state()
    _showResults: Boolean = false;

    @query("pl-input")
    private _input: Input;

    private _focusTimeout: number = 0;

    static styles = [
        shared,
        css`
            :host {
                display: block;
                position: relative;
                z-index: 1;
                overflow: visible;
            }

            .results {
                padding: 0;
                border-radius: 0.5em;
                margin-top: 0;
                flex-direction: column;
                align-items: flex-start;
            }

            .results .tag {
                margin-top: 0.5em;
                background: var(--color-background);
            }

            .add-tag {
                overflow: visible;
                height: 2.2em;
                width: 10em;
            }

            .add-tag pl-input pl-icon {
                margin-left: 0.5em;
            }
        `,
    ];

    render() {
        const { tags, editing, vault, _showResults } = this;
        const { value } = this._input || { value: "" };
        const results = app.state.tags
            .filter(([t]) => !this.tags.includes(t) && t !== value && t.toLowerCase().startsWith(value))
            .map(([t]) => t);
        if (value) {
            results.push(value);
        }

        return html`
            <div class="tags">
                <div
                    class="tag highlight tap center-aligning spacing horizontal layout"
                    @click=${() => this._vaultClicked()}
                >
                    <pl-icon icon="vault"></pl-icon>

                    <div class="tag-name">${vault}</div>
                </div>

                ${tags.map(
                    (tag) => html`
                        <div
                            class="tap tag center-aligning spacing horizontal layout"
                            @click=${() => this._tagClicked(tag)}
                        >
                            <pl-icon icon="tag"></pl-icon>

                            <div>${tag}</div>

                            ${editing ? html` <pl-icon icon="cancel"></pl-icon> ` : ""}
                        </div>
                    `
                )}

                <div class="add-tag" ?hidden=${!editing}>
                    <pl-input
                        class="skinny dashed"
                        .placeholder=${$l("Add Tag")}
                        @enter=${() => this._addTag(value)}
                        @input=${() => this.requestUpdate()}
                        @focus=${() => this._focusChanged()}
                        @blur=${() => this._focusChanged()}
                    >
                        <pl-icon icon="add" slot="before"></pl-icon>
                    </pl-input>

                    <div class="tags results" ?hidden=${!_showResults}>
                        ${results.map(
                            (res) => html`
                                <div
                                    class="tag click center-aligning spacing horizontal layout"
                                    @click=${() => this._addTag(res)}
                                >
                                    <pl-icon icon="tag"></pl-icon>

                                    <div>${res}</div>
                                </div>
                            `
                        )}
                    </div>
                </div>
            </div>
        `;
    }

    private _addTag(tag: Tag) {
        if (!tag || this.tags.includes(tag)) {
            return;
        }
        this.tags.push(tag);
        this._input.value = "";
        this._showResults = false;
        this.requestUpdate();
    }

    private _tagClicked(tag: Tag) {
        if (this.editing) {
            this.tags = this.tags.filter((t) => t !== tag);
        }
    }

    private _vaultClicked() {
        this.dispatchEvent(new CustomEvent("move"));
    }

    _focusChanged() {
        clearTimeout(this._focusTimeout);
        setTimeout(() => (this._showResults = this._input.focused), this._input.focused ? 0 : 200);
    }
}
