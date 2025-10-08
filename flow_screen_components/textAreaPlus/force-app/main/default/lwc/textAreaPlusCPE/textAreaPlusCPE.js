/**
 * @description       : 
 * @author            : Josh Dayment
 * @group             : 
 * @last modified on  : 08-20-2023
 * @last modified by  : Josh Dayment
**/
import { api, track, LightningElement } from "lwc";

const DATA_TYPE = {
  STRING: "String",
  BOOLEAN: "Boolean",
  NUMBER: "Number",
  INTEGER: "Integer"
};

const defaults = {
  inputAttributePrefix: "select_"
};

const FLOW_EVENT_TYPE = {
  DELETE: "configuration_editor_input_value_deleted",
  CHANGE: "configuration_editor_input_value_changed"
};

const VALIDATEABLE_INPUTS = ["c-fsc_flow-combobox"];
export default class textAreaPlusCPE extends LightningElement {
  @api automaticOutputVariables;
  minlenErr = false;
  jsonErr = false;
  typeValue;
  _builderContext = {};
  _values = [];
  _flowVariables = [];
  _typeMappings = [];
  //_automaticOutputVariables;

  rendered;
  // Help for Rich Text Options
  textBannerInfo = [
    { label: "Component Label", helpText: "Header Label" },
    { label: "Placeholder Text", helpText: "Initial Placeholder Text" },
    { label: "Text Value", helpText: "Initial Text Value" }
  ];
  advToolsInfo = [
    {
      label: "Blocked Words",
      helpText: "List of comma delimited words to block"
    },
    {
      label: "Blocked Symbols",
      helpText: "List of comma delimited symbols to block"
    },
    {
      label: "Autoreplace Map",
      helpText: "List of words and replacements in JSON format"
    },
    {
      label: "Warning Only",
      helpText: "Show warnings, but allow user to continue"
    },
    {
      label: "Note",
      helpText: "Enabling Advanced Tools will always add Find and Replace"
    }
  ];
  charCounterInfo = [
    {
      label: "Max Characters Allowed",
      helpText: "Limits number of characters"
    },
    {
      label: "Characters Remaining Template",
      helpText:
        "$L - Characters Left, $M - Max Characters, $R - Remaining Characters"
    }
  ];  

 // @api 
  //get automaticOutputVariables () {
  //    return this._automaticOutputVariables;
 // }

 // set automaticOutputVariables(value) {
 //     this._automaticOutputVariables = value;
 // }
  
  @track inputValues = {
    value: {
      value: null,
      valueDataType: null,
      isCollection: false,
      label: "Text Value",
      label: "Initial Text Value"
    },
    charsLeftTemplate: {
      value: "$L/$M Characters",
      valueDataType: null,
      isCollection: false,
      label: "Characters Remaining Template",
      helpText:
        "Display a custom message for remaining characters with tokens: $R for remaining chars, $L for current length, and $M for max allowed characters."
    },
    label: {
      value: null,
      valueDataType: null,
      isCollection: false,
      label: "Component Label"
    },
    showCharCounter: {
      value: null,
      valueDataType: null,
      isCollection: false,
      label: "Character Counter",
      helpText:
        "Display counter with max chars, chars left using customizable text"
    },
    cb_showCharCounter: {
      value: null,
      valueDataType: null,
      isCollection: false,
      label: ""
    },
    maxlen: {
      value: null,
      valueDataType: DATA_TYPE.NUMBER,
      isCollection: false,
      label: "Maximum characters allowed"
    },
    minlen: {
      value: null,
      valueDataType: DATA_TYPE.NUMBER,
      isCollection: false,
      label: "Minimum characters required",
      helpText:
        "Require a minimum number of characters.  If empty, no minimums will be enforced."
    },
    placeHolder: {
      value: null,
      valueDataType: null,
      isCollection: true,
      label: "Placeholder Text",
      helpText: "Optional placeholder text"
    },
    textMode: {
      value: null,
      valueDataType: null,
      isCollection: false,
      label: "Plain text or Rich text?"
    },
    advancedTools: {
      value: null,
      valueDataType: null,
      isCollection: false,
      label: "Enable Advanced Tools",
      helpText:
        "Advanced Tools - Search/Replace, Auto-replace, and blocked words/symbols."
    },
    cb_advancedTools: {
      value: null,
      valueDataType: null,
      isCollection: false,
      label: ""
    },
    disallowedWordsList: {
      value: null,
      valueDataType: null,
      isCollection: false,
      label: "Blocked Words",
      helpText:
        "Comma-separated list of words to block.  Example: bad,worse,worst"
    },
    disallowedSymbolsList: {
      value: null,
      valueDataType: null,
      isCollection: false,
      label: "Blocked Symbols",
      helpText: "Comma-separated list of symbols to block.  Example: /,@,*"
    },
    autoReplaceMap: {
      value: null,
      valueDataType: null,
      isCollection: false,
      label: "Autoreplace Map",
      helpText:
        'JSON for key:value pairs you want to replace.  Key = value to replace, Value = value to replace with.  Example: {"This":"That"}'
    },
    warnOnly: {
      value: null,
      valueDataType: null,
      isCollection: false,
      label: "Warning Only",
      helpText:
        "Allows user to continue with Next/Finish, even if disallowed Symbols or Words are used."
    },
    cb_warnOnly: {
      value: null,
      valueDataType: null,
      isCollection: false,
      label: ""
    },
    required: {
      value: null,
      valueDataType: null,
      isCollection: false,
      label: "Required",
      helpText: "If true, a value in the text input is required"
    },
    cb_required: {
      value: null,
      valueDataType: null,
      isCollection: false,
      label: ""
    },
    textAreaHeight: {
      value: null,
      valueDataType: null,
      isCollection: false,
      label: "Text Area Height",
      helpText: "Set the minimum height of the text input area i.e. 800"
    },
    displayTextHeight: {
      value: null,
      valueDataType: DATA_TYPE.NUMBER,
      isCollection: false,
      label: "Display Text Height",
      helpText: "Set the height of the display text container in pixels (e.g., 200). Leave empty for auto height."
    },
    fieldLevelHelp: {
      value: null,
      valueDataType: null,
      isCollection: false,
      label: "Help Text",
      helpText: "Help text detailing the purpose and function of the text editor."
    },

  };

  get hasValidMaxLength() {
    return (
      this.inputValues.maxlen.value && Number(this.inputValues.maxlen.value) > 0
    );
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

  @api get genericTypeMappings() {
    return this._genericTypeMappings;
  }
  set genericTypeMappings(value) {
    this._typeMappings = value;
    this.initializeTypeMappings();
  }

  @api get textOptions() {
    return [
      { label: "Plain Text Area", value: "plain" },
      { label: "Rich Text Area", value: "rich" },
      { label: "Display Text", value: "display" },
      { label: "Rich Text with Slack markdown", value: "slack" },
      { label: "Text Input", value: "textInput" },
    ];
  }

  @api
  validate() {
    let validity = [];
    for (let inputType of VALIDATEABLE_INPUTS) {
      for (let input of this.template.querySelectorAll(inputType)) {
        if (!input.reportValidity()) {
          validity.push({
            key: input.name || "Error_" + validity.length,
            errorString: "This field has an error (missing or invalid entry)"
          });
        }
      }
    }

    // Do not allow save with invalid JSON
    try {
      if (this.inputValues.autoReplaceMap?.value?.trim() !== "") {
        JSON.parse(this.inputValues.autoReplaceMap.value);
      } else {
        this.jsonErr = false;
      }
    } catch (e) {
      this.jsonErr = true;
      validity.push({
        key: "invalidJSON",
        errorString:
          'Auto Replace Map contains invalid JSON.  Use the format {"key1":"value1","key2":"value2"}'
      });
    }
    // Enforce min length <= max length
    this.minlenErr =
      Number(this.inputValues.maxlen.value) > 0 &&
      Number(this.inputValues.minlen.value) >=
      Number(this.inputValues.maxlen.value);
    if (this.minlenErr) {
      validity.push({
        key: "minlenTooSmall",
        errorString: "Minimum length must be less than maximum length"
      });
    }
    return validity;
  }
  /* LIFECYCLE HOOKS */
  connectedCallback() { }
  renderedCallback() {
    if (!this.rendered) {
      this.rendered = true;
      for (let flowCombobox of this.template.querySelectorAll(
        "c-fsc_flow-combobox"
      )) {
        flowCombobox.builderContext = this.builderContext;
        flowCombobox.automaticOutputVariables = this.automaticOutputVariables;
      }
    }
  }
  /* ACTION FUNCTIONS */
  initializeValues(value) {
    if (this._values && this._values.length) {
      this._values.forEach((curInputParam) => {
        const inputVal =
          curInputParam.name && this.inputValues[curInputParam.name];
        if (inputVal) {
          console.log(
            "in initializeValues: " +
            curInputParam.name +
            " = " +
            curInputParam.value
          );
          if (inputVal.serialized) {
            inputVal.value = JSON.parse(curInputParam.value);
          } else {
            inputVal.value = curInputParam.value;
          }
          inputVal.valueDataType = curInputParam.valueDataType;
        }
      });
    }
  }
  initializeTypeMappings() {
    this._typeMappings.forEach((typeMapping) => {
      // console.log(JSON.stringify(typeMapping));
      if (typeMapping.name && typeMapping.value) {
        this.typeValue = typeMapping.value;
      }
    });
  }
  /* EVENT HANDLERS */
  handleFlowComboboxValueChange(event) {
    if (event.target && event.detail) {
      // Force update max length value so chars remaining template visibility is reflected
      if (event.target.name === "maxlen") {
        this.inputValues.maxlen.value = event.detail.newValue;
      }
      if (event.target.name === "minlen") {
        this.inputValues.minlen.value = event.detail.newValue;
      }
      this.dispatchFlowValueChangeEvent(
        event.target.name,
        event.detail.newValue,
        event.detail.newValueDataType
      );
    }
  }
  handleRichTextChange(event) {
    if (event.target && event.detail) {
      this.dispatchFlowValueChangeEvent("value", event.detail.value, "String");
    }
  }

  handleCheckboxChange(event) {
    if (event.target && event.detail) {
      let changedAttribute = event.target.name.replace(
        defaults.inputAttributePrefix,
        ""
      );
      this.dispatchFlowValueChangeEvent(
        changedAttribute,
        event.detail.newValue,
        event.detail.newValueDataType
      );
      this.dispatchFlowValueChangeEvent(
        "cb_" + changedAttribute,
        event.detail.newStringValue,
        "String"
      );
    }
  }

  handleTextOptionChange(event) {
    this.dispatchFlowValueChangeEvent("textMode", event.detail.value, "String");
  }

  dispatchFlowValueChangeEvent(id, newValue, dataType = DATA_TYPE.STRING) {
    console.log("in dispatchFlowValueChangeEvent: " + id, newValue, dataType);
    if (this.inputValues[id] && this.inputValues[id].serialized) {
      console.log("serializing value");
      newValue = JSON.stringify(newValue);
    }
    const valueChangedEvent = new CustomEvent(FLOW_EVENT_TYPE.CHANGE, {
      bubbles: true,
      cancelable: false,
      composed: true,
      detail: {
        name: id,
        newValue: newValue ? newValue : null,
        newValueDataType: dataType
      }
    });
    this.dispatchEvent(valueChangedEvent);
  }

  // Helper function to check input value properties for a match
  eq(prop, value) {
    return this.inputValues[prop]?.value === value;
  }

  get isPlainText() {
    return this.eq("textMode", "plain");
  }

  get isTextInput() {
    return this.eq("textMode", "textInput");
  }

  get isRichText() {
    return (this.eq("textMode", "rich") || this.eq("textMode", "slack"));
  }

  get isDisplayText() {
    return this.eq("textMode", "display");
  }

  get showAdvancedTools() {
    return this.eq("cb_advancedTools", "CB_TRUE");
  }

  get showCounterSettings() {
    return (
      this.eq("cb_showCharCounter", "CB_TRUE") &&
      (this.eq("textMode", "rich") || this.eq("textMode", "plain") || this.eq("textMode", "slack") || this.eq("textMode", "textInput"))
    );
  }
}