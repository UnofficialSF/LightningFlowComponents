const defaults = {
    csv: "csv",
    list: "list",
    twoLists: "twoLists",
    originalObject: "object",
    picklist: "picklist",
    valueField: "value",
    labelField: "label",
    inputAttributePrefix: "select_",
    defaultValueAttribute: "value",
    defaultLabelAttribute: "label",
    fieldDescriptorValueAttribute: "name",
    typeString: "String",
    useWhichObjectKeyForData: "useWhichObjectKeyForData",
    attributeNameAllOptionsStringFormat: "allOptionsStringFormat",
    originalObjectOutputNotSupported:
      "Object output is not supported for this option type.",
    valueLabelFieldNamesNotSupported:
      "Value and Label field names should be left empty for this option type.",
    canNotUseValuesForOutput:
      'Values for output can be used only with "csv" or "list" input type.',
  };
  
  const inputTypeToOutputAttributeName = {
    csv: "selectedOptionsCSV",
    list: "selectedOptionsStringList",
    twoLists: "selectedOptionsStringList",
    object: "selectedOptionsFieldDescriptorList",
    picklist: "selectedOptionsPicklist",
  };
  
  const inputTypeToInputAttributeName = {
    csv: "allOptionsCSV",
    list: "allOptionsStringCollection",
    twoLists: "allOptionsStringCollectionLabels",
    object: "allOptionsFieldDescriptorList",
    picklist: "allOptionsStringCollection",
  };
  
  export {
    defaults,
    inputTypeToOutputAttributeName,
    inputTypeToInputAttributeName,
  };
  