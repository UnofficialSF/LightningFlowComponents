import { api, track, LightningElement } from "lwc";

const CB_TRUE = "CB_TRUE"; // Used with fsc_flowCheckbox component
const CB_FALSE = "CB_FALSE"; // Used with fsc_flowCheckbox component
const CB_ATTRIB_PREFIX = "cb_"; // Used with fsc_flowCheckbox component

export default class QuickChoiceCpe extends LightningElement {
    static delegatesFocus = true;
    versionNumber = "2.47";
    staticChoicesModalClass = "staticChoicesModal";
    _builderContext;
    _values;

    @api staticChoicesString;

    @track inputValues = {
        displayMode: { value: null, valueDataType: null, isCollection: false, label: "Display the choices as:" },
        inputMode: { value: null, valueDataType: null, isCollection: false, label: "Select datasource:" },
        allowNoneToBeChosen: { value: null, valueDataType: null, isCollection: false, label: "Add a 'None' choice" },
        sortList: { value: null, valueDataType: null, isCollection: false, label: "Sort Picklist by Label" },
        required: { value: null, valueDataType: null, isCollection: false, label: "Required" },
        masterLabel: { value: null, valueDataType: null, isCollection: false, label: "Master Label" },
        helpText: {
            value: null,
            valueDataType: null,
            isCollection: false,
            label: "Help Text",
            helpText: "Optional help text to show with the Master Label"
        },
        value: { value: null, valueDataType: null, isCollection: false, label: "Value (Default or Existing)" },
        style_width: { value: null, valueDataType: null, isCollection: false, label: "Width (Pixels)" },
        numberOfColumns: { value: null, valueDataType: null, isCollection: false, label: "Number of Columns" },
        includeIcons: { value: null, valueDataType: null, isCollection: false, label: "Show Icons" },
        navOnSelect: { value: false, valueDataType: null, isCollection: false, label: "InstantNavigation Mode" },
        choiceIcons: { value: null, valueDataType: null, isCollection: true, label: "Choice Icons [Card Icons]" },
        iconSize: { value: null, valueDataType: null, isCollection: false, label: "Icon Size" },
        objectName: { value: null, valueDataType: null, isCollection: false, label: "Select Object" },
        fieldName: { value: null, valueDataType: null, isCollection: false, label: "Select Field" },
        recordTypeId: { value: null, valueDataType: null, isCollection: false, label: "Filter on Record Type ID:" },
        dependentPicklist: {
            value: null,
            valueDataType: null,
            isCollection: false,
            label: "Is this a Dependent Picklist?",
            helpText:
                "Check this box if this is a dependent picklist and you will be defining a controlling value.  The controlling value can either be a picklist field value or a checkbox field value"
        },
        cb_dependentPicklist: { value: null, valueDataType: null, isCollection: false, label: "" },
        controllingPicklistValue: {
            value: null,
            valueDataType: null,
            isCollection: false,
            label: "Controlling Value (Picklist Field):"
        },
        controllingCheckboxValue: {
            value: null,
            valueDataType: null,
            isCollection: false,
            label: "Controlling Value (Checkbox Field):"
        },
        choiceLabels: { value: null, valueDataType: null, isCollection: true, label: "Choice Labels [Card Titles]" },
        choiceValues: {
            value: null,
            valueDataType: null,
            isCollection: true,
            label: "Choice Values [Card Descriptions]"
        },
        staticChoicesString: {
            value: null,
            valueDataType: null,
            isCollection: false,
            label: "String of Static Choice (JSON)"
        },
        richTextFlagString: {
            value: null,
            valueDataType: null,
            isCollection: false,
            label: "Use Rich Text for Descriptions?"
        }
    };

    settings = {
        displayModeVisualCards: "Visual",
        displayModePicklist: "Picklist",
        displayModeRadio: "Radio",
        inputModePicklist: "Picklist Field",
        inputModeDualCollection: "Dual String Collections",
        inputModeSingleCollection: "Single String Collection",
        inputModeStaticChoices: "Static Choices",
        inputValueRecordTypeId: "recordTypeId",
        choiceLabelsPicklistLabelsLabel: "Choice Labels",
        choiceLabelsPicklistValuesLabel: "Choice Values",
        choiceLabelsCardLabelsLabel: "Card Titles (Labels)",
        choiceLabelsCardValuesLabel: "Card Descriptions (Values)",
        attributeObjectName: "objectName",
        attributeFieldName: "fieldName",
        attributeInputMode: "inputMode",
        flowDataTypeString: "String",
        availableFieldTypesPicklist: "Picklist",
        inputAttributePrefix: "select_",
        singleColumn: "1"
    };

    displayChoicesAsOptions = [
        { label: "Picklist", value: "Picklist" },
        { label: "Radio Button Group", value: "Radio" },
        { label: "Visual Cards", value: "Visual" }
    ];

    numberOfColumnOptions = [
        { label: "1", value: "1" },
        { label: "2", value: "2" }
    ];

    iconSizeOptions = [
        { label: "x-small", value: "x-small" },
        { label: "small", value: "small" },
        { label: "medium", value: "medium" },
        { label: "large", value: "large" }
    ];

    selectDataSourceOptions = [
        { label: "A Picklist field", value: this.settings.inputModePicklist },
        { label: "Two String Collections (Labels and Values)", value: this.settings.inputModeDualCollection },
        { label: "One String Collection (Values)", value: this.settings.inputModeSingleCollection },
        { label: "Static Choices", value: this.settings.inputModeStaticChoices }
    ];

    useValuesOptions = [
        { label: "Yes", value: "true" },
        { label: "No", value: null }
    ];
    useValues;
    get disableLabels() {
        return !this.useValues;
    }
    handleUseValuesClick(event) {
        this.useValues = event.detail.value;
    }

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

    @api get automaticOutputVariables() {
        console.log("automaticvars: " + JSON.stringify(this._automaticOutputVariables));
        return this._automaticOutputVariables;
    }

    set automaticOutputVariables(value) {
        this._automaticOutputVariables = value;
    }

    _automaticOutputVariables;

    @track staticChoices = [this.newChoice()];
    @track tempStaticChoices = [];

    get isVisualCards() {
        return this.inputValues.displayMode.value === this.settings.displayModeVisualCards;
    }

    get isDatasourcePicklist() {
        return this.inputValues.inputMode.value === this.settings.inputModePicklist;
    }

    get isDatasourceDualCollection() {
        return this.inputValues.inputMode.value === this.settings.inputModeDualCollection;
    }

    get isNavOnSelect() {
        return this.inputValues.inputMode.value === this.settings.navOnSelect;
    }

    get isDatasourceSingleOrDualCollection() {
        return (
            this.inputValues.inputMode.value === this.settings.inputModeSingleCollection ||
            this.inputValues.inputMode.value === this.settings.inputModeDualCollection
        );
    }

    get isDatasourceStaticChoices() {
        return this.inputValues.inputMode.value === this.settings.inputModeStaticChoices;
    }

    get staticChoicesModal() {
        return this.template.querySelector("." + this.staticChoicesModalClass);
    }

    get isRichText() {
        return this.inputValues.richTextFlagString.value === "RICHTEXT";
    }

    get showControllingValues() {
        return this.inputValues.cb_dependentPicklist.value === CB_TRUE;
    }

    initializeValues(value) {
        console.log("automaticvars init: " + JSON.stringify(this._automaticOutputVariables));
        if (this._values && this._values.length) {
            this._values.forEach((curInputParam) => {
                if (curInputParam.name && this.inputValues[curInputParam.name]) {
                    this.inputValues[curInputParam.name].value = curInputParam.value;
                    this.inputValues[curInputParam.name].valueDataType = curInputParam.valueDataType;
                    if (curInputParam.name === "staticChoicesString") {
                        // console.log('The current input param is staticChoicesString, so we parse it into our staticChoices variable. '+ curInputParam.value);
                        this.staticChoices = JSON.parse(curInputParam.value);
                    }
                }
            });
        }
        this.setInputMode();
        this.setChoiceLabels();
    }

    setChoiceLabels() {
        if (
            this.inputValues.displayMode.value === this.settings.displayModeVisualCards &&
            this.inputValues.choiceLabels.label !== this.settings.choiceLabelsCardLabelsLabel
        ) {
            this.inputValues.choiceLabels.label = this.settings.choiceLabelsCardLabelsLabel;
            this.inputValues.choiceValues.label = this.settings.choiceLabelsCardValuesLabel;
        }
        if (
            this.inputValues.displayMode.value !== this.settings.displayModeVisualCards &&
            this.inputValues.choiceLabels.label !== this.settings.choiceLabelsPicklistLabelsLabel
        ) {
            this.inputValues.choiceLabels.label = this.settings.choiceLabelsPicklistLabelsLabel;
            this.inputValues.choiceValues.label = this.settings.choiceLabelsPicklistValuesLabel;
        }
    }

    setInputMode() {
        // if (this.inputValues.displayMode.value === this.settings.displayModeVisualCards && this.inputValues.inputMode.value !== this.settings.inputModeDualCollection) {
        //     this.dispatchFlowValueChangeEvent(this.settings.attributeInputMode, this.settings.inputModeDualCollection, this.settings.flowDataTypeString);
        // }
    }

    newChoice(label, value) {
        return {
            label: label,
            value: value
        };
    }

    handlePickObjectAndFieldValueChange(event) {
        if (event.detail) {
            this.dispatchFlowValueChangeEvent(
                this.settings.attributeObjectName,
                event.detail.objectType,
                this.settings.flowDataTypeString
            );
            this.dispatchFlowValueChangeEvent(
                this.settings.attributeFieldName,
                event.detail.fieldName,
                this.settings.flowDataTypeString
            );
        }
    }

    handleFlowComboboxValueChange(event) {
        if (event.target && event.detail) {
            let curAttributeName = event.target.name.replace(this.settings.inputAttributePrefix, "");
            let curAttributeValue = event.detail.newValue;
            let curAttributeType = event.detail.newValueDataType;

            if (curAttributeName == "controllingPicklistValue") {
                this.inputValues.controllingCheckboxValue.value = null;
                this.dispatchFlowValueChangeEvent("controllingCheckboxValue", null, curAttributeType);
            }

            if (curAttributeName == "controllingCheckboxValue") {
                this.inputValues.controllingPicklistValue.value = null;
                this.dispatchFlowValueChangeEvent("controllingPicklistValue", null, curAttributeType);
            }

            this.dispatchFlowValueChangeEvent(curAttributeName, curAttributeValue, curAttributeType);
        }
    }

    handleValueChange(event) {
        if (event.target) {
            let curAttributeName = event.target.name
                ? event.target.name.replace(this.settings.inputAttributePrefix, "")
                : null;
            let curAttributeValue = event.target.type === "checkbox" ? event.target.checked : event.detail.value;
            let curAttributeType;
            switch (event.target.type) {
                case "checkbox":
                    curAttributeType = "Boolean";
                    break;
                case "number":
                    curAttributeType = "Number";
                    break;
                default:
                    curAttributeType = "String";
            }

            if (curAttributeName == "richTextFlagString") {
                curAttributeValue = event.target.checked ? "RICHTEXT" : null;
                curAttributeType = "String";
                this.inputValues.richTextFlagString.value = curAttributeValue;
            }

            console.log(
                "The current attribute name is " +
                    curAttributeName +
                    " and the current attribute value is " +
                    curAttributeValue
            );
            console.log("The current attribute type is " + curAttributeType);
            this.dispatchFlowValueChangeEvent(curAttributeName, curAttributeValue, curAttributeType);
        }
    }

    handleCheckboxChange(event) {
        if (event.target && event.detail) {
            let changedAttribute = event.target.name.replace(this.settings.inputAttributePrefix, "");
            this.dispatchFlowValueChangeEvent(changedAttribute, event.detail.newValue, event.detail.newValueDataType);
            this.dispatchFlowValueChangeEvent(
                CB_ATTRIB_PREFIX + changedAttribute,
                event.detail.newStringValue,
                "String"
            );
        }
    }

    // Static Choice event handlers
    // When a lightning-input receives focus, automatically select all text in the input (to make it easier to cut, copy, edit, etc)
    handleStaticChoiceFocus(event) {
        if (event.currentTarget) {
            let value = event.currentTarget.value;
            if (value && value.length) {
                event.currentTarget.selectionStart = 0;
                event.currentTarget.selectionEnd = value.length;
            }
        }
    }

    /*
    // Goal is to have the Value autopopulate from the Label after a user blurs from label
    handleStaticChoiceBlur(event) {
        let propertyName = event.currentTarget.dataset.property;
        if (propertyName === 'label') {
            let valueInput = this.template.querySelector('.staticChoiceRow lightning-input[data-property="value"][data-index="' + event.currentTarget.dataset.index + '"]');
            if (!valueInput || !valueInput.value) {
                valueInput.value = event.currentTarget.value;
            }
        }
    }
    */

    handleStaticChoiceChange(event) {
        const index = event.currentTarget.dataset.index;
        const value = event.currentTarget.value;
        let propertyName = event.currentTarget.dataset.property;
        console.log(
            'We are setting the "' + propertyName + '" property on choice with index #' + index + " to: " + value
        );
        this.tempStaticChoices[index][propertyName] = value;
    }

    handleAddChoiceClick() {
        this.tempStaticChoices.push(this.newChoice());
        this.staticChoicesModal.focusSelectorString =
            '.staticChoiceRow lightning-input[data-index="' + (this.tempStaticChoices.length - 1) + '"]';
    }

    handleClearAllChoicesClick() {
        this.tempStaticChoices = [this.newChoice()];
        this.staticChoices.focusSelectorString = ".staticChoiceRow lightning-input";
    }

    handleStaticChoicesOpen() {
        // Create a clone of the list of static choices to use as temp values while the modal is open
        this.tempStaticChoices = this.staticChoices.map((choice) => {
            return Object.assign({}, choice);
        });
        this.staticChoicesModal.open();
    }

    handleStaticChoiceMoveUp(event) {
        let index = event.currentTarget.dataset.index;
        if (index) {
            // this excludes index of 0, which can't be moved up
            const movingChoice = this.tempStaticChoices.splice(index, 1);
            this.tempStaticChoices.splice(index - 1, 0, ...movingChoice);
        }
    }

    handleStaticChoiceMoveDown(event) {
        let index = event.currentTarget.dataset.index;
        if (index && this.index != this.tempStaticChoices.length - 1) {
            // this includes the final index, which can't be moved down
            const movingChoice = this.tempStaticChoices.splice(index, 1);
            this.tempStaticChoices.splice(Number(index) + 1, 0, ...movingChoice);
        }
    }

    handleStaticChoicesSave() {
        console.log("in handleStaticChoicesSave");
        // We used to handle validation here, but now that's been offloaded to the modal

        // Clone the updated tempStaticChoices into staticChoices, then delete the temps
        this.staticChoices = this.tempStaticChoices.map((choice) => {
            return { label: choice.label, value: choice.value };
        });
        this.tempStaticChoices = [];

        this.staticChoicesModal.close();
        // Stringify the new saved list of choices, and dispatch that value. This will be parsed in initializeValues() when the component is next loaded
        this.inputValues.staticChoicesString.value = JSON.stringify(this.staticChoices);
        // let labels = this.staticChoices.map(choice => { return choice.label });
        // let values = this.staticChoices.map(choice => { return choice.value });
        this.dispatchFlowValueChangeEvent(
            "staticChoicesString",
            this.inputValues.staticChoicesString.value,
            this.settings.flowDataTypeString
        );
    }

    handleStaticChoiceDelete(event) {
        const index = event.currentTarget.dataset.index;
        this.tempStaticChoices.splice(index, 1);
        if (this.tempStaticChoices.length === 0) {
            this.tempStaticChoices.push(this.newChoice());
        }
    }

    dispatchFlowValueChangeEvent(id, newValue, newValueDataType) {
        const valueChangedEvent = new CustomEvent("configuration_editor_input_value_changed", {
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

    /* CODE NOT CURRENTLY IN USE 
    
    // handleDropzoneDrop(event) {
    //     console.log('initial list = ' + JSON.stringify(this.tempStaticChoices))
    //     this.tempStaticChoices = event.detail.reorderedList;
    //     console.log('reorderedList = ' + JSON.stringify(this.tempStaticChoices));
    // }


    */
}
