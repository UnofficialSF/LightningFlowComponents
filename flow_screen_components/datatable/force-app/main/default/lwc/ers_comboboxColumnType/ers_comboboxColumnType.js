import {LightningElement, api} from 'lwc';

export default class ers_comboboxColumnType extends LightningElement {
    @api editable;
    @api fieldName;
    @api keyField;
    @api keyFieldValue;
    @api picklistValues;
    @api value;
    @api alignment
    editMode = false;

    get options() {
        let _options = [];
        for(const key in this.picklistValues) {
            let option = {};
            // option.label = this.picklistValues[key];
            // option.value = key;
            option.label = key;
            option.value = this.picklistValues[key];
            _options.unshift(option);
        }
        return _options
    }

    //bump left/right depending on alignment. For center, we will align the grids on a the cell level
    get valueClass() {
        let _valueClass = "slds-col_bump-right slds-align-middle";
        if(this.alignment.includes("right")) {
            _valueClass = "slds-col_bump-left slds-align-middle";
        } else if(this.alignment.includes("center")) {
            _valueClass = "slds-align-middle";
        }
        return _valueClass;
    }

    //if alignment is center, we align the grid to center
    get cellClass() {
        let _cellClass = "combobox-view__min-height cell__is-editable slds-grid slds-p-vertical_xx-small slds-p-horizontal_x-small slds-var-m-around_xxx-small";
        if(this.alignment.includes("center")) {
            _cellClass += " slds-grid_align-center";
        }
        return _cellClass;
    }

    handleChange(event) {
        this.value = event.detail.value;
        //We will mimic the standard oncellchange event from lightning datatable
        let draftValue = {};
        let draftValues = [];
        draftValue[this.fieldName] = this.value;
        draftValue[this.keyField] = this.keyFieldValue;
        draftValues.push(draftValue);

        const customEvent = CustomEvent('combovaluechange', {
            composed: true,
            bubbles: true,
            cancelable: true,
            detail: {
                draftValues: draftValues
            },
        });
        this.dispatchEvent(customEvent)

        this.toggleEditMode();
        //remove combobox and remove focus
        this.template.querySelector("lightning-combobox").classList.add("slds-hide");
        this.template.querySelector("lightning-combobox").blur();
    }

    editCombobox(){
        this.toggleEditMode();
        //show the combobox & focus on it
        this.template.querySelector("lightning-combobox").classList.remove("slds-hide");
        this.template.querySelector("lightning-combobox").focus();
    }

    toggleEditMode() {
        this.editMode = !this.editMode;
    }
    
    //remove combobox when not focused
    focusout() {
        if(this.editMode) {
            this.toggleEditMode();
            this.template.querySelector("lightning-combobox").classList.add("slds-hide");
        }
    }
}
