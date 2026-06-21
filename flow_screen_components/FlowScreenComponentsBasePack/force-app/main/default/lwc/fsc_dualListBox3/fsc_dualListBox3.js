import { LightningElement, api, track, wire } from "lwc";
import { FlowAttributeChangeEvent } from "lightning/flowSupport";
import { getObjectInfo } from "lightning/uiObjectInfoApi";
import getPicklistValues from "@salesforce/apex/usf3.FieldPickerController.getPicklistValues";
import {
  defaults,
  inputTypeToOutputAttributeName,
  inputTypeToInputAttributeName,
} from "c/fsc_dualListBoxUtils";

export default class dualListBoxFSC extends LightningElement {
  @api label;
  @api sourceLabel;
  @api fieldLevelHelp;
  @api selectedLabel;

  @api min;
  @api max;
  @api disableReordering;
  @api size;
  @api required;
  @api requiredOptions;
  @api useWhichObjectKeyForData = defaults.valueField;
  @api useWhichObjectKeyForLabel = defaults.labelField;
  @api useWhichObjectKeyForSort;
  @api useObjectValueAsOutput = false;

  // New properties for picklist integration
  @api objectApiName;
  @api fieldApiName;
  @api usePicklistValues = false;

  _allOptionsStringFormat;
  @track selectedValuesStringFormat;
  @track _options = [];
  @track _selectedValues = [];
  @track optionValues = {};
  @track picklistValues = [];
  @track isLoading = false;
  @track errorMessage;
  @track _values = []; // Internal selected values storage

  get STORAGE_KEY() {
    // Extract field name from fieldApiName (could be object or string)
    let fieldName = "noField";
    if (this.fieldApiName) {
      if (typeof this.fieldApiName === "string") {
        try {
          const parsed = JSON.parse(this.fieldApiName);
          fieldName = parsed[0]?.name || parsed.name || "noField";
        } catch (e) {
          fieldName = this.fieldApiName;
        }
      } else if (this.fieldApiName.name) {
        fieldName = this.fieldApiName.name;
      }
    }

    return `dualListBox:${this.objectApiName || "noObject"}:${fieldName}`;
  }

  connectedCallback() {
    console.log("connectedCallback called");
    console.log("Initial _selectedValues:", this._selectedValues);
    console.log(
      "Initial selectedOptionsPicklist:",
      this.selectedOptionsPicklist
    );
    this.restoreSelectedValues();
  }

  disconnectedCallback() {
    // Only clear storage if we're not in the middle of validation
    // Validation might cause temporary disconnection, so we'll keep the storage
    console.log("disconnectedCallback called - keeping storage for validation");
    // window.sessionStorage.removeItem(this.STORAGE_KEY);
  }

  renderedCallback() {
    // Restore values after re-render (e.g., after validation fails)
    if (!this._selectedValues || this._selectedValues.length === 0) {
      this.restoreSelectedValues();
    }
  }

  restoreSelectedValues() {
    console.log("restoreSelectedValues called");
    console.log("STORAGE_KEY:", this.STORAGE_KEY);
    console.log("selectedValuesStringFormat:", this.selectedValuesStringFormat);
    console.log("allOptionsStringFormat:", this.allOptionsStringFormat);
    console.log("Current _selectedValues:", this._selectedValues);
    console.log(
      "Current selectedOptionsPicklist:",
      this.selectedOptionsPicklist
    );

    const cached = window.sessionStorage.getItem(this.STORAGE_KEY);
    console.log("cached value:", cached);

    // Don't restore if we don't have the format set yet
    if (!this.selectedValuesStringFormat) {
      console.log(
        "selectedValuesStringFormat not set yet, skipping restoration"
      );
      return;
    }

    // Check if we already have values from Flow Builder
    if (this._selectedValues && this._selectedValues.length > 0) {
      console.log(
        "Already have selected values from Flow Builder:",
        this._selectedValues
      );
      return;
    }

    // If _selectedValues is explicitly set to empty array, don't restore
    if (
      Array.isArray(this._selectedValues) &&
      this._selectedValues.length === 0
    ) {
      console.log("Values explicitly cleared - not restoring from storage");
      return;
    }

    if (cached) {
      try {
        const selectedValues = JSON.parse(cached);
        console.log("parsed selectedValues:", JSON.stringify(selectedValues));

        if (selectedValues && selectedValues.length > 0) {
          this._selectedValues = [...selectedValues];
          console.log(
            "Restored selected values:",
            JSON.stringify(this._selectedValues)
          );

          // Force a re-render by triggering a property change
          this._selectedValues = [...this._selectedValues];

          // Also dispatch to Flow to update the output
          const outputAttribute =
            inputTypeToOutputAttributeName[this.allOptionsStringFormat];
          let flowValue = this._selectedValues;

          if (
            this.allOptionsStringFormat === defaults.picklist ||
            this.allOptionsStringFormat === defaults.csv
          ) {
            flowValue = this._selectedValues.join(",");
          }

          this.dispatchEvent(
            new FlowAttributeChangeEvent(outputAttribute, flowValue)
          );
          console.log(
            "Dispatched restored values to Flow:",
            JSON.stringify(flowValue)
          );
        }
      } catch (e) {
        console.error("Error parsing cached values:", e);
      }
    } else {
      console.log("No cached values found");
    }
  }

  saveSelectedValues() {
    console.log("saveSelectedValues called");
    console.log("_selectedValues:", JSON.stringify(this._selectedValues));
    console.log("STORAGE_KEY:", this.STORAGE_KEY);

    if (this._selectedValues && this._selectedValues.length > 0) {
      const valueToSave = JSON.stringify(this._selectedValues);
      window.sessionStorage.setItem(this.STORAGE_KEY, valueToSave);
      console.log(
        "Saved selected values to sessionStorage:",
        JSON.stringify(valueToSave)
      );
    } else {
      console.log("No values to save");
    }
  }

  _pushToFlow() {
    console.log("_pushToFlow called");
    console.log("_values:", this._values);
    this._selectedValues = [...this._values];
    console.log("_selectedValues:", this._selectedValues);
    const outputAttribute =
      inputTypeToOutputAttributeName[this.allOptionsStringFormat];
    console.log("outputAttribute:", outputAttribute);
    let value = this._values;

    // Convert to appropriate format for the output attribute
    if (
      this.allOptionsStringFormat === defaults.picklist ||
      this.allOptionsStringFormat === defaults.csv
    ) {
      value = this._values.join(",");
    }
    console.log("value to dispatch:", value);

    this.dispatchEvent(new FlowAttributeChangeEvent(outputAttribute, value));
    window.sessionStorage.setItem(
      this.STORAGE_KEY,
      JSON.stringify(this._values)
    );
    console.log(
      "Saved to sessionStorage:",
      this.STORAGE_KEY,
      JSON.stringify(this._values)
    );
  }

  set allOptionsStringFormat(value) {
    this._allOptionsStringFormat = value;
    //TODO: ask if we need to have this as a separate list of types of output parameters

    this.selectedValuesStringFormat = value;
    if (
      inputTypeToInputAttributeName[value] &&
      this.optionValues[inputTypeToInputAttributeName[value]]
    ) {
      this._options = this.optionValues[inputTypeToInputAttributeName[value]];
    }
    if (
      !this._selectedValues &&
      inputTypeToOutputAttributeName[value] &&
      this.optionValues[inputTypeToOutputAttributeName[value]]
    ) {
      this._selectedValues =
        this.optionValues[inputTypeToOutputAttributeName[value]];
    }

    // Handle picklist selected values specifically
    if (value === defaults.picklist && this.selectedOptionsCSV) {
      this._selectedValues = this.selectedOptionsCSV
        .split(",")
        .map((item) => item.trim());
    }

    // Restore values from sessionStorage when format changes
    const cached = window.sessionStorage.getItem(this.STORAGE_KEY);
    if (cached) {
      const fromCache = JSON.parse(cached);
      if (fromCache && fromCache.length) {
        this._values = [...fromCache];
        this._selectedValues = [...fromCache];
      }
    }
    if (
      this._allOptionsStringFormat === defaults.csv &&
      (!this._selectedValues || !this._selectedValues.length)
    ) {
      this._selectedValues = "";
    }
  }

  set allOptionsFieldDescriptorList(value) {
    this.setOptions(inputTypeToInputAttributeName.object, value);
  }

  set allOptionsStringCollection(value) {
    this.setOptions(inputTypeToInputAttributeName.list, value);
  }

  set allOptionsStringCollectionLabels(value) {
    this.setOptions(inputTypeToInputAttributeName.twoLists, value);
  }

  set allOptionsCSV(value) {
    this.setOptions(inputTypeToInputAttributeName.csv, value);
  }

  set selectedOptionsStringList(value) {
    this.setOptions(inputTypeToOutputAttributeName.list, value);
  }

  set selectedOptionsCSV(value) {
    this.setOptions(inputTypeToOutputAttributeName.csv, value);
  }

  set selectedOptionsPicklist(value) {
    console.log("selectedOptionsPicklist setter called with:", value);
    console.log("Value type:", typeof value);
    console.log("Is array:", Array.isArray(value));

    // For picklist format, value should be an array of selected values
    if (Array.isArray(value)) {
      this._selectedValues = [...value];
      console.log("Set picklist selected values:", this._selectedValues);

      // If values are cleared (empty array), clear sessionStorage too
      if (value.length === 0) {
        console.log("Values cleared - removing from sessionStorage");
        window.sessionStorage.removeItem(this.STORAGE_KEY);
      } else {
        // Save to sessionStorage
        this.saveSelectedValues();
      }
    } else if (typeof value === "string" && value.includes(",")) {
      // Handle CSV string input for backward compatibility
      const selectedArray = value.split(",").map((item) => item.trim());
      this._selectedValues = selectedArray;
      console.log("Converted CSV string to picklist array:", selectedArray);
      this.saveSelectedValues();
    } else if (value) {
      // Handle single value
      this._selectedValues = [value];
      console.log("Set single picklist value:", this._selectedValues);
      this.saveSelectedValues();
    } else {
      console.log("No picklist values provided - clearing selection");
      this._selectedValues = [];
      // Clear sessionStorage when no values provided
      window.sessionStorage.removeItem(this.STORAGE_KEY);
    }
  }

  set selectedOptionsFieldDescriptorList(value) {
    this.setOptions(inputTypeToOutputAttributeName.object, value);
  }

  @api
  get allOptionsStringFormat() {
    return this._allOptionsStringFormat;
  }

  @api
  get allOptionsFieldDescriptorList() {
    return this.getOptions(defaults.originalObject);
  }

  @api
  get allOptionsStringCollection() {
    return this.getOptions(defaults.list);
  }

  @api
  get allOptionsStringCollectionLabels() {
    return this.getOptions(defaults.twoLists);
  }

  @api
  get allOptionsCSV() {
    return this.getOptions(defaults.csv);
  }

  @api
  get selectedOptionsStringList() {
    return this.getValues(defaults.list);
  }

  @api
  get selectedOptionsCSV() {
    return this.getValues(defaults.csv);
  }

  @api
  get selectedOptionsPicklist() {
    return this.getValues(defaults.picklist);
  }

  @api
  get selectedOptionsFieldDescriptorList() {
    return this.getValues(defaults.originalObject);
  }

  get isDataSet() {
    const result =
      this.isPicklistMode ||
      (this.allOptionsStringFormat &&
        this.useWhichObjectKeyForData &&
        this.useWhichObjectKeyForLabel);
    console.log("isDataSet:", result);
    console.log("isPicklistMode:", this.isPicklistMode);
    console.log("allOptionsStringFormat:", this.allOptionsStringFormat);
    console.log("useWhichObjectKeyForData:", this.useWhichObjectKeyForData);
    console.log("useWhichObjectKeyForLabel:", this.useWhichObjectKeyForLabel);
    return result;
  }

  get isPicklistMode() {
    return !!(
      this.usePicklistValues &&
      this.objectApiName &&
      this.fieldApiName
    );
  }

  get fieldApiNameString() {
    if (!this.fieldApiName) return null;

    try {
      // If it's a JSON string, parse it
      if (typeof this.fieldApiName === "string") {
        const parsed = JSON.parse(this.fieldApiName);
        // If it's an array, get the first field object
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0].name;
        }
        // If it's a single field object
        if (parsed && parsed.name) {
          return parsed.name;
        }
      }
      // If it's already an object, get the name directly
      if (typeof this.fieldApiName === "object" && this.fieldApiName.name) {
        return this.fieldApiName.name;
      }
      // If it's already a string field name, return as-is
      return this.fieldApiName;
    } catch (error) {
      console.error("Error parsing fieldApiName:", error);
      return this.fieldApiName;
    }
  }

  // Wire to get object info for field validation
  @wire(getObjectInfo, { objectApiName: "$objectApiName" })
  objectInfo;

  // Wire to get picklist values
  @wire(getPicklistValues, {
    objectApiName: "$objectApiName",
    fieldName: "$fieldApiNameString",
  })
  wiredPicklistValues({ error, data }) {
    if (data) {
      console.log("picklistValues: " + JSON.stringify(data));
      this.picklistValues = data;
      this.updateOptionsFromPicklist();
    } else if (error) {
      console.error("Error loading picklist values:", JSON.stringify(error));
      this.errorMessage =
        "Error loading picklist values: " + error.body.message;
    }
  }

  setOptions(optionName, optionValue) {
    this.optionValues[optionName] = optionValue;
    if (
      this._allOptionsStringFormat &&
      inputTypeToInputAttributeName[this._allOptionsStringFormat] ===
        optionName &&
      this._allOptionsStringFormat !== defaults.twoLists
    ) {
      this._options = optionValue;
    } else if (
      this._allOptionsStringFormat &&
      inputTypeToOutputAttributeName[this._allOptionsStringFormat] ===
        optionName
    ) {
      this._selectedValues = optionValue;
    }
    if (
      this._allOptionsStringFormat === defaults.twoLists &&
      this.optionValues[inputTypeToInputAttributeName.list] &&
      this.optionValues[inputTypeToInputAttributeName.twoLists]
    ) {
      this.setDualListOptions();
    }
  }

  setDualListOptions() {
    this._options = [];
    let values = this.optionValues[inputTypeToInputAttributeName.list];
    let labels = this.optionValues[inputTypeToInputAttributeName.twoLists];
    if (labels.length === values.length) {
      for (let i = 0; i < values.length; i++) {
        this._options.push({ label: labels[i], value: values[i] });
      }
    }
  }

  updateOptionsFromPicklist() {
    console.log("updateOptionsFromPicklist called");
    console.log("isPicklistMode:", this.isPicklistMode);
    console.log("usePicklistValues:", JSON.stringify(this.usePicklistValues));
    console.log("objectApiName:", JSON.stringify(this.objectApiName));
    console.log("fieldApiName:", JSON.stringify(this.fieldApiName));
    console.log("picklistValues:", JSON.stringify(this.picklistValues));

    if (
      this.isPicklistMode &&
      this.picklistValues &&
      this.picklistValues.length > 0
    ) {
      this._options = this.picklistValues.map((picklistValue) => ({
        label: picklistValue.label,
        value: picklistValue.value,
      }));

      // Set the format to picklist for proper option processing
      if (!this._allOptionsStringFormat) {
        this._allOptionsStringFormat = defaults.picklist;
      }

      console.log("Updated _options:", JSON.stringify(this._options));

      // Restore values after options are loaded
      this.restoreSelectedValues();
    } else {
      console.log("updateOptionsFromPicklist: conditions not met");
    }
  }

  getValues(valueType) {
    let listBox = this.template.querySelector(
      "c-fsc_extended-base-dual-list-box"
    );
    if (listBox) {
      return listBox.getValues(valueType);
    }
  }

  getOptions(valueType) {
    let listBox = this.template.querySelector(
      "c-fsc_extended-base-dual-list-box"
    );
    if (listBox) {
      return listBox.getOptions(valueType);
    }
  }

  handleValueChanged(event) {
    console.log("=== handleValueChanged called ===");
    console.log("event.detail.value:", JSON.stringify(event.detail.value));

    let value = event.detail.value;

    // Convert to array format for selected values
    if (Array.isArray(value)) {
      this._selectedValues = [...value];
    } else if (typeof value === "string" && value.includes(",")) {
      this._selectedValues = value.split(",").map((item) => item.trim());
    } else {
      this._selectedValues = value ? [value] : [];
    }

    console.log("Updated _selectedValues:", this._selectedValues);

    // Save to sessionStorage
    this.saveSelectedValues();

    // Dispatch to Flow
    const outputAttribute =
      inputTypeToOutputAttributeName[this.allOptionsStringFormat];
    let flowValue = this._selectedValues;

    if (
      this.allOptionsStringFormat === defaults.picklist ||
      this.allOptionsStringFormat === defaults.csv
    ) {
      flowValue = this._selectedValues.join(",");
    }

    this.dispatchEvent(
      new FlowAttributeChangeEvent(outputAttribute, flowValue)
    );
  }

  dispatchFlowAttributeChangedEvent(attributeName, attributeValue) {
    console.log(attributeName, attributeValue);
    const attributeChangeEvent = new FlowAttributeChangeEvent(
      attributeName,
      attributeValue
    );
    this.dispatchEvent(attributeChangeEvent);
  }

  // Event handlers for picklist properties
  handleObjectChange(event) {
    this.objectApiName = event.detail.value;
    this.fieldApiName = null; // Clear field when object changes
    this.picklistValues = []; // Clear picklist values
    this._options = []; // Clear options
    this.dispatchFlowAttributeChangedEvent("objectApiName", this.objectApiName);
  }

  handleFieldChange(event) {
    this.fieldApiName = event.detail.value;
    console.log("fieldApiName: " + JSON.stringify(this.fieldApiName));
    this.dispatchFlowAttributeChangedEvent("fieldApiName", this.fieldApiName);
  }

  handleUsePicklistChange(event) {
    this.usePicklistValues = event.detail.checked;
    this.dispatchFlowAttributeChangedEvent(
      "usePicklistValues",
      this.usePicklistValues
    );

    if (!this.usePicklistValues) {
      this.picklistValues = [];
      this._options = [];
    }
  }

  @api
  validate() {
    console.log("entering validate");
    console.log(
      "entering validate: required=" +
        this.required +
        " values=" +
        JSON.stringify(this._selectedValues)
    );

    if (
      this.required == true &&
      (this._selectedValues == [] || this._selectedValues == "")
    ) {
      console.log("validate reporting false");
      return {
        isValid: false,
        errorMessage: "At least one value must be selected.",
      };
    } else {
      return { isValid: true };
    }
  }
}
