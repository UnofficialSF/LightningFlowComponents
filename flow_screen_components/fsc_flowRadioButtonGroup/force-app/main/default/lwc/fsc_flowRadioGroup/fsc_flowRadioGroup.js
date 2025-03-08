import { LightningElement, api } from 'lwc';

export default class Fsc_flowRadioGroup extends LightningElement {
    @api label;
    @api name;
    @api options; // [{label: 'Option 1', value: '1'}, {label: 'Option 2', value: '2'}]
    @api type; // Radio or Button
    @api fieldLevelHelp;
    @api disabled;
    @api required;
    @api value;

    handleValueChange(event) {
        this.dispatchEvent(new CustomEvent('valuechange', {
            detail: {
                newValue: event.target.value
            }
        }));
    }
}