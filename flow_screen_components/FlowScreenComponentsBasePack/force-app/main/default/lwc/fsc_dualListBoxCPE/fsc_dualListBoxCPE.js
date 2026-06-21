import {LightningElement, track, api} from 'lwc';
import {
    defaults, inputTypeToOutputAttributeName, inputTypeToInputAttributeName
} from 'c/fsc_dualListBoxUtils';

export default class DualListBoxCpe extends LightningElement {

    _builderContext;
    _values;

    @track inputValues = {
        label: {value: null, valueDataType: null, isCollection: false, label: 'Master Label'},
        allOptionsStringFormat: {value: null, valueDataType: null, isCollection: false, label: 'Select datasource'},
        sourceLabel: {value: null, valueDataType: null, isCollection: false, label: 'Available Choices Label'},
        selectedLabel: {value: null, valueDataType: null, isCollection: false, label: 'Selected Chocies Label'},
        fieldLevelHelp: {value: null, valueDataType: null, isCollection: false, label: 'Help Text'},
        min: {value: null, valueDataType: null, isCollection: false, label: 'Min'},
        max: {value: null, valueDataType: null, isCollection: false, label: 'Max'},
        disableReordering: {value: null, valueDataType: null, isCollection: false, label: 'Disable Reordering'},
        size: {
            value: null,
            valueDataType: null,
            isCollection: false,
            label: 'Vertical Size of List Box (visible items)'
        },
        required: {value: null, valueDataType: null, isCollection: false, label: 'Required'},
        requiredOptions: {value: null, valueDataType: null, isCollection: true, label: 'Datasource for Choice Icons:'},
        useWhichObjectKeyForData: {
            value: null,
            valueDataType: null,
            isCollection: false,
            label: 'Use Which Object Key For Data'
        },
        useWhichObjectKeyForLabel: {
            value: null,
            valueDataType: null,
            isCollection: false,
            label: 'Use Which Object Key For Label'
        },
        useWhichObjectKeyForSort: {
            value: null,
            valueDataType: null,
            isCollection: false,
            label: 'Use Which Object Key For Sort'
        },
        useObjectValueAsOutput: {value: null, valueDataType: null, isCollection: false, label: 'Select Field'},
        allOptionsFieldDescriptorList: {
            value: null,
            valueDataType: null,
            isCollection: true,
            label: 'Field Descriptors'
        },
        allOptionsStringCollection: {value: null, valueDataType: null, isCollection: true, label: 'Values'},
        allOptionsStringCollectionLabels: {value: null, valueDataType: null, isCollection: true, label: 'Labels'},
        allOptionsCSV: {value: null, valueDataType: null, isCollection: false, label: 'CSV String'},
        selectedOptionsStringList: {value: null, valueDataType: null, isCollection: true, label: 'Select List Values'},
        selectedOptionsCSV: {value: null, valueDataType: null, isCollection: false, label: 'Selected CSV Values'},
        selectedOptionsFieldDescriptorList: {
            value: null,
            valueDataType: null,
            isCollection: true,
            label: 'Select Field Descriptor Values'
        }
    };

    selectDataSourceOptions = [
        {
            label: 'CSV String',
            value: defaults.csv,
            allowedAttributes: [inputTypeToOutputAttributeName.csv, inputTypeToInputAttributeName.csv]
        },
        {
            label: 'Two String Collections',
            value: defaults.twoLists,
            allowedAttributes: [inputTypeToOutputAttributeName.list, inputTypeToInputAttributeName.list, inputTypeToInputAttributeName.twoLists]
        },
        {
            label: 'One String Collections',
            value: defaults.list,
            allowedAttributes: [inputTypeToOutputAttributeName.list, inputTypeToInputAttributeName.list]
        },
        {
            label: 'FieldDescriptor Collection (use with Get Field Information action)',
            value: defaults.originalObject,
            allowedAttributes: [inputTypeToOutputAttributeName.object, inputTypeToInputAttributeName.object]
        }
    ];


    @api get builderContext() {
        return this._builderContext;
    }

    set builderContext(value) {
        this._builderContext = value;
    }

    @api get inputVariables() {
        return this._values;
    }

    set inputVariables(value) {

        this._values = value;
        this.initializeValues();
    }

    @api get automaticOutputVariables () {
        return this._automaticOutputVariables;
    }

    set automaticOutputVariables (value) {
        this._automaticOutputVariables = value;
    }

	_automaticOutputVariables;

    initializeValues(value) {
        if (this._values && this._values.length) {
            this._values.forEach(curInputParam => {
                if (curInputParam.name && this.inputValues[curInputParam.name]) {
                    this.inputValues[curInputParam.name].value = curInputParam.value;
                    this.inputValues[curInputParam.name].valueDataType = curInputParam.valueDataType;
                }
            });
        }
        this.handleDefaultAttributes();
    }

    handleDefaultAttributes() {
        let isChanged = false;
        if (this.isObject) {
            if (this.inputValues.useWhichObjectKeyForData.value !== defaults.fieldDescriptorValueAttribute) {
                this.inputValues.useWhichObjectKeyForData.value = defaults.fieldDescriptorValueAttribute;
                isChanged = true;
            }

        } else {
            if (this.inputValues.useWhichObjectKeyForData.value !== defaults.defaultValueAttribute) {
                this.inputValues.useWhichObjectKeyForData.value = defaults.defaultValueAttribute;
                isChanged = true;
            }
        }
        if (isChanged) {
            this.dispatchFlowValueChangeEvent(defaults.useWhichObjectKeyForData, this.inputValues.useWhichObjectKeyForData.value, defaults.typeString);
        }
    }

    handleValueChange(event) {
        if (event.target) {
            let curAttributeName = event.target.name ? event.target.name.replace(defaults.inputAttributePrefix, '') : null;
            let value = event.detail ? event.detail.value : event.target.value
            let curAttributeValue = event.target.type === 'checkbox' ? event.target.checked : value;
            let curAttributeType;
            switch (event.target.type) {
                case "checkbox":
                    curAttributeType = 'Boolean';
                    break;
                case "number":
                    curAttributeType = 'Number';
                    break;
                default:
                    curAttributeType = 'String';
            }
            this.dispatchFlowValueChangeEvent(curAttributeName, curAttributeValue, curAttributeType);
            if (curAttributeName === defaults.attributeNameAllOptionsStringFormat) {
                this.clearUnusedAttributes(curAttributeValue);
            }
        }
    }

    handleFlowComboboxValueChange(event) {
        if (event.target && event.detail) {
            let changedAttribute = event.target.name.replace(defaults.inputAttributePrefix, '');
            this.dispatchFlowValueChangeEvent(changedAttribute, event.detail.newValue, event.detail.newValueDataType);
        }

    }

    dispatchFlowValueChangeEvent(id, newValue, newValueDataType) {
        const valueChangedEvent = new CustomEvent('configuration_editor_input_value_changed', {
            bubbles: true,
            cancelable: false,
            composed: true,
            detail: {
                name: id,
                newValue: newValue ? newValue : null,
                newValueDataType: newValueDataType
            }
        });
        this.dispatchEvent(valueChangedEvent);
    }

    clearUnusedAttributes(newInputFormat) {
        let allAttributesToCheck = [...Object.values(inputTypeToOutputAttributeName), ...Object.values(inputTypeToInputAttributeName)];
        let curDataSourceOptions = this.selectDataSourceOptions.find(curDataSource => curDataSource.value === newInputFormat);
        allAttributesToCheck.forEach(curAttribute => {
            if (this.inputValues[curAttribute].value && (!curDataSourceOptions || !curDataSourceOptions.allowedAttributes.includes(curAttribute))) {
                this.inputValues[curAttribute].value = null;
                this.dispatchFlowValueChangeEvent(curAttribute, null, defaults.typeString);
            }
        });
    }

    get isLists() {
        if (this.inputValues.allOptionsStringFormat) {
            return this.inputValues.allOptionsStringFormat.value === defaults.twoLists || this.inputValues.allOptionsStringFormat.value === defaults.list;
        }

    }

    get isTwoLists() {
        if (this.inputValues.allOptionsStringFormat) {
            return this.inputValues.allOptionsStringFormat.value === defaults.twoLists;
        }
    }

    get isCSV() {
        if (this.inputValues.allOptionsStringFormat) {
            return this.inputValues.allOptionsStringFormat.value === defaults.csv;
        }
    }

    get isObject() {
        if (this.inputValues.allOptionsStringFormat) {
            return this.inputValues.allOptionsStringFormat.value === defaults.originalObject;
        }

    }

}