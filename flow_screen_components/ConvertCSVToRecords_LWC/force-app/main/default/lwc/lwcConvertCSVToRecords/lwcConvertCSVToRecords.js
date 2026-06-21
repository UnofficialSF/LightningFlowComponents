/**
 * Lightning Web Component for Flow Screens: lwcConvertCSVToRecords
 *
 * A high-volume CSV to Records conversion component that processes CSV files
 * on the client side using PapaParse library. This component allows users to
 * upload CSV files and automatically converts them to Salesforce sObject records.
 *
 * Features:
 * - Client-side CSV parsing (no server-side processing limits)
 * - Automatic field mapping (standard and custom fields)
 * - Support for large file uploads
 * - Auto-navigation to next screen after parsing
 * - Comprehensive error handling
 * - Configurable PapaParse options
 *
 * Created By: Andy Haas
 *
 * Version History:
 *   V1.0.1  1/14/23  Fixed setting the selected object in CPE
 *   V1.0    12/29/22 Initial version hosted on FlowComponents
 *
 * @see https://unofficialsf.com/from-andy-haas-a-high-volume-convert-csv-to-records-screen-component/
 * @see https://www.papaparse.com/docs
 */

import { LightningElement, track, api } from "lwc";
import {
  FlowNavigationFinishEvent,
  FlowNavigationNextEvent,
  FlowAttributeChangeEvent,
} from "lightning/flowSupport";
import getObjectFields from "@salesforce/apex/LwcConvertCSVToRecordsHelper.getObjectFields";
import { loadScript } from "lightning/platformResourceLoader";
import PARSER from "@salesforce/resourceUrl/PapaParse";

export default class lwcConvertCSVToRecords extends LightningElement {
  // Initialize the parser
  parserInitialized = false;

  // PapaParser Inputs
  @api get delimiter() {
    return this._delimiter;
  }
  set delimiter(value) {
    this._delimiter = value;
  }
  _delimiter = ",";

  @api get newline() {
    return this._newline;
  }
  set newline(value) {
    this._newline = value;
  }
  _newline = "";

  @api get quoteChar() {
    return this._quoteChar;
  }
  set quoteChar(value) {
    this._quoteChar = value;
  }
  _quoteChar = '"';

  @api get escapeChar() {
    return this._escapeChar;
  }
  set escapeChar(value) {
    this._escapeChar = value;
  }
  _escapeChar = '"';

  @api get transformHeader() {
    return this._transformHeader;
  }
  set transformHeader(value) {
    this._transformHeader = value;
  }
  _transformHeader = undefined;

  @api get header() {
    return this._header;
  }
  set header(value) {
    this._header = value;
  }
  _header = false;

  @api get dynamicTyping() {
    return this._dynamicTyping;
  }
  set dynamicTyping(value) {
    this._dynamicTyping = value;
  }
  _dynamicTyping = false;

  @api get encoding() {
    return this._encoding;
  }
  set encoding(value) {
    this._encoding = value;
  }
  _encoding = "";

  @api get comments() {
    return this._comments;
  }
  set comments(value) {
    this._comments = value;
  }
  _comments = false;

  @api get fastMode() {
    return this._fastMode;
  }
  set fastMode(value) {
    this._fastMode = value;
  }
  _fastMode = false;

  @api get skipEmptyLines() {
    return this._skipEmptyLines;
  }
  set skipEmptyLines(value) {
    this._skipEmptyLines = value;
  }
  _skipEmptyLines = false;

  @api get transform() {
    return this._transform;
  }
  set transform(value) {
    this._transform = value;
  }
  _transform = undefined;

  @api get delimitersToGuess() {
    return this._delimitersToGuess;
  }
  set delimitersToGuess(value) {
    this._delimitersToGuess = value;
  }
  _delimitersToGuess = [];

  // Get Label for Input file
  @api get inputLabel() {
    return this._inputLabel;
  }
  set inputLabel(value) {
    this._inputLabel = value;
  }
  _inputLabel = "Upload CSV";

  // Get flow attributes
  @api get availableActions() {
    return this._availableActions;
  }
  set availableActions(value) {
    this._availableActions = value;
  }
  _availableActions = [];

  @api get autoNavigateNext() {
    return this._autoNavigateNext;
  }
  set autoNavigateNext(value) {
    this._autoNavigateNext = value;
  }
  _autoNavigateNext = false;

  // Set variables for the screen
  @track uploadFileName = "";
  @track uploadedFile = [];

  // Set objectName variable to be used in the getObjectFields Apex method
  @api objectName = "Account";

  // Set the isError variable to false
  @api get isError() {
    return this._isError;
  }
  set isError(value) {
    this._isError = value;
  }
  _isError = false;

  // Set the errorMessage variable to an null
  @api get errorMessage() {
    return this._errorMessage;
  }
  set errorMessage(value) {
    this._errorMessage = value;
  }
  _errorMessage = null;

  // Store the fileName of the uploaded CSV file
  @track fileName = "";

  // Store the fields for the selected object
  @track objectInfo = [];

  // Store Column Headers
  @track columnHeaders = [];

  // Store Rows of Data
  @track rows = [];

  // Store the output SObject records from the CSV file
  @api get outputValue() {
    return this._outputValue;
  }
  set outputValue(value) {
    this._outputValue = value;
  }
  _outputValue = [];

  // Store a Status field to show the user the status of the CSV file
  @track uploadFileStatus = "";

  // Set isLoading to false
  @api get isLoading() {
    return this._isLoading;
  }
  set isLoading(value) {
    this._isLoading = value;
  }
  _isLoading = false;

  /**
   * Determines if the upload was successful
   * @returns {boolean} True if uploadFileStatus indicates success
   */
  get isUploadSuccessful() {
    return (
      this.uploadFileStatus && this.uploadFileStatus.startsWith("Success:")
    );
  }

  @api get ignoreMissingColumns() {
    return this._ignoreMissingColumns;
  }
  set ignoreMissingColumns(value) {
    this._ignoreMissingColumns = value;
  }
  _ignoreMissingColumns = false;

  @api get ignoreMissingFields() {
    return this._ignoreMissingFields;
  }
  set ignoreMissingFields(value) {
    this._ignoreMissingFields = value;
  }
  _ignoreMissingFields = false;

  /**
   * Lifecycle hook: Initializes the PapaParse library when component is rendered
   * @returns {void}
   */
  renderedCallback() {
    if (!this.parserInitialized) {
      loadScript(this, PARSER)
        .then(() => {
          // Verify PapaParse is available
          if (typeof Papa !== "undefined") {
            this.parserInitialized = true;
          } else {
            this._errorMessage =
              "PapaParse library failed to load. Please refresh the page.";
            this._isError = true;
            console.error("PapaParse library not available after loading");
          }
        })
        .catch((error) => {
          this._errorMessage =
            "Failed to load PapaParse library: " + error.message;
          this._isError = true;
          console.error("PapaParse loading error:", error);
        });
    }
  }

  /**
   * Handles file input change event and processes the uploaded CSV file
   * Parses the CSV using PapaParse, maps columns to Salesforce fields,
   * and converts data to sObject format
   *
   * @param {Event} event - File input change event containing the uploaded file
   * @returns {void}
   */
  handleInputChange(event) {
    // Reset error state when a new file is selected
    this._isError = false;
    this._errorMessage = null;
    this.uploadFileName = "";
    this.uploadFileStatus = "";

    // Set Default Values
    this.header = true;
    this.skipEmptyLines = true;

    if (event.detail.files.length > 0) {
      const file = event.detail.files[0];

      // Display the file name immediately
      this.uploadFileName = file.name;
      this.uploadFileStatus = "Reading file...";

      // Ensure PapaParse is loaded before proceeding
      if (!this.parserInitialized || typeof Papa === "undefined") {
        this._errorMessage =
          "PapaParse library is not loaded. Please refresh the page and try again.";
        this._isError = true;
        this._isLoading = false;
        this.uploadFileStatus = "Error: Library not loaded";
        return;
      }

      this._isLoading = true;

      /**
       * Check raw file size before processing
       *
       * Note: CSV files are typically more compact than the resulting JSON payload.
       * A 3MB CSV might become a 4-5MB JSON payload after processing.
       * We check at 3MB to provide a safety margin before hitting the ~4MB payload limit.
       * The actual payload size is validated later after processing.
       */
      const maxFileSizeMB = 3;
      const fileSizeMB = file.size / (1024 * 1024);

      if (fileSizeMB > maxFileSizeMB) {
        this._errorMessage =
          `File Too Large: The CSV file is ${fileSizeMB.toFixed(
            2
          )}MB, which exceeds the recommended limit of ${maxFileSizeMB}MB. ` +
          `\n\nNote: CSV files expand when converted to JSON format. A ${fileSizeMB.toFixed(
            2
          )}MB CSV file may exceed Salesforce's ~4MB payload limit after processing. ` +
          `\n\nSolutions:\n` +
          `• Split your CSV file into smaller files\n` +
          `• Use Jetstream for large imports (http://getjetstream.app/)\n` +
          `• The file will be checked again after processing for actual payload size`;
        this._isError = true;
        this._isLoading = false;
        this.uploadFileStatus = "Error: File too large";
        return;
      }

      this.uploadFileStatus = "Parsing CSV...";
      Papa.parse(file, {
        delimiter: this._delimiter,
        newline: this._newline,
        quoteChar: this._quoteChar,
        escapeChar: this._escapeChar,
        transformHeader: this._transformHeader,
        header: this._header,
        dynamicTyping: this._dynamicTyping,
        encoding: this._encoding,
        comments: this._comments,
        fastMode: this._fastMode,
        skipEmptyLines: this._skipEmptyLines,
        transform: this._transform,
        delimitersToGuess: this._delimitersToGuess,
        complete: (parsedResults) => {
          // Validate parsedResults
          if (
            !parsedResults ||
            !parsedResults.meta ||
            !parsedResults.meta.fields
          ) {
            this._errorMessage =
              "Failed to parse CSV file. The file may be empty or invalid.";
            this._isError = true;
            this._isLoading = false;
            this.uploadFileStatus = "Error: Invalid file";
            return;
          }

          // get the meta columns
          this.columnHeaders = parsedResults.meta.fields;

          this.uploadFileStatus = "Validating columns...";

          // See if there are any empty columns
          let emptyColumns = parsedResults.meta.fields.filter(
            (field) => field === ""
          );

          // If there are empty columns, throw an error
          if (emptyColumns.length > 0 && !this._ignoreMissingColumns) {
            // Set the isError variable to true
            this._isError = true;
            this._errorMessage =
              "There are empty columns in the CSV file. Please remove the empty columns and try again.";
            this._isLoading = false;
            this.uploadFileStatus = "Error: Empty columns found";
            return;
          } else if (emptyColumns.length > 0 && this._ignoreMissingColumns) {
            // If there are empty columns, but the user wants to ignore them, remove the empty columns
            let emptyFieldNames = parsedResults.meta.fields.filter(
              (field, index) => field === ""
            );
            parsedResults.meta.fields = parsedResults.meta.fields.filter(
              (field) => field !== ""
            );

            // Set the columnHeaders variable to the new columnHeaders array
            this.columnHeaders = parsedResults.meta.fields;

            // Remove the empty columns from the data
            // When header is true, data is an array of objects, not arrays
            if (
              this._header &&
              Array.isArray(parsedResults.data) &&
              parsedResults.data.length > 0 &&
              typeof parsedResults.data[0] === "object" &&
              !Array.isArray(parsedResults.data[0])
            ) {
              // Remove empty field keys from each row object
              parsedResults.data = parsedResults.data.map((row) => {
                let newRow = {};
                for (let key in row) {
                  if (row.hasOwnProperty(key) && key !== "") {
                    newRow[key] = row[key];
                  }
                }
                return newRow;
              });
            } else {
              // Array-based rows (when header is false)
              parsedResults.data = parsedResults.data.map((row) => {
                return Array.isArray(row)
                  ? row.filter((field) => field !== "")
                  : row;
              });
            }
          }

          this.uploadFileStatus = "Retrieving field information...";
          getObjectFields({ objectName: this.objectName })
            .then((fieldList) => {
              // Validate fieldList
              if (
                !fieldList ||
                !Array.isArray(fieldList) ||
                fieldList.length === 0
              ) {
                this._errorMessage =
                  "Failed to retrieve field information for object: " +
                  this.objectName;
                this._isError = true;
                this._isLoading = false;
                this.uploadFileStatus = "Error: Field retrieval failed";
                return;
              }

              this.uploadFileStatus = "Mapping fields...";

              // fieldList is an array of objects
              // Each object has a Name and a Type property

              // Set new fieldName array
              let fieldNames = [];
              fieldNames = fieldList.map((field) => field.name);

              // Set new columnHeader array
              let newColumnHeaders = [];

              // Set array of fields to remove
              let fieldsToRemove = [];

              // Compare the column headers to the fields for the selected object
              // If the column header is not a match add __c to the end and recheck the fields
              // If the column header is still not a match, remove the column header from the list
              for (let i = 0; i < this.columnHeaders.length; i++) {
                let columnHeader = this.columnHeaders[i];

                // Trim the column header
                columnHeader = columnHeader.trim();

                // For standard fields we need to remove the space inbetween the words
                // For example: Account Name becomes AccountName
                // Create standardField variable to store the new value
                let standardField;
                if (columnHeader.includes(" ")) {
                  standardField = columnHeader.replaceAll(" ", "");
                } else {
                  standardField = columnHeader;
                }
                if (fieldNames.includes(standardField)) {
                  newColumnHeaders.push({
                    newField: columnHeader,
                    oldField: columnHeader,
                  });
                } else {
                  // Create customField variable to store the new value
                  let customField;

                  // Replace spaces with underscores
                  customField = columnHeader.replaceAll(" ", "_");

                  // Limit the length of the field to 40 characters
                  customField = customField.substring(0, 40);

                  // Remove return characters
                  customField = customField.replace(/[\r]/g, "");

                  // If the field starts with a number, add an X to the beginning of the field
                  if (customField.match(/^[0-9]/)) {
                    customField = "X" + customField;
                  }

                  // Remove any special characters
                  // % & * ( ) + - = { } [ ] : ; ' " , . < > ? / | \ ~ ` ! @ # $ ^
                  customField = customField.replace(/[^a-zA-Z0-9_]/g, "");

                  // newlines and carriage returns are also removed
                  customField = customField.replace(/[\r\n]+/gm, "");

                  // Remove any leading or trailing underscores
                  customField = customField.replace(/^_+|_+$/g, "");

                  // Replace any double underscores with a single underscore
                  customField = customField.replace(/__+/g, "_");

                  // Replace any triple underscores with a single underscore
                  customField = customField.replace(/___+/g, "_");

                  // Add __c to the end of the field
                  customField = customField + "__c";

                  // Validate the field name
                  if (fieldNames.includes(customField)) {
                    newColumnHeaders.push({
                      newField: customField,
                      oldField: columnHeader,
                    });
                  } else {
                    fieldsToRemove.push(columnHeader);
                  }
                }
              }

              // If fieldsToRemove is not empty then error out
              if (fieldsToRemove.length > 0 && !this._ignoreMissingFields) {
                this._errorMessage =
                  "The following fields are not valid: " +
                  fieldsToRemove.join(", ") +
                  ". Please remove them from the CSV file and try again.";
                this._isError = true;
                this._isLoading = false;
                this.uploadFileStatus = "Error: Invalid fields";
                return;
              } else {
                this._errorMessage = "";
                this._isError = false;
              }

              // Check if there are duplicate headers
              let duplicateHeaders = [];
              for (let i = 0; i < newColumnHeaders.length; i++) {
                let columnHeader = newColumnHeaders[i].newField;
                if (
                  newColumnHeaders.filter((x) => x.newField === columnHeader)
                    .length > 1
                ) {
                  duplicateHeaders.push(columnHeader);
                }
              }

              // If there is a duplicate header then error out
              if (duplicateHeaders.length > 0) {
                this._errorMessage =
                  "Duplicate headers found: " +
                  duplicateHeaders.join(", ") +
                  ". Please remove the duplicate headers and try again.";
                this._isError = true;
                this._isLoading = false;
                this.uploadFileStatus = "Error: Duplicate headers";
                return;
              }

              // Validate parsedResults.data
              if (!parsedResults.data || !Array.isArray(parsedResults.data)) {
                this._errorMessage = "No data found in CSV file.";
                this._isError = true;
                this._isLoading = false;
                this.uploadFileStatus = "Error: No data found";
                return;
              }

              this.uploadFileStatus = "Converting data...";

              // New array to store the rows of data
              let newRows = [];
              // Go through the parsedResults.data object and set key based on the fieldList object match on oldField and replace the oldField with the newField
              // If the key is not in the columnHeaders object, remove the key and value from the object
              // If the key is in the fieldsToRemove object, remove the key and value from the object
              for (let i = 0; i < parsedResults.data.length; i++) {
                let row = parsedResults.data[i];
                if (!row || typeof row !== "object") {
                  continue; // Skip invalid rows
                }
                let newRow = {};
                for (let key in row) {
                  if (row.hasOwnProperty(key)) {
                    let newKey = key;
                    let newValue = row[key];

                    // Handle null, undefined, or empty string values
                    if (newValue === null || newValue === undefined) {
                      newValue = "";
                    }
                    for (let j = 0; j < newColumnHeaders.length; j++) {
                      if (key === newColumnHeaders[j].oldField) {
                        newKey = newColumnHeaders[j].newField;
                      }
                    }
                    if (fieldsToRemove.includes(key)) {
                      delete row[key];
                    } else {
                      // Use the fieldList array of objects to get the field type
                      // Add the new key and value to the new row
                      // Get the field type from newKey
                      // If it is a date fields, format them to the correct format yyyy-MM-dd
                      // If it is a currency field, format it to the correct format 0.00
                      // If it is a number field, format it to the correct format 0
                      // If it is a percent field, format it to the correct format 0%

                      // Find the field type from the fieldList array of objects
                      // fieldList = [{"name":"Id","type","ID"}]
                      let fieldType = "";
                      for (let k = 0; k < fieldList.length; k++) {
                        if (fieldList[k].name === newKey) {
                          fieldType = fieldList[k].type;
                        }
                      }

                      if (fieldType === "DATE") {
                        // Check if the value is empty or null
                        if (!newValue || newValue === "" || newValue === null) {
                          newRow[newKey] = "";
                        } else {
                          // Convert to string for date parsing
                          let dateStr = String(newValue).trim();
                          if (dateStr === "") {
                            newRow[newKey] = "";
                          } else {
                            let date = new Date(dateStr);
                            // Check if the date is valid
                            if (isNaN(date.getTime())) {
                              newRow[newKey] = "";
                            } else {
                              // Format to yyyy-MM-dd with zero-padding
                              let year = date.getFullYear();
                              let month = String(date.getMonth() + 1).padStart(
                                2,
                                "0"
                              );
                              let day = String(date.getDate()).padStart(2, "0");
                              newRow[newKey] = year + "-" + month + "-" + day;
                            }
                          }
                        }
                      } else if (fieldType === "DATETIME") {
                        // Handle DateTime fields - format to ISO 8601
                        if (!newValue || newValue === "" || newValue === null) {
                          newRow[newKey] = "";
                        } else {
                          let dateStr = String(newValue).trim();
                          if (dateStr === "") {
                            newRow[newKey] = "";
                          } else {
                            let date = new Date(dateStr);
                            if (isNaN(date.getTime())) {
                              newRow[newKey] = "";
                            } else {
                              // Format to ISO 8601: yyyy-MM-ddTHH:mm:ss.000Z
                              let year = date.getFullYear();
                              let month = String(date.getMonth() + 1).padStart(
                                2,
                                "0"
                              );
                              let day = String(date.getDate()).padStart(2, "0");
                              let hours = String(date.getHours()).padStart(
                                2,
                                "0"
                              );
                              let minutes = String(date.getMinutes()).padStart(
                                2,
                                "0"
                              );
                              let seconds = String(date.getSeconds()).padStart(
                                2,
                                "0"
                              );
                              newRow[newKey] =
                                year +
                                "-" +
                                month +
                                "-" +
                                day +
                                "T" +
                                hours +
                                ":" +
                                minutes +
                                ":" +
                                seconds +
                                ".000Z";
                            }
                          }
                        }
                      } else if (fieldType === "BOOLEAN") {
                        // Handle Boolean fields
                        if (
                          newValue === null ||
                          newValue === undefined ||
                          newValue === ""
                        ) {
                          newRow[newKey] = false;
                        } else {
                          let boolStr = String(newValue).trim().toLowerCase();
                          // Accept: true, 1, yes, y, on
                          newRow[newKey] =
                            boolStr === "true" ||
                            boolStr === "1" ||
                            boolStr === "yes" ||
                            boolStr === "y" ||
                            boolStr === "on";
                        }
                      } else if (fieldType === "CURRENCY") {
                        // Handle empty values
                        if (!newValue || newValue === "" || newValue === null) {
                          newRow[newKey] = null;
                        } else {
                          // Remove all $ and all commas from the value
                          let formattedValue = String(newValue)
                            .replace(/\$/g, "")
                            .replace(/,/g, "")
                            .trim();

                          // Check if the value is a number
                          // If it is a number, format it to the correct format 0.00
                          // If not a number return null
                          if (formattedValue === "" || isNaN(formattedValue)) {
                            newRow[newKey] = null;
                          } else {
                            formattedValue =
                              parseFloat(formattedValue).toFixed(2);
                            newRow[newKey] = parseFloat(formattedValue);
                          }
                        }
                      } else if (
                        fieldType === "DOUBLE" ||
                        fieldType === "INT" ||
                        fieldType === "LONG" ||
                        fieldType === "PERCENT"
                      ) {
                        // Handle empty values
                        if (!newValue || newValue === "" || newValue === null) {
                          newRow[newKey] = null;
                        } else {
                          // Remove all % signs from the value
                          let formattedValue = String(newValue)
                            .replace(/%/g, "")
                            .trim();

                          // Check if the value is a number
                          // If it is a number, format it appropriately
                          // If not a number return null
                          if (formattedValue === "" || isNaN(formattedValue)) {
                            newRow[newKey] = null;
                          } else {
                            if (fieldType === "INT" || fieldType === "LONG") {
                              newRow[newKey] = parseInt(formattedValue, 10);
                            } else {
                              formattedValue =
                                parseFloat(formattedValue).toFixed(0);
                              newRow[newKey] = parseFloat(formattedValue);
                            }
                          }
                        }
                      } else {
                        // Handle text fields - convert to string and clean up
                        if (newValue === null || newValue === undefined) {
                          newRow[newKey] = "";
                        } else {
                          // Convert to string
                          let formattedValue = String(newValue);
                          // Remove character returns from the value
                          formattedValue = formattedValue.replace(
                            /(\r\n|\n|\r)/gm,
                            ""
                          );
                          // Trim the value
                          formattedValue = formattedValue.trim();
                          // Remove extra spaces from the value
                          // 1905 CARIBOO                        HWY    N to 1905 CARIBOO HWY N
                          formattedValue = formattedValue.replace(
                            /\s\s+/g,
                            " "
                          );
                          newRow[newKey] = formattedValue;
                        }
                      }
                    }
                  }
                }
                // Add the new row to the newRows array
                newRows.push(newRow);
              }

              // Go through the newRows and remove any rows that are empty
              newRows = newRows.filter((x) => Object.keys(x).length > 0);

              this.uploadFileStatus = "Validating payload size...";

              /**
               * Estimate final payload size before serialization
               *
               * This check helps prevent "aura:systemError" errors that occur when
               * the serialized JSON payload exceeds Salesforce's limits.
               *
               * Known limits (from community knowledge, not officially documented):
               * - Lightning component payload: ~4MB
               * - Flow variable size: Practical limits exist but not explicitly documented
               *
               * We check at 3.5MB to provide a safety margin before hitting the actual limit.
               *
               * References:
               * - StackExchange: https://salesforce.stackexchange.com/questions/219235/what-is-the-limitation-on-size-of-list-attribute-in-lightning-component
               * - Flow variable size limits are not explicitly documented by Salesforce
               */
              try {
                const testSerialization = JSON.stringify(newRows);
                const estimatedSizeMB =
                  testSerialization.length / (1024 * 1024);

                if (estimatedSizeMB > 3.5) {
                  // Too large - reject before attempting to pass to Flow
                  this._errorMessage =
                    `Data Too Large: The processed data is ${estimatedSizeMB.toFixed(
                      2
                    )}MB, which exceeds Salesforce's payload limits (~4MB). ` +
                    `Your CSV file contains ${newRows.length.toLocaleString()} rows. ` +
                    `\n\nSolutions:\n` +
                    `• Split your CSV file into smaller files (under 3MB)\n` +
                    `• Reduce the number of columns in your CSV file\n` +
                    `• Use Jetstream for large imports (http://getjetstream.app/)`;
                  this._isError = true;
                  this._isLoading = false;
                  this.uploadFileStatus = "Error: Data too large";
                  return;
                }
              } catch (serializationError) {
                console.error(
                  "Error estimating payload size:",
                  serializationError
                );
                // Continue anyway - the actual error will be caught below
              }

              this.uploadFileStatus = "Finalizing...";

              // Serialize the data with the objectName
              let serializedData = {};
              serializedData[this.objectName] = newRows;

              // Set the outputValue to the serialized data
              this._outputValue = serializedData;
              this._isLoading = false;

              // Set outputValue to the results with error handling
              try {
                this.handleValueChange("outputValue", serializedData);
                // Update status on successful completion
                this.uploadFileStatus = `Success: ${newRows.length.toLocaleString()} rows processed`;
              } catch (error) {
                // Catch any serialization or payload size errors
                console.error("Error setting outputValue:", error);
                this._errorMessage =
                  `Processing Error: The data is too large for Salesforce to handle. ` +
                  `Your CSV file contains ${newRows.length.toLocaleString()} rows. ` +
                  `\n\nSolutions:\n` +
                  `• Split your CSV file into smaller files (under 3MB)\n` +
                  `• Reduce the number of columns in your CSV file\n` +
                  `• Use Jetstream for large imports (http://getjetstream.app/)\n\n` +
                  `Technical details: ${error.message || error}`;
                this._isError = true;
                this._isLoading = false;
                this.uploadFileStatus = "Error: Processing failed";
                return;
              }

              // If the autoNavigateNext attribute is true, navigate to the next screen
              if (this._autoNavigateNext) {
                this.handleNext();
              }
            })
            .catch((error) => {
              console.error("getObjectFields error:", error);
              let errorMsg = "Failed to retrieve field information. ";
              if (error && error.body && error.body.message) {
                errorMsg += error.body.message;
              } else if (error && error.message) {
                errorMsg += error.message;
              } else {
                errorMsg += "Please verify the object name is correct.";
              }
              this._errorMessage = errorMsg;
              this._isError = true;
              this._isLoading = false;
              this.uploadFileStatus = "Error: Field retrieval failed";
              return;
            });
        },
        error: (error) => {
          console.error("PapaParse parsing error:", error);
          // Handle different error types with user-friendly messages
          let errorMsg = "CSV Parsing Error: ";
          if (error && error.message) {
            errorMsg += error.message;
          } else if (typeof error === "string") {
            errorMsg += error;
          } else {
            errorMsg += "Unable to parse the CSV file. ";
          }
          errorMsg +=
            `\n\nPlease check:\n` +
            `• The file is a valid CSV format\n` +
            `• The delimiter matches your data (comma, semicolon, tab, etc.)\n` +
            `• The file is not corrupted\n` +
            `• The file encoding is correct (UTF-8 recommended)`;
          this._errorMessage = errorMsg;
          this._isError = true;
          this._isLoading = false;
          this.uploadFileStatus = "Error: Parsing failed";
          return;
        },
      });
    }
  }

  /**
   * Handles auto navigation to the next screen/action
   * Only navigates if there are no errors and autoNavigateNext is enabled
   *
   * @returns {void}
   */
  handleNext() {
    // If there is an error, do not navigate
    if (this._isError) {
      return;
    } else {
      if (this._availableActions.find((action) => action === "NEXT")) {
        const navigateNextEvent = new FlowNavigationNextEvent();
        this.dispatchEvent(navigateNextEvent);
      }
      if (this._availableActions.find((action) => action === "FINISH")) {
        const navigateNextEvent = new FlowNavigationFinishEvent();
        this.dispatchEvent(navigateNextEvent);
      }
    }
  }

  /**
   * Notifies Flow of attribute value changes
   *
   * @param {string} apiName - The API name of the attribute that changed
   * @param {*} value - The new value for the attribute
   * @returns {void}
   */
  handleValueChange(apiName, value) {
    const attributeChangeEvent = new FlowAttributeChangeEvent(apiName, value);
    this.dispatchEvent(attributeChangeEvent);
  }
}
