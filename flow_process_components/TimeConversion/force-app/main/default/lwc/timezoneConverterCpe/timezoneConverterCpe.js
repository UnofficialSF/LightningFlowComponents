import { LightningElement, api, track } from "lwc";

export default class TimezoneConverterCpe extends LightningElement {
  @api
  get builderContext() {
    return this._builderContext;
  }

  set builderContext(context) {
    this._builderContext = context || {};
  }

  @api inputVariables;
  @api automaticOutputVariables;

  @track selectedTimezone = "America/New_York";
  @track selectedFormat = "MMM d, yyyy h:mm a";
  @track customTimezone = "";
  @track customFormat = "";
  @track showCustomTimezone = false;
  @track showCustomFormat = false;
  @track timezoneError = "";
  @track formatError = "";

  // Timezone options grouped by region
  timezoneOptions = [
    {
      label: "Eastern Time (America/New_York)",
      value: "America/New_York",
      group: "Americas",
      abbr: "EST/EDT",
    },
    {
      label: "Central Time (America/Chicago)",
      value: "America/Chicago",
      group: "Americas",
      abbr: "CST/CDT",
    },
    {
      label: "Mountain Time (America/Denver)",
      value: "America/Denver",
      group: "Americas",
      abbr: "MST/MDT",
    },
    {
      label: "Pacific Time (America/Los_Angeles)",
      value: "America/Los_Angeles",
      group: "Americas",
      abbr: "PST/PDT",
    },
    {
      label: "Mountain Time - No DST (America/Phoenix)",
      value: "America/Phoenix",
      group: "Americas",
      abbr: "MST",
    },
    {
      label: "Alaska Time (America/Anchorage)",
      value: "America/Anchorage",
      group: "Americas",
      abbr: "AKST/AKDT",
    },
    {
      label: "Hawaii Time (America/Honolulu)",
      value: "America/Honolulu",
      group: "Americas",
      abbr: "HST",
    },
    {
      label: "GMT/BST (Europe/London)",
      value: "Europe/London",
      group: "Europe",
      abbr: "GMT/BST",
    },
    {
      label: "CET/CEST (Europe/Paris)",
      value: "Europe/Paris",
      group: "Europe",
      abbr: "CET/CEST",
    },
    {
      label: "CET/CEST (Europe/Berlin)",
      value: "Europe/Berlin",
      group: "Europe",
      abbr: "CET/CEST",
    },
    {
      label: "MSK (Europe/Moscow)",
      value: "Europe/Moscow",
      group: "Europe",
      abbr: "MSK",
    },
    {
      label: "JST (Asia/Tokyo)",
      value: "Asia/Tokyo",
      group: "Asia/Pacific",
      abbr: "JST",
    },
    {
      label: "CST (Asia/Shanghai)",
      value: "Asia/Shanghai",
      group: "Asia/Pacific",
      abbr: "CST",
    },
    {
      label: "GST (Asia/Dubai)",
      value: "Asia/Dubai",
      group: "Asia/Pacific",
      abbr: "GST",
    },
    {
      label: "AEDT/AEST (Australia/Sydney)",
      value: "Australia/Sydney",
      group: "Asia/Pacific",
      abbr: "AEDT/AEST",
    },
    {
      label: "NZDT/NZST (Pacific/Auckland)",
      value: "Pacific/Auckland",
      group: "Asia/Pacific",
      abbr: "NZDT/NZST",
    },
    { label: "UTC", value: "UTC", group: "UTC", abbr: "UTC" },
  ];

  // Format options
  formatOptions = [
    {
      label: "Default: Jan 15, 2025 2:30 PM",
      value: "MMM d, yyyy h:mm a",
      example: "Jan 15, 2025 2:30 PM",
    },
    {
      label: "Short: 01/15/2025 2:30 PM",
      value: "MM/dd/yyyy h:mm a",
      example: "01/15/2025 2:30 PM",
    },
    {
      label: "Long: January 15, 2025 2:30 PM",
      value: "MMMM d, yyyy h:mm a",
      example: "January 15, 2025 2:30 PM",
    },
    {
      label: "ISO: 2025-01-15 14:30:00",
      value: "yyyy-MM-dd HH:mm:ss",
      example: "2025-01-15 14:30:00",
    },
    {
      label: "Date Only - Short: 01/15/2025",
      value: "MM/dd/yyyy",
      example: "01/15/2025",
    },
    {
      label: "Date Only - Long: January 15, 2025",
      value: "MMMM d, yyyy",
      example: "January 15, 2025",
    },
    { label: "Time Only - 12hr: 2:30 PM", value: "h:mm a", example: "2:30 PM" },
    {
      label: "Time Only - 24hr: 14:30:00",
      value: "HH:mm:ss",
      example: "14:30:00",
    },
    { label: "Custom...", value: "CUSTOM", example: "" },
  ];

  // Grouped timezones for display
  get groupedTimezones() {
    const groups = {};
    this.timezoneOptions.forEach((tz) => {
      if (!groups[tz.group]) {
        groups[tz.group] = [];
      }
      groups[tz.group].push(tz);
    });
    return groups;
  }

  get timezoneGroups() {
    return Object.keys(this.groupedTimezones);
  }

  get previewText() {
    if (this.showCustomTimezone && this.customTimezone) {
      return `Custom timezone: ${this.customTimezone}`;
    }
    const selected = this.timezoneOptions.find(
      (tz) => tz.value === this.selectedTimezone
    );
    return selected ? `${selected.label} (${selected.abbr})` : "";
  }

  get formatPreviewText() {
    if (this.showCustomFormat && this.customFormat) {
      return `Format: ${this.customFormat}`;
    }
    const selected = this.formatOptions.find(
      (f) => f.value === this.selectedFormat
    );
    return selected ? `Example: ${selected.example}` : "";
  }

  // Getters for inputDateTime from inputVariables
  get inputDateTime() {
    const param = this.inputVariables?.find(
      ({ name }) => name === "inputDateTime"
    );
    return param && param.value;
  }

  get inputDateTimeType() {
    const param = this.inputVariables?.find(
      ({ name }) => name === "inputDateTime"
    );
    return param && param.valueDataType;
  }

  connectedCallback() {
    // Initialize from inputVariables if present
    if (this.inputVariables) {
      const timezoneParam = this.inputVariables.find(
        (v) => v.name === "timezoneId"
      );
      const formatParam = this.inputVariables.find(
        (v) => v.name === "dateFormat"
      );
      const dateTimeParam = this.inputVariables.find(
        (v) => v.name === "inputDateTime"
      );

      // Ensure inputDateTime is always dispatched, even if null
      // This is required so Flow Builder knows the parameter exists
      if (dateTimeParam) {
        this.dispatchFlowValueChangeEvent(
          "inputDateTime",
          dateTimeParam.value !== undefined ? dateTimeParam.value : null,
          dateTimeParam.valueDataType || "DateTime"
        );
      } else {
        // If not in inputVariables, dispatch null to ensure parameter is registered
        this.dispatchFlowValueChangeEvent("inputDateTime", null, "DateTime");
      }

      if (timezoneParam && timezoneParam.value) {
        // Check if it's a custom timezone not in our list
        const found = this.timezoneOptions.find(
          (tz) => tz.value === timezoneParam.value
        );
        if (found) {
          this.selectedTimezone = timezoneParam.value;
        } else {
          this.selectedTimezone = "CUSTOM";
          this.customTimezone = timezoneParam.value;
          this.showCustomTimezone = true;
        }
      }

      if (formatParam && formatParam.value) {
        // Check if it's a custom format not in our list
        const found = this.formatOptions.find(
          (f) => f.value === formatParam.value
        );
        if (found) {
          this.selectedFormat = formatParam.value;
        } else {
          this.selectedFormat = "CUSTOM";
          this.customFormat = formatParam.value;
          this.showCustomFormat = true;
        }
      }
    } else {
      // Even if no inputVariables, dispatch null for inputDateTime to register the parameter
      this.dispatchFlowValueChangeEvent("inputDateTime", null, "DateTime");
    }

    // Dispatch initial values for timezone and format
    this.dispatchValueChange();
  }

  handleTimezoneChange(event) {
    const value = event.detail.value;
    if (value === "CUSTOM") {
      this.showCustomTimezone = true;
      this.selectedTimezone = "CUSTOM";
    } else {
      this.showCustomTimezone = false;
      this.selectedTimezone = value;
      this.customTimezone = "";
      this.timezoneError = "";
    }
    this.dispatchValueChange();
  }

  handleCustomTimezoneChange(event) {
    this.customTimezone = event.target.value;
    this.validateTimezone();
    this.dispatchValueChange();
  }

  handleFormatChange(event) {
    const value = event.detail.value;
    if (value === "CUSTOM") {
      this.showCustomFormat = true;
      this.selectedFormat = "CUSTOM";
    } else {
      this.showCustomFormat = false;
      this.selectedFormat = value;
      this.customFormat = "";
      this.formatError = "";
    }
    this.dispatchValueChange();
  }

  handleCustomFormatChange(event) {
    this.customFormat = event.target.value;
    this.validateFormat();
    this.dispatchValueChange();
  }

  validateTimezone() {
    if (this.showCustomTimezone && this.customTimezone) {
      // Basic validation - check if it looks like a timezone ID
      const tzPattern = /^[A-Za-z]+\/[A-Za-z_]+$/;
      if (!tzPattern.test(this.customTimezone.trim())) {
        this.timezoneError =
          "Invalid timezone format. Use format like: America/New_York";
      } else {
        this.timezoneError = "";
      }
    } else {
      this.timezoneError = "";
    }
  }

  validateFormat() {
    if (this.showCustomFormat && this.customFormat) {
      // Basic validation - check if format string contains valid patterns
      const validPatterns = /[yMdHhmsaE]/;
      if (!validPatterns.test(this.customFormat)) {
        this.formatError =
          "Format may be invalid. Use Salesforce DateTime format patterns.";
      } else {
        this.formatError = "";
      }
    } else {
      this.formatError = "";
    }
  }

  dispatchValueChange() {
    // Get the actual values to send
    const timezoneValue = this.showCustomTimezone
      ? this.customTimezone
      : this.selectedTimezone;
    const formatValue = this.showCustomFormat
      ? this.customFormat
      : this.selectedFormat === "CUSTOM"
      ? ""
      : this.selectedFormat;

    // Dispatch timezone - only if it's not CUSTOM or empty
    // Since timezoneId is required, we need to ensure a value is dispatched
    if (timezoneValue && timezoneValue !== "CUSTOM") {
      this.dispatchFlowValueChangeEvent("timezoneId", timezoneValue, "String");
    } else if (timezoneValue === "CUSTOM" && this.customTimezone) {
      // If CUSTOM is selected and custom timezone has a value, dispatch it
      this.dispatchFlowValueChangeEvent(
        "timezoneId",
        this.customTimezone,
        "String"
      );
    }

    // Format is optional, so dispatch even if empty (or skip if CUSTOM with no value)
    if (this.selectedFormat !== "CUSTOM") {
      this.dispatchFlowValueChangeEvent(
        "dateFormat",
        formatValue || "",
        "String"
      );
    } else if (this.showCustomFormat && this.customFormat) {
      this.dispatchFlowValueChangeEvent(
        "dateFormat",
        this.customFormat,
        "String"
      );
    }
  }

  handleFlowComboboxValueChange(event) {
    if (event && event.detail) {
      // Use event.detail.id (from flow combobox) or fallback to name attribute
      const fieldName = event.detail.id || event.detail.name || "inputDateTime";
      // Ensure data type is DateTime for inputDateTime field
      const dataType =
        fieldName === "inputDateTime" && !event.detail.newValueDataType
          ? "DateTime"
          : event.detail.newValueDataType;
      // Allow null values to be passed through (Apex will handle null DateTime)
      const value =
        event.detail.newValue !== undefined ? event.detail.newValue : null;
      this.dispatchFlowValueChangeEvent(fieldName, value, dataType);
    }
  }

  dispatchFlowValueChangeEvent(id, newValue, newValueDataType) {
    // Always dispatch the event, even if newValue is null
    // Flow Builder needs to receive null values to properly configure the action
    const valueChangedEvent = new CustomEvent(
      "configuration_editor_input_value_changed",
      {
        bubbles: true,
        cancelable: false,
        composed: true,
        detail: {
          name: id,
          newValue: newValue !== undefined ? newValue : null,
          newValueDataType: newValueDataType,
        },
      }
    );
    this.dispatchEvent(valueChangedEvent);
  }
}
