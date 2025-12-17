/**
 * Configuration Panel Editor (CPE) for lwcConvertCSVToRecords Flow Screen Component
 *
 * Provides the configuration UI in Flow Builder for the Convert CSV to Records component.
 * Handles all input property configuration including PapaParse options and Flow-specific settings.
 *
 * Created By: Andy Haas
 *
 * @see lwcConvertCSVToRecords - Main component
 */

import { LightningElement, api, track } from "lwc";

const DATA_TYPE = {
  STRING: "String",
  BOOLEAN: "Boolean",
  NUMBER: "Number",
  INTEGER: "Integer",
};

const FLOW_EVENT_TYPE = {
  DELETE: "configuration_editor_input_value_deleted",
  CHANGE: "configuration_editor_input_value_changed",
};

export default class LwcConvertCSVToRecords_CPE extends LightningElement {
  typeValue;
  _builderContext = {};
  _values = [];
  _typeMappings = [];
  _elementType;
  _elementName;

  /**
   * Handles dynamic type mapping for sObject selection in Flow Builder
   * Updates the generic type mapping when an object is selected
   *
   * @param {CustomEvent} event - Event containing the selected object type
   * @param {string} event.detail.objectType - The API name of the selected object
   * @returns {void}
   */
  handleDynamicTypeMapping(event) {
    let typeValue = event.detail.objectType;
    const typeName = this._elementType === "Screen" ? "T" : "T__record";
    const dynamicTypeMapping = new CustomEvent(
      "configuration_editor_generic_type_mapping_changed",
      {
        composed: true,
        cancelable: false,
        bubbles: true,
        detail: {
          typeName,
          typeValue,
        },
      }
    );
    this.dispatchEvent(dynamicTypeMapping);
    this.dispatchFlowValueChangeEvent(
      "objectName",
      event.detail.objectType,
      DATA_TYPE.STRING
    );
  }

  @api
  get elementInfo() {
    return this._elementInfo;
  }

  set elementInfo(info) {
    this._elementInfo = info || {};
    if (this._elementInfo) {
      this._elementName = this._elementInfo.apiName;
      this._elementType = this._elementInfo.type;
    }
  }

  @track inputValues = {
    objectName: {
      value: null,
      valueDataType: null,
      isCollection: false,
      label: "Input Object?",
      required: true,
      errorMessage: "Please select an object",
    },
    inputLabel: {
      value: "Upload CSV",
      valueDataType: null,
      isCollection: false,
      label: "File Import Label",
      required: false,
      fieldHelpText: "The label for the file input field",
    },
    autoNavigateNext: {
      value: false,
      valueDataType: null,
      isCollection: false,
      label: "Auto Navigate Next",
      required: true,
      fieldHelpText:
        'If true, the flow will automatically navigate to the next screen after the component has been initialized. Note: Use a Flow Constant variable set to Boolean True rather than typing "True" directly.',
    },
    delimiter: {
      value: ",",
      valueDataType: null,
      isCollection: false,
      label: "Delimiter",
      required: false,
      fieldHelpText:
        "The delimiting character. Leave blank to auto-detect from a list of most common delimiters, or any values passed in through delimitersToGuess",
    },
    newLine: {
      value: null,
      valueDataType: null,
      isCollection: false,
      label: "New Line",
      required: false,
      fieldHelpText:
        "The newline sequence. Leave blank to auto-detect. Must be one of \r, \n, or \r\n.",
    },
    quoteChar: {
      value: "&quot;",
      valueDataType: null,
      isCollection: false,
      label: "Quote Character",
      required: false,
      fieldHelpText:
        "The character used to quote fields. The quoting of all fields is not mandatory. Any field which is not quoted will correctly read.",
    },
    escapeChar: {
      value: "&quot;",
      valueDataType: null,
      isCollection: false,
      label: "Escape Character",
      required: false,
      fieldHelpText:
        "The character used to escape the quote character within a field. If not set, this option will default to the value of quoteChar",
    },
    transformHeader: {
      value: "",
      valueDataType: null,
      isCollection: false,
      label: "Transform Header",
      required: false,
      fieldHelpText:
        "A function to apply on each header.  The function receives the header as its first argument and the index as second.",
    },
    dynamicTyping: {
      value: false,
      valueDataType: null,
      isCollection: false,
      label: "Dynamic Typing",
      required: false,
      fieldHelpText:
        "If true, numeric and boolean data will be converted to their type instead of remaining strings",
    },
    encoding: {
      value: "UTF-8",
      valueDataType: null,
      isCollection: false,
      label: "Encoding",
      required: false,
      fieldHelpText:
        "The encoding to use when opening local files. If specified, it must be a value supported by the FileReader API",
    },
    comments: {
      value: false,
      valueDataType: null,
      isCollection: false,
      label: "Comments",
      required: false,
      fieldHelpText:
        "A string that indicates a comment (for example, # or //). When Papa encounters a line starting with this string, it will skip the line.",
    },
    fastMode: {
      value: false,
      valueDataType: null,
      isCollection: false,
      label: "Fast Mode",
      required: false,
      fieldHelpText:
        'Fast mode speeds up parsing significantly for large inputs. However, it only works when the input has no quoted fields. Fast mode will automatically be enabled if no " characters appear in the input.',
    },
    transform: {
      value: "",
      valueDataType: null,
      isCollection: false,
      label: "Transform",
      required: false,
      fieldHelpText:
        "A function to apply on each value. The function receives the value as its first argument and the column number or header name when enabled as its second argument. The return value of the function will replace the value it received. The transform function is applied before dynamicTyping.",
    },
    delimitersToGuess: {
      value: "",
      valueDataType: null,
      isCollection: false,
      label: "Delimiters To Guess",
      required: false,
      fieldHelpText:
        "An array of delimiters to guess from if the delimiter option is not set",
    },
    ignoreMissingColumns: {
      value: true,
      valueDataType: null,
      isCollection: false,
      label: "Ignore Missing Columns",
      required: false,
      fieldHelpText:
        "If true, columns that are empty/null will be ignored. Otherwise, an error will be thrown.",
    },
    ignoreMissingFields: {
      value: true,
      valueDataType: null,
      isCollection: false,
      label: "Ignore Missing Fields",
      required: false,
      fieldHelpText:
        "If true, fields that do not have matching columns will be ignored. Otherwise, an error will be thrown.",
    },
  };

  @api get builderContext() {
    return this._builderContext;
  }

  set builderContext(value) {
    this._builderContext = value;
  }

  @api get automaticOutputVariables() {
    return this._automaticOutputVariables;
  }

  set automaticOutputVariables(value) {
    this._automaticOutputVariables = value;
  }
  @track _automaticOutputVariables;

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

  /**
   * Initializes input values from Flow Builder context
   * Called when inputVariables are set by Flow Builder
   *
   * @param {*} value - Unused parameter (kept for compatibility)
   * @returns {void}
   */
  initializeValues(value) {
    if (this._values && this._values.length) {
      this._values.forEach((curInputParam) => {
        if (curInputParam.name && this.inputValues[curInputParam.name]) {
          if (this.inputValues[curInputParam.name].serialized) {
            this.inputValues[curInputParam.name].value = JSON.parse(
              curInputParam.value
            );
          } else {
            this.inputValues[curInputParam.name].value = curInputParam.value;
          }
          this.inputValues[curInputParam.name].valueDataType =
            curInputParam.valueDataType;
        }
      });
    }
  }

  /**
   * Initializes generic type mappings from Flow Builder context
   * Sets the typeValue based on the generic type mappings
   *
   * @returns {void}
   */
  initializeTypeMappings() {
    this._typeMappings.forEach((typeMapping) => {
      if (typeMapping.name && typeMapping.value) {
        this.typeValue = typeMapping.value;
      }
    });
  }

  /**
   * Handles value changes from input components in the configuration panel
   * Supports both new (fsc_flow-combobox) and legacy input components
   *
   * @param {CustomEvent} event - Value change event from input component
   * @param {*} event.detail.newValue - New value (new components)
   * @param {*} event.detail.value - Value (legacy components)
   * @param {string} event.detail.newValueDataType - Data type of the new value
   * @param {HTMLElement} event.target - Target element (new components)
   * @param {HTMLElement} event.currentTarget - Current target (legacy components)
   * @returns {void}
   */
  handleValueChange(event) {
    if (event.detail && event.target) {
      // Any component using fsc_flow-combobox will be ran through here
      // This is the newer version and will allow users to use merge fields
      // If event.detail.newValue is set then use it, otherwise use event.detail.value
      let newValue = event.detail.newValue;
      if (newValue == null) {
        newValue = event.detail.value;

        // If event.detail.value.name is set then use it, otherwise use event.detail.value
        if (newValue.name != null) {
          newValue = newValue.name;
        }
      }
      this.dispatchFlowValueChangeEvent(
        event.target.name,
        newValue,
        event.detail.newValueDataType
      );
    } else if (event.detail && event.currentTarget) {
      // This is the older version for any old inputs that are still using currentTarget
      // Kept for backwards compatibility
      let dataType = DATA_TYPE.STRING;
      if (event.currentTarget.type == "checkbox") dataType = DATA_TYPE.BOOLEAN;
      if (event.currentTarget.type == "number") dataType = DATA_TYPE.NUMBER;
      if (event.currentTarget.type == "integer") dataType = DATA_TYPE.INTEGER;
      let newValue =
        event.currentTarget.type === "checkbox"
          ? event.currentTarget.checked
          : event.detail.value;
      this.dispatchFlowValueChangeEvent(
        event.currentTarget.name,
        newValue,
        dataType
      );
    }
  }

  /**
   * Dispatches a Flow configuration editor value change event
   * Serializes values if needed before dispatching
   *
   * @param {string} id - The property name/ID that changed
   * @param {*} newValue - The new value for the property
   * @param {string} [dataType=DATA_TYPE.STRING] - The data type of the value
   * @returns {void}
   */
  dispatchFlowValueChangeEvent(id, newValue, dataType = DATA_TYPE.STRING) {
    if (this.inputValues[id] && this.inputValues[id].serialized) {
      newValue = JSON.stringify(newValue);
    }
    const valueChangedEvent = new CustomEvent(FLOW_EVENT_TYPE.CHANGE, {
      bubbles: true,
      cancelable: false,
      composed: true,
      detail: {
        name: id,
        newValue: newValue ? newValue : null,
        newValueDataType: dataType,
      },
    });
    this.dispatchEvent(valueChangedEvent);
  }
}
