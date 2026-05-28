import { LightningElement, api, track } from 'lwc';

export default class InlineRichTextEditor extends LightningElement {
    @api
    get value() {
        return this._value;
    }
    set value(val) {
        if (val && !this._initialValueSet) {
            this._value = val;
            this._initialValueSet = true;
        }
    }

    @track _value = '<p><b>Default Title</b></p><p><i>Default description</i></p><ul><li><p>Bullet 1</p></li><li><p>Bullet 2</p></li></ul>';
    @track isEditing = false;

    _initialValueSet = false;
    _focusOnRender = false;

    renderedCallback() {
        if (this._focusOnRender) {
            this._focusOnRender = false;
            const input = this.template.querySelector('lightning-input-rich-text');
            if (input) {
                input.focus();
            }
        }
    }
    
    get displayValue() {
        return this._value || '<p>Click the pencil to edit</p>';
    }

    handleEdit() {
        this.isEditing = true;
        this._focusOnRender = true;
    }

    handleSave() {
        this.isEditing = false;
        const valueChangeEvent = new CustomEvent('valuechange', {
            detail: {
                value: this._value
            }
        });
        this.dispatchEvent(valueChangeEvent);
    }

    handleChange(event) {
        this._value = event.target.value;
    }
} 