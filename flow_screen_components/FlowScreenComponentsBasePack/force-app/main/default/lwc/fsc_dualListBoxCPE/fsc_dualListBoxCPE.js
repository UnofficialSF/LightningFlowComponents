import { LightningElement, track, api } from "lwc";
import {
  defaults,
  inputTypeToOutputAttributeName,
  inputTypeToInputAttributeName,
} from "c/fsc_dualListBoxUtils";

const DATA_TYPE = {
  STRING: "String",
  BOOLEAN: "Boolean",
  NUMBER: "Number",
  INTEGER: "Integer",
};

export default class DualListBoxCpe extends LightningElement {
  @api automaticOutputVariables;
  typeValue;
  _builderContext = {};
  _values = [];
  _flowVariables = [];
  _typeMappings = [];
  rendered;

  @track inputValues = {
    label: {
      value: null,
      valueDataType: null,
      isCollection: false,
      label: "Master Label",
    },
    allOptionsStringFormat: {
      value: null,
      valueDataType: null,
      isCollection: false,
      label: "Select datasource",
    },
    sourceLabel: {
      value: null,
      valueDataType: null,
      isCollection: false,
      label: "Available Choices Label",
    },
    fieldLevelHelp: {
      value: null,
      valueDataType: null,
      isCollection: false,
      label: "Add a 'None' choice",
    },
    selectedLabel: {
      value: null,
      valueDataType: null,
      isCollection: false,
      label: "Selected Chocies Label",
    },
    min: {
      value: null,
      valueDataType: null,
      isCollection: false,
      label: "Min",
    },
    max: {
      value: null,
      valueDataType: null,
      isCollection: false,
      label: "Max",
    },
    disableReordering: {
      value: null,
      valueDataType: null,
      isCollection: false,
      label: "Disable Reordering",
    },
    size: {
      value: null,
      valueDataType: null,
      isCollection: false,
      label: "Vertical Size of List Box (visible items)",
    },
    required: {
      value: null,
      valueDataType: null,
      isCollection: false,
      label: "Required",
    },
    requiredOptions: {
      value: null,
      valueDataType: null,
      isCollection: true,
      label: "Datasource for Choice Icons:",
    },
    useWhichObjectKeyForData: {
      value: null,
      valueDataType: null,
      isCollection: false,
      label: "Use Which Object Key For Data",
    },
    useWhichObjectKeyForLabel: {
      value: null,
      valueDataType: null,
      isCollection: false,
      label: "Use Which Object Key For Label",
    },
    useWhichObjectKeyForSort: {
      value: null,
      valueDataType: null,
      isCollection: false,
      label: "Use Which Object Key For Sort",
    },
    useObjectValueAsOutput: {
      value: null,
      valueDataType: null,
      isCollection: false,
      label: "Select Field",
    },
    allOptionsFieldDescriptorList: {
      value: null,
      valueDataType: null,
      isCollection: true,
      label: "Field Descriptors",
    },
    allOptionsStringCollection: {
      value: null,
      valueDataType: null,
      isCollection: true,
      label: "Values",
    },
    allOptionsStringCollectionLabels: {
      value: null,
      valueDataType: null,
      isCollection: true,
      label: "Labels",
    },
    allOptionsCSV: {
      value: null,
      valueDataType: null,
      isCollection: false,
      label: "CSV String",
    },
    selectedOptionsStringList: {
      value: null,
      valueDataType: null,
      isCollection: true,
      label: "Select List Values",
    },
    selectedOptionsCSV: {
      value: null,
      valueDataType: null,
      isCollection: false,
      label: "Selected CSV Values",
    },
    selectedOptionsPicklist: {
      value: null,
      valueDataType: null,
      isCollection: true,      
      label: "Selected Picklist Values",
    },
    selectedOptionsFieldDescriptorList: {
      value: null,
      valueDataType: null,
      isCollection: true,
      label: "Select Field Descriptor Values",
    },
    // New picklist properties
    usePicklistValues: {
      value: null,
      valueDataType: null,
      isCollection: false,
      label: "Use Picklist Values",
    },
    objectApiName: {
      value: null,
      valueDataType: null,
      isCollection: false,
      label: "Object Name",
    },
    fieldApiName: {
      value: null,
      valueDataType: null,
      isCollection: true,
      label: "Show which fields?",
      serialized: true,
    },
  };

  selectDataSourceOptions = [
    {
      label: "CSV String",
      value: defaults.csv,
      allowedAttributes: [
        inputTypeToOutputAttributeName.csv,
        inputTypeToInputAttributeName.csv,
      ],
    },
    {
      label: "Two String Collections",
      value: defaults.twoLists,
      allowedAttributes: [
        inputTypeToOutputAttributeName.list,
        inputTypeToInputAttributeName.list,
        inputTypeToInputAttributeName.twoLists,
      ],
    },
    {
      label: "One String Collections",
      value: defaults.list,
      allowedAttributes: [
        inputTypeToOutputAttributeName.list,
        inputTypeToInputAttributeName.list,
      ],
    },
    {
      label:
        "FieldDescriptor Collection (use with Get Field Information action)",
      value: defaults.originalObject,
      allowedAttributes: [
        inputTypeToOutputAttributeName.object,
        inputTypeToInputAttributeName.object,
      ],
    },
    {
      label: "Picklist Values (from Salesforce field)",
      value: defaults.picklist,
      allowedAttributes: [
        inputTypeToOutputAttributeName.picklist,
        inputTypeToInputAttributeName.picklist,
        "objectApiName",
        "fieldApiName",
      ],
    },
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

  @api get genericTypeMappings() {
    return this._genericTypeMappings;
  }
  set genericTypeMappings(value) {
    this._typeMappings = value;
    this.initializeTypeMappings();
  }

  initializeValues(value) {
    console.log("initializeValues called with:", JSON.stringify(this._values));
    if (this._values && this._values.length) {
      this._values.forEach((curInputParam) => {
        if (curInputParam.name && this.inputValues[curInputParam.name]) {
          console.log(
            "in initializeValues: " +
              curInputParam.name +
              " = " +
              JSON.stringify(curInputParam.value)
          );
          console.log("in initializeValues: " + JSON.stringify(curInputParam));
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

      // Set usePicklistValues based on the data source format
      if (
        this.inputValues.allOptionsStringFormat &&
        this.inputValues.allOptionsStringFormat.value === defaults.picklist
      ) {
        this.inputValues.usePicklistValues.value = true;
        this.dispatchFlowValueChangeEvent("usePicklistValues", true, "Boolean");
      }
    }
  }

  @api
  validate() {
    let validity = [];
    // Add validation logic here if needed
    return validity;
  }

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

  handleValueChange(event) {
    console.log("handleValueChange called with:", JSON.stringify(event.detail));
    console.log("event.target.name:", event.target?.name);
    if (event.currentTarget) {
      let curAttributeName = event.currentTarget.name
        ? event.currentTarget.name.replace(defaults.inputAttributePrefix, "")
        : null;
      let value = event.detail ? event.detail.value : event.currentTarget.value;
      let curAttributeValue =
        event.currentTarget.type === "checkbox"
          ? event.currentTarget.checked
          : value;
      let curAttributeType;
      switch (event.currentTarget.type) {
        case "checkbox":
          curAttributeType = "Boolean";
          break;
        case "number":
          curAttributeType = "Number";
          break;
        default:
          curAttributeType = "String";
      }
      console.log(
        "Dispatching flow value change:",
        curAttributeName,
        JSON.stringify(curAttributeValue)
      );
      this.dispatchFlowValueChangeEvent(
        curAttributeName,
        curAttributeValue,
        curAttributeType
      );
      if (curAttributeName === defaults.attributeNameAllOptionsStringFormat) {
        this.clearUnusedAttributes(curAttributeValue);
      }
    }
  }

  handleFlowComboboxValueChange(event) {
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

  handleObjectChange(event) {
    if (event.target && event.detail) {
      console.log("handling a dynamic type mapping");
      console.log("event is " + JSON.stringify(event));
      console.log("event.detail is " + JSON.stringify(event.detail));
      console.log("event.detail.objectType is " + event.detail.objectType);
      console.log("event.currentTarget.name is " + event.currentTarget.name);
      let typeValue = event.detail.objectType;
      const typeName = "T";
      const dynamicTypeMapping = new CustomEvent(
        "configuration_editor_input_value_changed",
        {
          composed: true,
          cancelable: false,
          bubbles: true,
          detail: {
            name: event.currentTarget.name,
            newValue: event.detail.objectType,
            newValueDataType: typeName,
          },
        }
      );
      try {
        this.dispatchEvent(dynamicTypeMapping);
      } catch (error) {
        console.log(
          "Error dispatching dynamicTypeMapping:",
          JSON.stringify(error)
        );
      }
      console.log("typeValue is " + typeValue);

      // Set the value first, then dispatch
      this.inputValues.objectApiName.value = typeValue;
      this.dispatchFlowValueChangeEvent(
        event.currentTarget.name,
        typeValue,
        "String"
      );
    }
  }

  dispatchFlowValueChangeEvent(id, newValue, newValueDataType) {
    // Serialize the value if the input is marked as serialized
    console.log(
      "in dispatchFlowValueChangeEvent: " + id,
      JSON.stringify(newValue),
      newValueDataType
    );
    if (this.inputValues[id] && this.inputValues[id].serialized) {
      console.log("serializing value");
      newValue = JSON.stringify(newValue);
    }

    const valueChangedEvent = new CustomEvent(
      "configuration_editor_input_value_changed",
      {
        bubbles: true,
        cancelable: false,
        composed: true,
        detail: {
          name: id,
          newValue: newValue ? newValue : null,
          newValueDataType: newValueDataType,
        },
      }
    );
    this.dispatchEvent(valueChangedEvent);
  }

  clearUnusedAttributes(newInputFormat) {
    let allAttributesToCheck = [
      ...Object.values(inputTypeToOutputAttributeName),
      ...Object.values(inputTypeToInputAttributeName),
    ];
    let curDataSourceOptions = this.selectDataSourceOptions.find(
      (curDataSource) => curDataSource.value === newInputFormat
    );
    allAttributesToCheck.forEach((curAttribute) => {
      if (
        this.inputValues[curAttribute].value &&
        (!curDataSourceOptions ||
          !curDataSourceOptions.allowedAttributes.includes(curAttribute))
      ) {
        this.inputValues[curAttribute].value = null;
        this.dispatchFlowValueChangeEvent(
          curAttribute,
          null,
          defaults.typeString
        );
      }
    });

    // Automatically set usePicklistValues based on data source selection
    if (newInputFormat === defaults.picklist) {
      this.inputValues.usePicklistValues.value = true;
      this.dispatchFlowValueChangeEvent("usePicklistValues", true, "Boolean");
    } else {
      this.inputValues.usePicklistValues.value = false;
      this.dispatchFlowValueChangeEvent("usePicklistValues", false, "Boolean");
    }
  }

  get isLists() {
    if (this.inputValues.allOptionsStringFormat) {
      return (
        this.inputValues.allOptionsStringFormat.value === defaults.twoLists ||
        this.inputValues.allOptionsStringFormat.value === defaults.list
      );
    }
  }

  get isTwoLists() {
    if (this.inputValues.allOptionsStringFormat) {
      return (
        this.inputValues.allOptionsStringFormat.value === defaults.twoLists
      );
    }
  }

  get isCSV() {
    if (this.inputValues.allOptionsStringFormat) {
      return this.inputValues.allOptionsStringFormat.value === defaults.csv;
    }
  }

  get isObject() {
    if (this.inputValues.allOptionsStringFormat) {
      return (
        this.inputValues.allOptionsStringFormat.value ===
        defaults.originalObject
      );
    }
  }

  get isPicklist() {
    if (this.inputValues.allOptionsStringFormat) {
      return (
        this.inputValues.allOptionsStringFormat.value === defaults.picklist
      );
    }
  }
}