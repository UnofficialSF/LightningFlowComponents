import { LightningElement, api, track, wire } from "lwc";
import { FlowAttributeChangeEvent, FlowNavigationNextEvent } from "lightning/flowSupport";
import { getPicklistValues } from "lightning/uiObjectInfoApi";
import Quickchoice_Images from "@salesforce/resourceUrl/fsc_Quickchoice_Images"; //Static Resource containing images for Visual Cards
import formFactor from "@salesforce/client/formFactor"; //Used to determine if the device is a phone or not

/* eslint-disable no-alert */
/* eslint-disable no-console */

const CB_TRUE = "CB_TRUE";

export default class QuickChoiceFSC extends LightningElement {
    bottomPadding = "slds-p-bottom_x-small";

    @api
    availableActions = [];

    @api
    get masterLabel() {
        return this._masterLabel;
    }
    set masterLabel(ml_value) {
        this._masterLabel = ml_value;
    }
    _masterLabel;

    @api helpText;
    get showHelpText() {
        return this.helpText?.length > 0 ? "slds-show" : "slds-hide";
    }

    @api
    get choiceLabels() {
        return this._choiceLabels;
    }
    set choiceLabels(value) {
        if (value != null) {
            this._choiceLabels = value;
            if (this.isConnected) {
                this._handleChoiceCollections();
            }
        }
    }
    _choiceLabels = [];

    @api
    get choiceValues() {
        return this._choiceValues;
    }
    set choiceValues(value) {
        if (value != null) {
            this._choiceValues = value;
            if (this.isConnected) {
                this._handleChoiceCollections();
            }
        }
    }
    _choiceValues = [];

    @api displayMode; //Picklist, Radio, Card (3 different selection types) - Visual is equivalent to Card

    @api numberOfColumns; //for Visual Pickers only, 1(default) or 2

    @api richTextFlagString; //Show Visual Card descriptions as RichText if value = RICHTEXT
    get showAsRichText() {
        return this.richTextFlagString == "RICHTEXT";
    }

    //-------------For inputMode = Picklist
    @api allowNoneToBeChosen; //For picklist field only
    @api sortList; //used for picklist fields

    @api
    get recordTypeId() {
        //used for picklist fields
        return this._recordTypeId;
    }
    set recordTypeId(rtvalue) {
        this._recordTypeId = !rtvalue ? this.masterRecordTypeId : rtvalue;
    }
    _recordTypeId;

    @api objectName; //used for picklist fields
    @api fieldName; //used for picklist fields

    _controllingPicklistValue;
    _controllingCheckboxValue;
    controllingValue;
    priorControllingValue = null;
    picklistFieldDetails;
    isControlledByCheckbox = false;
    priorOptions = [];
    firstPassCompleted = false;
    isConnected = false;
    @api isRendered = false;

    @api
    get dependentPicklist() {
        return this.cb_dependentPicklist == CB_TRUE ? true : false;
    }
    set dependentPicklist(value) {}

    @api cb_dependentPicklist;

    @api
    get controllingCheckboxValue() {
        return this._controllingCheckboxValue;
    }

    set controllingCheckboxValue(value) {
        if (value != null) {
            this._controllingCheckboxValue = value;
            this.controllingValue = value;
            if (value != this.priorControllingValue) {
                this.priorControllingValue = value;
                this.setPicklistSelections(this.picklistFieldDetails);
                if (this.isConnected) {
                    // Don't clear default value of dependent picklist on initial load v2.45
                    this.clearSelectedValue();
                }
            }
        }
    }

    @api
    get controllingPicklistValue() {
        return this._controllingPicklistValue;
    }

    set controllingPicklistValue(value) {
        if (value != null) {
            this._controllingPicklistValue = value;
            this.controllingValue = value;
            if (value != this.priorControllingValue) {
                this.priorControllingValue = value;
                this.setPicklistSelections(this.picklistFieldDetails);
                if (this.isConnected) {
                    // Don't clear default value of dependent picklist on initial load v2.45
                    this.clearSelectedValue();
                }
            }
        }
    }

    clearSelectedValue() {
        // v2.45 Clear current selected value if controlling value changes
        this.selectedValue = "";
        this.dispatchFlowAttributeChangedEvent("value", this._selectedValue);
    }

    //-------------For inputMode = Visual Text Box (Card)
    @api
    get choiceIcons() {
        return this._choiceIcons;
    }
    set choiceIcons(value) {
        if (value != null) {
            this._choiceIcons = value;
            if (this.isConnected) {
                this._handleChoiceCollections();
            }
        }
    }
    _choiceIcons = [];

    @api includeIcons;
    @api iconSize;
    @api navOnSelect;
    //deprecated as of v2.47
    @api isSameHeight;
    //deprecated as of v2.47
    @api isResponsive;

    //-------------For displayMode = Picklist or Radio
    @api style_width = 320;

    @api
    get staticChoicesString() {
        return this._staticChoicesString;
    }
    set staticChoicesString(jsonString) {
        if (jsonString != null) {
            this._staticChoicesString = jsonString;
            this.staticChoices = JSON.parse(jsonString);
        }
    }
    _staticChoicesString;

    @api
    get staticChoices() {
        return this._staticChoices || [];
    }
    set staticChoices(choices) {
        console.log(this._masterLabel + ": ", "setting staticChoices to " + JSON.stringify(choices));
        if (choices != null) {
            this._staticChoices = choices;
            this._choiceValues = [];
            this._choiceLabels = [];
            for (let choice of choices) {
                this._choiceValues.push(choice.value);
                this._choiceLabels.push(choice.label);
            }
        }
    }
    @track _staticChoices = [];

    masterRecordTypeId = "012000000000000AAA"; //if a recordTypeId is not provided, use this one

    @api
    get inputMode() {
        return this._inputMode;
    }
    set inputMode(im_value) {
        this._inputMode = im_value;
    }
    _inputMode;

    @api required;
    picklistOptionsStorage;

    // @track selectedValue;
    _selectedValue = null;
    @api
    get selectedValue() {
        return this._selectedValue;
    }
    set selectedValue(value) {
        this._selectedValue = value;
    }

    @track _selectedLabel;
    @track _allValues = [];
    @track _allLabels = [];
    @track showRadio = true;
    @track showVisual = false;
    @track legitInputModes = [
        "Picklist Field",
        "Single String Collection",
        "Dual String Collections",
        "Visual Text Box",
        "Static Choices"
    ];
    @track options = [];
    @track items = [];
    @track dualColumns = false;
    _picklistOptions = [];
    _showPicklist = true;
    _isControlled = false;

    @api
    get picklistOptions() {
        return this._picklistOptions;
    }

    set picklistOptions(data) {
        this._picklistOptions = data;
    }

    @api
    get showPicklist() {
        // Show if not controlled or if controlled that there are available picklist values
        this._controllingPicklistValue;
        return !this._isControlled || this._picklistOptions.length > 0 || this.isControlledByCheckbox;
    }

    set showPicklist(value) {
        this._showPicklist = value;
    }

    @api
    get isControlled() {
        return this._isControlled;
    }

    set isControlled(value) {
        this._isControlled = value;
    }

    @api
    get value() {
        return this._selectedValue;
    }

    set value(value) {
        this._selectedValue = value;
        this.setSelectedLabel();
    }

    @api get selectedLabel() {
        return this._selectedLabel;
    }

    set selectedLabel(value) {
        this._selectedLabel = value;
    }

    @api get allValues() {
        return this._allValues;
    }

    set allValues(value) {
        this._allValues = value;
    }

    @api get allLabels() {
        return this._allLabels;
    }

    set allLabels(value) {
        this._allLabels = value;
    }

    @api get radioGroup() {
        return "RG-" + this._masterLabel + "_RG";
    }

    set radioGroup(value) {
        this.radioGroup = value;
    }

    get requiredSymbol() {
        return this.required ? "*" : "";
    }

    //possibility master record type only works if there aren't other record types?
    @wire(getPicklistValues, {
        recordTypeId: "$recordTypeId",
        fieldApiName: "$calculatedObjectAndFieldName"
    })
    picklistValues({ error, data }) {
        if (data) {
            console.log(this._masterLabel + ": ", "getPicklistValues returned data", data);
            this.setPicklistSelections(data);
            this.picklistFieldDetails = data;
        } else if (error) {
            this.error = JSON.stringify(error);
            console.log(this._masterLabel + ": ", "getPicklistValues wire service returned error: " + this.error);
        }
    }

    get calculatedObjectAndFieldName() {
        console.log(this._masterLabel + ": ", "in getter: objectApiName is: " + this.objectName);
        console.log(this._masterLabel + ": ", "in getter: fieldApiName is: " + this.fieldName);
        console.log(this._masterLabel + ": ", "in getter: _recordTypeId is: " + this._recordTypeId);

        if (this.objectName && this.fieldName) {
            console.log(this._masterLabel + ": ", "satisfied calculatedObjectAndFieldName test");
            return `${this.objectName}.${this.fieldName}`;
        }
        return undefined;
    }

    // Process available selections for the picklist
    setPicklistSelections(data) {
        if (data != undefined) {
            this._picklistOptions = [];
            this._allValues = [];
            this._allLabels = [];
            if (this.allowNoneToBeChosen) {
                this._picklistOptions.push({ label: "--None--", value: "None" });
            }

            // Set isControlled only if a controlling value was provided and there are available controller values
            this._isControlled = false;
            let controllingIndex;
            if (Object.keys(data.controllerValues).length > 0) {
                this._isControlled = true;
                this._showPicklist = true;
                this.isControlledByCheckbox =
                    Object.keys(data.controllerValues)[0] === "false" && (Object.keys(data.controllerValues).length = 2)
                        ? true
                        : false;
                if (this.controllingValue == undefined && this.isControlledByCheckbox) {
                    this.controllingValue = "false"; // Start checkbox controlled picklists with a controlling value of false
                }
                controllingIndex = data.controllerValues[this.controllingValue];
            }

            // Picklist values
            data.values.forEach((key) => {
                if (!this._isControlled || key.validFor.includes(controllingIndex)) {
                    this._picklistOptions.push({
                        label: key.label,
                        value: key.value
                    });
                    if (this.displayMode === "Card" || this.displayMode === "Visual") {
                        this._choiceLabels.push(key.label);
                        this._choiceValues.push(key.value);
                        this.items.push({ name: key.label, description: null, icon: null });
                    }
                    this._allLabels.push(key.label);
                    this._allValues.push(key.value);
                }
            });

            // Sort Picklist Values
            this.picklistOptionsStorage = this.doSort(this._picklistOptions, this.sortList);

            if (this._inputMode === "Picklist Field") {
                this.setPicklistOptions();
            }
            if (this._allValues && this._allValues.length) {
                this.dispatchFlowAttributeChangedEvent("allValues", this._allValues);
                this.dispatchFlowAttributeChangedEvent("allLabels", this._allLabels);
            }
        }
    }

    setPicklistOptions() {
        this.options = this.picklistOptionsStorage;
        if (this._selectedValue) {
            this.setSelectedLabel();
        }
    }

    doSort(value, sortFlag) {
        if (!value) {
            return;
        }
        if (!sortFlag) {
            return value;
        }
        let fieldValue = (row) => row["label"] || "";
        return [
            ...value.sort(
                (a, b) => ((a = fieldValue(a).toUpperCase()), (b = fieldValue(b).toUpperCase()), (a > b) - (b > a))
            )
        ];
    }

    get gridClass() {
        return (
            (this.dualColumns
                ? "slds-form-element__control slds-grid slds-gutters_medium slds-wrap slds-grid_vertical-align-center slds-grid_vertical-stretch "
                : "slds-form-element__control ") + this.bottomPadding
        );
    }

    get gridStyle() {
        return this.dualColumns ? "width: auto;" : "";
    }

    get columnClass() {
        return this.dualColumns
            ? "slds-visual-picker slds-visual-picker_vertical slds-col slds-size_1-of-2 paddingFix"
            : "slds-visual-picker slds-visual-picker_vertical slds-col slds-size_1-of-1 paddingFix";
    }

    get cardSize() {
        return "min-height: min-content; height: 100% !important; width: auto !important";
    }

    get responsiveSize() {
        return this.dualColumns ? "" : "max-width: var(--lwc-sizeLarge,25rem); width: auto !important;";
    }

    _handleChoiceCollections() {
        console.log(this._masterLabel + ": ", "entering _handleChoiceCollections");
        // Visual Card Selection
        let items = []; //parameters for visual picker selection
        let index = 0;
        if (this.displayMode === "Card" || this.displayMode === "Visual") {
            this.showVisual = true;
            console.log(this._masterLabel + ": ", "includeIcons is: " + this.includeIcons);
            console.log(this._masterLabel + ": ", "_choiceIcons is: " + this._choiceIcons);
            if (!this.includeIcons || !this._choiceIcons) {
                console.log(this._masterLabel + ": ", "icons not needed");
                this._choiceIcons = this._choiceLabels;
            }
            if (this.numberOfColumns === "2") {
                if (formFactor === "Small") {
                    this.dualColumns = false;
                } else {
                    this.dualColumns = true;
                }
            }

            //User passes in Label collection of string for box header and Value collection of strings for box description
            console.log(this._masterLabel + ": ", "entering input mode Visual Text Box");
            console.log(this._masterLabel + ": ", "_choiceLabels is: " + this._choiceLabels);
            this._choiceLabels.forEach((label) => {
                //Add the correct path to custom images
                if (this._choiceIcons[index].includes(":")) {
                    items.push({ name: label, description: this._choiceValues[index], icon: this._choiceIcons[index] });
                } else {
                    items.push({
                        name: label,
                        description: this._choiceValues[index],
                        icon: Quickchoice_Images + "/" + this._choiceIcons[index]
                    });
                }
                console.log(this._masterLabel + ": ", "items is: " + items);
                index += 1;
            });
        }

        // console.log(this._masterLabel + ": ", "initializing QuickChoice. inputMode is: " + this._inputMode);
        let options = [];
        if (this.legitInputModes.includes(this._inputMode)) {
            // v2.42 Allow "Add a 'None' Choice" option for all valid picklist methods
            if (this.allowNoneToBeChosen) {
                options.push({ label: "--None--", value: "None" });
            }

            switch (this._inputMode) {
                //User can simply pass in a collection of strings as _choiceValues. The same text is used for both label and value
                case "Single String Collection":
                    console.log(this._masterLabel + ": ", "entering input mode String Collection");
                    console.log(this._masterLabel + ": ", "_choiceValues is: " + this._choiceValues);
                    //console.log ('splitting choice values would be: ' + this._choiceValues.split(','));
                    //let values = this._choiceValues.split(';');

                    this._choiceValues.forEach((value) => {
                        console.log(this._masterLabel + ": ", "value is: " + value);
                        options.push({ label: value, value: value });
                        console.log(this._masterLabel + ": ", "options is: " + options);
                    });
                    break;

                //User can  pass in one collection of strings for visible labels and another for the underlying values (such as recordIds)
                case "Dual String Collections":
                case "Static Choices":
                    console.log(this._masterLabel + ": ", "entering input mode Dual String Collections");
                    console.log(this._masterLabel + ": ", "_choiceValues is: " + this._choiceValues);
                    for (let i = 0; i < this._choiceLabels.length; i++) {
                        options.push({ label: this._choiceLabels[i], value: this._choiceValues[i] });
                    }
                    break;

                default:
            }
            this.options = options;
            this.items = items;
            this.setSelectedLabel();

            // v2.42 Clear the selected value if the options change on a reactive screen
            if (this.firstPassCompleted && options != this.priorOptions) {
                this.dispatchFlowAttributeChangedEvent("value", null);
            }
            this.priorOptions = options;
            this.firstPassCompleted = true;
        } else {
            console.log(this._masterLabel + ": ", "QuickChoiceFSC: Need a valid Input Mode value. Didn't get one");
            throw new Error(
                "QuickChoiceFSC: Need a valid Input Mode value. Didn't get one.  If this component has conditional visibility, you should set the Advanced option to 'Refresh inputs to incorporate changes elsewhere in the flow'."
            );
        }
    }

    connectedCallback() {
        console.log(this._masterLabel + ": ", "Entering Connected Callback for QuickChoice");
        console.log(this._masterLabel + ": ", "recordtypeId is: " + this._recordTypeId);
        if (!this._recordTypeId) this._recordTypeId = this.masterRecordTypeId;

        if (this.displayMode === "Picklist") {
            console.log(this._masterLabel + ": ", "setting Picklist on");
            this.showRadio = false;
        }

        this._handleChoiceCollections();
        this.isConnected = true;
    }

    //show default visual card as selected
    renderedCallback() {
        console.log(this._masterLabel + ": ", "Entering Rendered Callback for QuickChoice");
        if (this.showVisual && this.value != null) {
            if (this.template.querySelector('[data-id="' + this.value + '"]') != null) {
                this.template.querySelector('[data-id="' + this.value + '"]').checked = true;
            }
        }

        // Output default value for reactivity
        if (this._selectedValue != null) {
            this.dispatchFlowAttributeChangedEvent("value", this._selectedValue);
        }
        this.isRendered = true;
    }

    @api
    validate() {
        //If the component is invalid, return the isValid parameter as false and return an error message.
        console.log(this._masterLabel + ": ", "entering validate: required=" + this.required + " value=" + this.value);
        let errorMessage = "You must make a selection in: " + this._masterLabel + " to continue";

        if (this.required === true && !this.value) {
            return {
                isValid: false,
                errorMessage: errorMessage
            };
        }

        return { isValid: true };
    }

    handleChange(event) {
        console.log(this._masterLabel + ": ", "EVENT", event);
        this._selectedValue = this.showVisual ? event.target.value : event.detail.value;
        this.dispatchFlowAttributeChangedEvent("value", this._selectedValue);
        console.log(this._masterLabel + ": ", "selected value is: " + this._selectedValue);
        if (this.navOnSelect && this.availableActions.find((action) => action === "NEXT")) {
            const navigateNextEvent = new FlowNavigationNextEvent();
            this.dispatchEvent(navigateNextEvent);
        }
    }

    setSelectedLabel() {
        if (this.options && this.options.length) {
            let selectedOption = this.options.find((curOption) => curOption.value === this._selectedValue);
            if (selectedOption && selectedOption.label) {
                this._selectedLabel = selectedOption.label;
                this.dispatchFlowAttributeChangedEvent("selectedLabel", this._selectedLabel);
            }
        }
    }

    dispatchFlowAttributeChangedEvent(attributeName, attributeValue) {
        const attributeChangeEvent = new FlowAttributeChangeEvent(attributeName, attributeValue);
        this.dispatchEvent(attributeChangeEvent);
    }

    get inputStyle() {
        if (this.style_width) {
            return "max-width: " + this.style_width + "px";
        }
        return "";
    }

    get inputClass() {
        return this.bottomPadding;
    }
}
