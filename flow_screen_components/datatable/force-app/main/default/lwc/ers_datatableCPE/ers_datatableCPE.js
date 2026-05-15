/**
 * Lightning Web Component for Flow Screens:       ers_datatableCPE
 * 
 * When the datatable LWC is running in configuration mode
 * It sends values back to the Datatable Configuration Wizard Flow
 * Which passes them back to the ers_datatableCPE LWC as Output Variables
 * Which dispatches them to the Flow where a datatable LWC is being configured
 * 
 * CREATED BY:          Eric Smith
 * 
 * VERSION:             3.x.x & 4.x.x
 * 
 * RELEASE NOTES:       https://github.com/alexed1/LightningFlowComponents/tree/master/flow_screen_components/datatable/README.md
**/

import {LightningElement, track, api} from 'lwc';
import getCPEReturnResults from '@salesforce/apex/ers_DatatableController.getCPEReturnResults';
import { getConstants } from 'c/ers_datatableUtils';

const CONSTANTS = getConstants();   // From ers_datatableUtils
const CB_TRUE = CONSTANTS.CB_TRUE;
const CB_FALSE = CONSTANTS.CB_FALSE;
const CB_PREFIX = CONSTANTS.CB_ATTRIB_PREFIX;
const RECORDS_PER_PAGE = CONSTANTS.RECORDS_PER_PAGE;
const DEFAULT_ACTION = CONSTANTS.DEFAULT_ACTION;
const DEFAULT_DISPLAY_TYPE = CONSTANTS.DEFAULT_DISPLAY_TYPE;
const PERFORM_ACTION_LABEL = CONSTANTS.PERFORM_ACTION_LABEL;
const REMOVE_ROW_LABEL = CONSTANTS.REMOVE_ROW_LABEL;
const RUN_FLOW_LABEL = CONSTANTS.RUN_FLOW_LABEL;
const DEFAULT_ICON = CONSTANTS.DEFAULT_ICON;
const PERFORM_ACTION_ICON = CONSTANTS.PERFORM_ACTION_ICON;
const REMOVE_ROW_ICON = CONSTANTS.REMOVE_ROW_ICON;
const RUN_FLOW_ICON = CONSTANTS.RUN_FLOW_ICON;
const DEFAULT_COLOR = CONSTANTS.DEFAULT_COLOR;
const PERFORM_ACTION_COLOR = CONSTANTS.PERFORM_ACTION_COLOR;
const REMOVE_ROW_COLOR = CONSTANTS.REMOVE_ROW_COLOR;
const RUN_FLOW_COLOR = CONSTANTS.RUN_FLOW_COLOR;
const ACTION_BUTTON_SIDE = CONSTANTS.ACTION_BUTTON_SIDE;
const SHOW_DEBUG_INFO = CONSTANTS.SHOW_DEBUG_INFO;
const DEBUG_INFO_PREFIX = CONSTANTS.DEBUG_INFO_PREFIX;

const defaults = {
    tableBorder: true,
    apexDefinedTypeInputs: false,
    inputAttributePrefix: 'select_',
    wizardAttributePrefix: 'wiz_',
    dualListboxHeight: '770',
    customHelpDefinition: 'CUSTOM',
    type: 'Type',
    pick: 'Pick',
    NOENCODE: true,
};

const COLORS = { 
    blue: '#4C6E96',        //Brand is #1B5297, decreasing shades: #346096, #4C6E96, #657B96
    blue_light: '#657B96',
    green: '#659668',
    green_light: '#7E967F',
    red: '#966594',
    red_light: '#967E95',
    orange: '#E79556',
    orange_light: '#FEB97D'
}

export default class ers_datatableCPE extends LightningElement {

    versionNumber;

    // Define any banner overrides you want to use (see fsc_flowBanner.js)
    _bannerMargin = 'slds-m-top_small slds-m-bottom_xx-small';
    _bannerClass = 'slds-text-color_inverse slds-text-heading_medium slds-m-bottom_xx-small';
    _defaultBannerColor = COLORS.blue;
    _colorWizardOverride = COLORS.green;
    _colorAdvancedOverride = COLORS.red;
    _colorRowActionsOverride = COLORS.orange;
    _defaultModalHeaderColor = COLORS.blue_light;
    _modalHeaderColorWizardOverride = COLORS.green_light;
    _modalHeaderColorAdvancedOverride = COLORS.red_light;
    _modalHeaderColorRowActionsOverride = COLORS.orange_light;

    _inputVariables = [];
    _builderContext = [];
    _elementInfo = {};
    _flowVariables;
    _elementType;
    _elementName;
    _automaticOutputVariables;

    // These are the parameter values being seeded to & coming back from the Wizard Flow
    _wiz_columnFields;
    _wiz_columnAlignments;
    _wiz_columnEdits;
    _wiz_columnFilters;
    _wiz_columnIcons;
    _wiz_columnLabels;
    _wiz_columnWidths;
    _wiz_columnWraps;
    _wiz_columnFlexes;
    _wiz_columnCellAttribs;
    _wiz_columnTypeAttribs;
    _wiz_columnOtherAttribs;

    vSelectionMethod;
    vFieldList = '';
    isEarlyExit = true;
    colFieldList = [];
    validateErrors = [];

    selectedSObject = '';
    isRecordCollectionSelected = false;
    isSerializedSelected = false;
    isApexSelected = false;
    disableAllowALl = false;
    isCheckboxColumnHidden = false;
    isShowCheckboxColumn = false;
    isNoEdits = true;
    isNoFilters = true;
    isFlowLoaded = false;
    myBanner = 'My Banner';
    wizardHeight = defaults.dualListboxHeight;
    @api showColumnAttributesToggle = false; // TODO remove api
    disallowHeaderChange = false;
    firstPass = true;
    isNextDisabled = true;
    nextLabel = 'Next';
    errorApex;
    objectLabel;
    objectPluralLabel;
    objectIconName;
    dispatchValue;

    @api 
    get isSerializedRecordDataInput() {                                                 
        return this.inputValues.isSerializedRecordData.value;                           
    }
    
    @api
    get serializedRecordData() {
        return this.inputValues.serializedRecordData.value;
    }
    set serializedRecordData(value) {
        this.inputValues.serializedRecordData.value = value;
    }

    @api 
    get isSerializedRecordDataSelected() {                                              //DELETE
        return false;                                                                   //DELETE
    }                                                                                   //DELETE

    @api
    get isDisplayAll() {
        return this.inputValues.displayAll.value;
    }
    set isDisplayAll(value) {
        this.inputValues.displayAll.value = value;
    }

    @api
    get isAllowOverflow() {
        return this.inputValues.allowOverflow.value;
    }
    set isAllowOverflow(value) {
        this.inputValues.allowOverflow.value = value;
    }

    @api 
    get isSObjectInput() {
        return !this.inputValues.isUserDefinedObject.value;
    }

    @api
    get isObjectSelected() { 
        return (!!this.selectedSObject && this.isSObjectInput);
    }

    @api
    get availableObjectTypes() {        // Allow admin to specify All object types
        return (this.isDisplayAll) ? 'All' : '';
    }

    @api
    get bannerMargin() {
        return this._bannerMargin;
    }

    @api
    get bannerClass() {
        return this._bannerClass;
    }

    @api
    get defaultBannerColor() {
        return this._defaultBannerColor;
    }

    @api
    get colorWizardOverride() { 
        return this._colorWizardOverride;
    }

    @api
    get colorRowActionsOverride() { 
        return this._colorRowActionsOverride;
    }

    @api
    get colorAdvancedOverride() { 
        return this._colorAdvancedOverride;
    }

    @api
    get defaultModalHeaderColor() {
        return this._defaultModalHeaderColor;
    }
    
    @api
    get modalHeaderColorWizardOverride() {
        return this._modalHeaderColorWizardOverride;
    }
    
    @api
    get modalHeaderColorAdvancedOverride() {
        return this._modalHeaderColorAdvancedOverride;
    }

    @api
    get modalHeaderColorRowActionsOverride() {
        return this._modalHeaderColorRowActionsOverride;
    }

    @api
    get showColumnAttributes() { 
        return (this.showColumnAttributesToggle || !this.isSObjectInput || this.inputValues.isSerializedRecordData.value);
    }
    
    @api
    get isShowColumnAttributesToggle() { 
        return (this.isObjectSelected && !this.inputValues.isSerializedRecordData.value);
    }

    @api
    get showHideColumnAttributes() {
        return this.showColumnAttributes ? 'slds-show' : 'slds-hide';
    }

    @api
    get showHideRemoveRowAction() {
        return (this.inputValues.cb_isRemoveRowAction.value == CB_TRUE) ? 'slds-show' : 'slds-hide';
    }
    get showHideRowAction() {               // v4.3.5 Use for any row action
        return this.showHideRemoveRowAction;
    }

    get showHideMaxNumberRows() {
        return (this.inputValues.rowActionType.value == 'Remove Row') ? 'slds-show' : 'slds-hide';
    }

    get showRowActionIcon() {
        return (this.inputValues.rowActionDisplay.value == 'Icon') ? 'slds-show' : 'slds-hide';
    }

    get showRowActionButtonIconColor() {
        return (this.inputValues.rowActionDisplay.value != 'Button') ? 'slds-show' : 'slds-hide';
    }

    get showRowActionButtonIconPosition() {
        return (this.inputValues.rowActionDisplay.value == 'Both') ? 'slds-show' : 'slds-hide';
    }

    get showButtonOptions() {
        return (this.inputValues.rowActionDisplay.value == 'Icon') ? 'slds-hide' : 'slds-show';
    }
    
    @api
    get removeRowActionClass() {
        return (this.inputValues.cb_isRemoveRowAction.value == CB_TRUE) ? 'slds-box slds-box_x-small slds-m-top_small' : '';
    }
    get rowActionClass() {                  // v4.3.5 Use for any row action
        return this.removeRowActionClass;
    }

    @api
    get removeRowActionCheckboxClass() {
        return (this.inputValues.cb_isRemoveRowAction.value == CB_TRUE) ? '' : 'slds-m-top_xx-small';
    }
    get rowActionCheckboxClass() {          // v4.3.5 Use for any row action
        return this.removeRowActionCheckboxClass;
    }

    get sampleActionClass() {
        return 'slds-box slds-box_x-small slds-m-top_xx-small';
    }

    get rowActionInputLabel() {
        return (this.inputValues.rowActionDisplay.value == 'Icon') ? this.inputValues.removeLabel.label : this.inputValues.rowActionButtonLabel.label;
    }

    get rowActionInputLabelHelp() {
        return (this.inputValues.rowActionDisplay.value == 'Icon') ? this.inputValues.removeLabel.helpText : this.inputValues.rowActionButtonLabel.helpText;
    }

    get rowActionInputIcon() {
        return (this.inputValues.rowActionDisplay.value == 'Icon') ? this.inputValues.removeIcon.label : this.inputValues.rowActionButtonIcon.label;
    }

    get rowActionInputIconHelp() {
        return (this.inputValues.rowActionDisplay.value == 'Icon') ? this.inputValues.removeIcon.helpText : this.inputValues.rowActionButtonIcon.helpText;
    }

    @api
    get showHidePaginationAttributes() {
        return (this.inputValues.cb_showPagination.value == CB_TRUE) ? 'slds-show' : 'slds-hide';
    }

    @api
    get paginationClass() {
        return (this.inputValues.cb_showPagination.value == CB_TRUE) ? 'slds-box slds-box_x-small slds-m-top_small' : '';
    }

    @api
    get paginationCheckboxClass() {
        return (this.inputValues.cb_showPagination.value == CB_TRUE) ? '' : 'slds-m-top_xx-small';
    }

    @api
    get isNoLinks() {
        return (this.inputValues.cb_not_suppressNameFieldLink.value == CB_FALSE);
    }

    @api
    get isDisableNavigateNext() {
        return this.isNoEdits || this.inputValues.suppressBottomBar.value;
    }
    set isDisableNavigateNext(value) {
        this.inputValues.suppressBottomBar.value = value;
    }

    @api
    get isDisableSuppressBottomBar() {
        return this.isNoEdits || this.inputValues.navigateNextOnSave.value;
    }
    set isDisableSuppressBottomBar(value) {
        this.inputValues.navigateNextOnSave.value = value;
    }

    get disableSearchBarSelection() {
        return !this.inputValues.isDisplayHeader.value;
    }

    get disableSelectCountSelection() {
        return this.inputValues.hideCheckboxColumn.value;
    }

    @api
    get wiz_columnFields() { 
        return this._wiz_columnFields;
    }
    set wiz_columnFields(value) { 
        const name = 'columnFields';
        this._wiz_columnFields = value;
        this.dispatchValue = (value) ? decodeURIComponent(value) : '';
        this.dispatchFlowValueChangeEvent(name, this.dispatchValue, 'String');
        this.updateFlowParam(defaults.wizardAttributePrefix + name, value, ''); 
        if (value) {
            this.vFieldList = value;
            this.updateFlowParam('vFieldList', this.vFieldList, null, defaults.NOENCODE);
            this.createFieldCollection(this.vFieldList);
        }
    }

    @api
    get wiz_columnAlignments() { 
        return this._wiz_columnAlignments;
    }
    set wiz_columnAlignments(value) { 
        const name = 'columnAlignments';
        this._wiz_columnAlignments = value;
        this.dispatchValue = (value) ? decodeURIComponent(value) : '';
        this.dispatchFlowValueChangeEvent(name, this.dispatchValue, 'String');
        this.updateFlowParam(defaults.wizardAttributePrefix + name, value, '');    
    }

    @api
    get wiz_columnEdits() { 
        return this._wiz_columnEdits;
    }
    set wiz_columnEdits(value) { 
        const name = 'columnEdits';
        this._wiz_columnEdits = value;
        this.dispatchValue = (value) ? decodeURIComponent(value) : '';
        this.dispatchFlowValueChangeEvent(name, this.dispatchValue, 'String');
        this.updateFlowParam(defaults.wizardAttributePrefix + name, value, '');
    }

    @api
    get wiz_columnFilters() { 
        return this._wiz_columnFilters;
    }
    set wiz_columnFilters(value) { 
        const name = 'columnFilters';
        this._wiz_columnFilters = value;
        this.dispatchValue = (value) ? decodeURIComponent(value) : '';
        this.dispatchFlowValueChangeEvent(name, this.dispatchValue, 'String');
        this.updateFlowParam(defaults.wizardAttributePrefix + name, value, '');
    }

    @api
    get wiz_columnIcons() { 
        return this._wiz_columnIcons;
    }
    set wiz_columnIcons(value) { 
        const name = 'columnIcons';
        this._wiz_columnIcons = value;
        this.dispatchValue = (value) ? decodeURIComponent(value) : '';
        this.dispatchFlowValueChangeEvent(name, this.dispatchValue, 'String');
        this.updateFlowParam(defaults.wizardAttributePrefix + name, value, '');
    }

    @api
    get wiz_columnLabels() { 
        return this._wiz_columnLabels;
    }
    set wiz_columnLabels(value) { 
        const name = 'columnLabels';
        this._wiz_columnLabels = value;
        try{
            this.dispatchValue = (value) ? decodeURIComponent(value) : '';
        }
        catch(err) {    // Handle column label that includes a % character
            this.dispatchValue = value;
        }
        this.dispatchFlowValueChangeEvent(name, this.dispatchValue, 'String');
        this.updateFlowParam(defaults.wizardAttributePrefix + name, value, '');
    }

    @api
    get wiz_columnWidths() { 
        return this._wiz_columnWidths;
    }
    set wiz_columnWidths(value) { 
        const name = 'columnWidths';
        this._wiz_columnWidths = value;
        this.dispatchValue = (value) ? decodeURIComponent(value) : '';
        this.dispatchFlowValueChangeEvent(name, this.dispatchValue, 'String');
        this.updateFlowParam(defaults.wizardAttributePrefix + name, value, '');
    }

    @api
    get wiz_columnWraps() { 
        return this._wiz_columnWraps;
    }
    set wiz_columnWraps(value) { 
        const name = 'columnWraps';
        this._wiz_columnWraps = value;
        this.dispatchValue = (value) ? decodeURIComponent(value) : '';
        this.dispatchFlowValueChangeEvent(name, this.dispatchValue, 'String');
        this.updateFlowParam(defaults.wizardAttributePrefix + name, value, '');
    }

    @api
    get wiz_columnFlexes() { 
        return this._wiz_columnFlexes;
    }
    set wiz_columnFlexes(value) { 
        const name = 'columnFlexes';
        this._wiz_columnFlexes = value;
        this.dispatchValue = (value) ? decodeURIComponent(value) : '';
        this.dispatchFlowValueChangeEvent(name, this.dispatchValue, 'String');
        this.updateFlowParam(defaults.wizardAttributePrefix + name, value, '');
    }

    @api
    get wiz_columnCellAttribs() { 
        return this._wiz_columnCellAttribs;
    }
    set wiz_columnCellAttribs(value) { 
        const name = 'columnCellAttribs';
        this._wiz_columnCellAttribs = value;
        this.dispatchValue = (value) ? decodeURIComponent(value) : '';
        this.dispatchFlowValueChangeEvent(name, this.dispatchValue, 'String');
        this.updateFlowParam(defaults.wizardAttributePrefix + name, value, '');
    }

    @api
    get wiz_columnTypeAttribs() { 
        return this._wiz_columnTypeAttribs;
    }
    set wiz_columnTypeAttribs(value) { 
        const name = 'columnTypeAttribs';
        this._wiz_columnTypeAttribs = value;
        this.dispatchValue = (value) ? decodeURIComponent(value) : '';
        this.dispatchFlowValueChangeEvent(name, this.dispatchValue, 'String');
        this.updateFlowParam(defaults.wizardAttributePrefix + name, value, '');
    }

    @api
    get wiz_columnOtherAttribs() { 
        return this._wiz_columnOtherAttribs;
    }
    set wiz_columnOtherAttribs(value) { 
        const name = 'columnOtherAttribs';
        this._wiz_columnOtherAttribs = value;
        this.dispatchValue = (value) ? decodeURIComponent(value) : '';
        this.dispatchFlowValueChangeEvent(name, this.dispatchValue, 'String');
        this.updateFlowParam(defaults.wizardAttributePrefix + name, value, '');
    }

    // These names have to match the input attribute names in your <myLWCcomponent>.js-meta.xml file
    @track inputValues = { 
        objectName: {value: null, valueDataType: null, isCollection: false, label: 'Select Object', 
            helpText: 'Select the Object to use in the Datatable',
            isError: false, errorMessage: null},
        fieldName: {value: null, valueDataType: null, isCollection: false, label: 'Select Field', 
            helpText: null},
        tableData: {value: null, valueDataType: null, isCollection: true, label: 'Display which records?', 
            helpText: 'Record Collection variable containing the records to display in the datatable.',
            isError: false, errorMessage: null},
        preSelectedRows: {value: null, valueDataType: null, isCollection: true, label: 'Which records are already selected?', 
            helpText: 'Record Collection variable containing the records to show as pre-selected in the datatable.'},
        tableDataString: {value: null, valueDataType: null, isCollection: false, label: 'Datatable Record String', 
            helpText: 'Object Collection string variable containing the records to display in the datatable.'},
        preSelectedRowsString: {value: null, valueDataType: null, isCollection: false, label: 'Pre-Selected Rows String',
            helpText: 'Object Collection string variable containing the records to show as pre-selected in the datatable.'},
        apex_picklistFieldMap: {value: null, valueDataType: null, isCollection: false, label: 'Column Picklist Values (Apex-Defined Only)',
            helpText: 'JSON string containing picklist values for user-defined objects. Format: {"fieldName":[{"label":"Label1","value":"Value1"}]}'},
        columnFields: {value: null, valueDataType: null, isCollection: false, label: 'Column Fields', 
            helpText: "REQUIRED: Comma separated list of field API Names to display in the datatable.",
            isError: false, errorMessage: null},  
        columnAlignments: {value: null, valueDataType: null, isCollection: false, label: 'Column Alignments (Col#:alignment,...)', 
            helpText: "Comma separated list of ColID:Alignment Value (left,center,right)  \n" +   
            "NOTE: ColIDs can be either the column number or the field API Name"},
        columnEdits: {value: null, valueDataType: null, isCollection: false, label: 'Column Edits (Col#:true,...) or All', 
            helpText: "'All' or a Comma separated list of ColID:true or false  \n" +   
            "NOTE: Some data types cannot be edited in a datable (lookup, picklist, location, encrypted, rich text, long text area)\n" + 
            "NOTE: ColIDs can be either the column number or the field API Name"},
        columnFilters: {value: null, valueDataType: null, isCollection: false, label: 'Column Filters (Col#:true,...) or All', 
            helpText: "'All' or a Comma separated list of ColID:true or false  \n" +   
            "NOTE: Some data types cannot be filtered in a datable (location, encrypted)  \n" + 
            "NOTE: ColIDs can be either the column number or the field API Name"},              
        columnIcons: {value: null, valueDataType: null, isCollection: false, label: 'Column Icons (Col#:icon,...)', 
            helpText: "Comma separated list of ColID:Icon Identifier  --  EXAMPLE: 1:standard:account (Display the first column with the Account icon)  \n" + 
            "NOTE: ColIDs can be either the column number or the field API Name"},
        columnLabels: {value: null, valueDataType: null, isCollection: false, label: 'Column Labels (Col#:label,...)', 
            helpText: "Comma separated list of ColID:Label (These are only needed if you want a label that is different from the field's defined label)  \n" + 
            "NOTE: ColIDs can be either the column number or the field API Name"},
        columnScales: {value: null, valueDataType: null, isCollection: false, label: 'Column Scales (Col#:scale,...)', 
            helpText: "(Apex Defined Only) Comma separated list of ColID:Scale (The number of digits to display to the right of the decimal point in currency, number and percent fields (default = 0))  \n" + 
            "NOTE: ColIDs can be either the column number or the field API Name"},
        columnTypes: {value: null, valueDataType: null, isCollection: false, label: 'Column Types (Col#:type,...)', 
            helpText: "(Apex Defined Only) Comma separated list of ColID:FieldType (boolean, currency, date, datetime, number, email, id, location, percent, phone, time, url, text(default))  \n" + 
            "NOTE: ColIDs can be either the column number or the field API Name"},
        columnWidths: {value: null, valueDataType: null, isCollection: false, label: 'Column Widths (Col#:width,...)', 
            helpText: "Comma separated list of ColID:Width (in pixels).  \n" + 
            "NOTE: ColIDs can be either the column number or the field API Name"},
        columnWraps: {value: null, valueDataType: null, isCollection: false, label: 'Column Wraps (Col#:true,...)', 
            helpText: "Comma separated list of ColID:true or false (Default:false)  \n" + 
            "NOTE: ColIDs can be either the column number or the field API Name"},
        columnFlexes: {value: null, valueDataType: null, isCollection: false, label: 'Column Flexes (Col#:true,...)', 
            helpText: "Comma separated list of ColID:true or false (Default:false)  \n" + 
            "NOTE: ColIDs can be either the column number or the field API Name"},
        columnCellAttribs: {value: null, valueDataType: null, isCollection: false, label: 'Special Cell Attributes',
            helpText: "(Col#:{name:value,...};...) Use ; as the separator -- \n" + 
            "EXAMPLE: FancyField__c:{class: 'slds-theme_shade slds-theme_alert-texture', iconName: {fieldName: IconValue__c}, iconPosition: left}"},
        columnTypeAttribs: {value: null, valueDataType: null, isCollection: false, label: 'Special Type Attributes',
            helpText: "(Col#:{name:value,...};...) Use ; as the separator -- \n" + 
            "EXAMPLE: DateField__c:{year:'numeric', day:'2-digit', month:'long'}; NumberField__c:{minimumFractionDigits:4}"},
        columnOtherAttribs: {value: null, valueDataType: null, isCollection: false, label: 'Special Other Attributes',
            helpText: "(Col#:{name:value,...};...) Use ; as the separator -- \n" + 
            "EXAMPLE: Description:{wrapText: true, wrapTextMaxLines: 5}"},
        isDisplayHeader: {value: null, valueDataType: null, isCollection: false, label: 'Display Table Header', 
            helpText: '(Optional) Select this option if you want a header to appear above the datatable.'}, 
        cb_isDisplayHeader: {value: null, valueDataType: null, isCollection: false, label: ''},    
        tableLabel: {value: null, valueDataType: null, isCollection: false, label: 'Header Label', 
            helpText: '(Optional) Provide a value here for the header label.'},
        tableIcon: {value: null, valueDataType: null, isCollection: false, label: 'Header Icon', 
            helpText: '(Optional) Provide a value here for the header icon.  Example: standard:account'},
        tableBorder: {value: null, valueDataType: null, isCollection: false, label: 'Add Border', 
            helpText: 'When selected, a thin border will be displayed around the entire datatable.'},
        cb_tableBorder: {value: CB_TRUE, valueDataType: null, isCollection: false, label: ''},
        tableHeight: {value: null, valueDataType: null, isCollection: false, label: 'Table Height',
            helpText: 'CSS specification for the height of the datatable (Examples: 30rem, 200px, calc(50vh - 100px)  If you leave this blank, the datatable will expand to display all records.)  \n' +
            'NOTE: This value will be ignored if the Allow Overflow attribute is set to True.'},
        maxNumberOfRows: {value: null, valueDataType: null, isCollection: false, label: 'Maximum Number of Records to Include', 
            helpText: 'Enter a number here if you want to restrict how many records will be included from the record collection.'},
        showPagination: {value: null, valueDataType: null, isCollection: false, label: 'Add Pagination', 
            helpText: 'When selected, an entry will be added to the header to select the number of records per page and a footer will be added to the Datatable allowing the user to select and navigate through the pages.'},
        cb_showPagination: {value: null, valueDataType: null, isCollection: false, label: ''},
        recordsPerPage: {value: null, valueDataType: null, isCollection: false, label: 'Number of Records per Page', 
            helpText: 'Enter the maximum number of records to be displayed on each page.'},
        showFirstLastButtons: {value: null, valueDataType: null, isCollection: false, label: 'Show First and Last Page Buttons', 
            helpText: 'When selected, the footer will include buttons to jump to the First and Last pages.'},
        cb_showFirstLastButtons: {value: CB_TRUE, valueDataType: null, isCollection: false, label: ''},            
        suppressNameFieldLink: {value: null, valueDataType: null, isCollection: false, label: "No link on 'Name field",                     // OBSOLETE as of v3.0.10
            helpText: "Suppress the default behavior of displaying the SObject's 'Name' field as a link to the record"},
        hideCheckboxColumn: {value: null, valueDataType: null, isCollection: false, label: 'Disallow row selection', 
            helpText: 'Select to hide the row selection column.  --  NOTE: The checkbox column will always display when inline editing is enabled.'},
        cb_hideCheckboxColumn: {value: null, valueDataType: null, isCollection: false, label: ''}, 
        isShowSearchBar: {value: null, valueDataType: null, isCollection: false, label: 'Show search bar', 
            helpText: 'Select to show a Search Bar in the table header.  Search will work together with Column Filters to identify the records to show in the Datatable. \n' +
            'NOTE: The Search Bar option requires that "Display Table Header" be selected'},
        cb_isShowSearchBar: {value: null, valueDataType: null, isCollection: false, label: ''}, 
        hideHeaderActions: {value: null, valueDataType: null, isCollection: false, label: 'Hide Column Header Actions', 
            helpText: 'Set to True to hide all column header actions including Sort, Clip Text, Wrap Text & Filter.'},
        cb_hideHeaderActions: {value: null, valueDataType: null, isCollection: false, label: ''}, 
        hideClearSelectionButton: {value: null, valueDataType: null, isCollection: false, label: 'Hide Clear Selection/Filter Buttons', 
            helpText: 'Set to True to hide the Clear Selection Button that would normally appear on a radio button selection table and the Clear Filter Button that would normally appear when any column has a filter applied. \n' +
            'NOTE: The Clear Filter button will always appear when no matching records are available to display in a datatable.'},
        cb_hideClearSelectionButton: {value: null, valueDataType: null, isCollection: false, label: ''}, 
        showRowNumbers: {value: null, valueDataType: null, isCollection: false, label: 'Show Row Numbers', 
            helpText: 'Display a row number column as the first column in the table.'}, 
        cb_showRowNumbers: {value: null, valueDataType: null, isCollection: false, label: ''},    
        showRecordCount: {value: null, valueDataType: null, isCollection: false, label: 'Show Record Count in Header', 
            helpText: 'Display the number of records in the table header.  This will match what is shown in a List View header.'}, 
        cb_showRecordCount: {value: null, valueDataType: null, isCollection: false, label: ''},
        showSelectedCount: {value: null, valueDataType: null, isCollection: false, label: 'Show Selected Count in Header', 
            helpText: 'Display the number of selected records in the table header.'}, 
        cb_showSelectedCount: {value: null, valueDataType: null, isCollection: false, label: ''},            
        isRequired: {value: null, valueDataType: null, isCollection: false, label: 'Require', 
            helpText: 'When this option is selected, the user will not be able to advance to the next Flow screen unless at least one row is selected in the datatable.'},
        cb_isRequired: {value: null, valueDataType: null, isCollection: false, label: ''},
        singleRowSelection: {value: null, valueDataType: null, isCollection: false, label: 'Single row selection only', 
            helpText: 'When this option is selected, Radio Buttons will be displayed and only a single row can be selected.  The default (False) will display Checkboxes and allow multiple records to be selected.'},
        cb_singleRowSelection: {value: null, valueDataType: null, isCollection: false, label: ''},    
        matchCaseOnFilters: {value: null, valueDataType: null, isCollection: false, label: 'Match case on column filters',
            helpText: "Select if you want to force an exact match on case for column filter values."},
        cb_matchCaseOnFilters: {value: null, valueDataType: null, isCollection: false, label: ''},
        suppressBottomBar: {value: null, valueDataType: null, isCollection: false, label: 'Hide Cancel/Save buttons',
            helpText: "Cancel/Save buttons will appear by default at the very bottom of the table once a field is edited. \n" +  
            "When hiding these buttons, field updates will be applied as soon as the user Tabs out or selects a different field."},
        cb_suppressBottomBar: {value: null, valueDataType: null, isCollection: false, label: ''},
        navigateNextOnSave: {value: null, valueDataType: null, isCollection: false, label: 'Navigate to Next Flow Element on Save',
            helpText: "When selecting Save after inline editing, immediately navigate to the next Flow element. \n" +  
            "This removes the need for the User to select the Next button after saving. "},
        cb_navigateNextOnSave: {value: null, valueDataType: null, isCollection: false, label: ''},        
        isUserDefinedObject: {value: null, valueDataType: null, isCollection: false, label: 'Input data is Apex-Defined', 
            helpText: 'Select if you are providing a User(Apex) Defined object rather than a Salesforce SObject.'},
        cb_isUserDefinedObject: {value: null, valueDataType: null, isCollection: false, label: ''},
        keyField: {value: 'Id', valueDataType: null, isCollection: false, label: 'Key Field', 
            helpText: 'This is normally the Id field, but you can specify a different field if all field values are unique.'},
        not_tableBorder: {value: null, valueDataType: null, isCollection: false, label: 'No Border'},                                       // OBSOLETE as of v3.0.10 - Used so tableBorder can default to True
        not_suppressNameFieldLink: {value: null, valueDataType: null, isCollection: false, label: 'Show navigation links on Name fields',   // Default value is to show the links
            helpText: "Display the SObject's 'Name' field as a link to the record."},
        cb_not_suppressNameFieldLink: {value: CB_TRUE, valueDataType: null, isCollection: false, label: ''},
        openLinkinSameTab: {value: null, valueDataType: null, isCollection: false, label: 'Open links in the same Tab', 
            helpText: 'When this option is selected, clicking on a link will open the record in the same browser or console Tab instead of a new browser Tab.  This is especially useful when the user is running in a Console.'},
        cb_openLinkinSameTab: {value: null, valueDataType: null, isCollection: false, label: ''},
        displayAll: {value: null, valueDataType: null, isCollection: false, label: 'Display ALL Objects for Selection', 
            helpText: 'Select if you want the Object picklist to display all Standard and Custom Salesforce Objects.'},
        cb_displayAll: {value: null, valueDataType: null, isCollection: false, label: ''},
        recordTypeId: {value: null, valueDataType: null, isCollection: false, label: 'Record Type Id for Picklist Values',
            helpText: "Specify a Record Type Id value here to restrict the values in editable picklists to be only those supported by the specified Record Type. \n" +
            "This selection will apply to all records in the table no matter their individual Record Type."},
        allowNoneToBeChosen: {value: null, valueDataType: null, isCollection: false, label: 'Include a --None-- Picklist Option', 
            helpText: 'Select if you want editable picklist fields to include a --None-- (null) option. (default=true)'},
        cb_allowNoneToBeChosen: {value: CB_TRUE, valueDataType: null, isCollection: false, label: ''},
        allowOverflow: {value: null, valueDataType: null, isCollection: false, label: 'Allow table to overflow its container', 
            helpText: 'Select if you want the datatable to be able to overflow its container.  Useful when editing picklists on a table with only a few records.  Not recommended for wide tables in narrow containers'},
        cb_allowOverflow: {value: null, valueDataType: null, isCollection: false, label: ''},
        suppressCurrencyConversion: {value: null, valueDataType: null, isCollection: false, label: 'Suppress Currency Conversion', 
            helpText: 'In multi-currency orgs, suppress the default conversion of currency fields to the User\'s currency'},
        cb_suppressCurrencyConversion: {value: null, valueDataType: null, isCollection: false, label: ''},
        isCaseInsensitiveSort: {value: null, valueDataType: null, isCollection: false, label: 'Ignore character case when sorting', 
            helpText: 'By default, string values will sort upper case characters before lower case characters (ACEbd).  Select this option to match the same sort sequence as standard List Views and Get Records queries (AbCdE)'},
        cb_isCaseInsensitiveSort: {value: null, valueDataType: null, isCollection: false, label: ''},
        serializedRecordData: {value: null, valueDataType: null, isCollection: false, label: 'Input serialized data', 
            helpText: 'Select if you want the datatable to be able to accept serialized data.'},
        isSerializedRecordData: {value: null, valueDataType: null, isCollection: false, label: 'Input data is Serialized', 
            helpText: 'Select if you want the datatable to be able to accept serialized data.'},
        cb_isSerializedRecordData: {value: null, valueDataType: null, isCollection: false, label: ''},
        isRemoveRowAction: {value: null, valueDataType: null, isCollection: false, label: 'Add a Row Action', 
            helpText: 'Select if you want to add a Row Action to each row of the datatable.'},
        cb_isRemoveRowAction: {value: null, valueDataType: null, isCollection: false, label: ''},
        rowActionType: {value: null, valueDataType: null, isCollection: false, label: 'Row Action Type', 
            helpText: 'Select the type of row action.  Current options are Standard and Remove Row.  A Flow row action will be added in the future.'},
        rowActionDisplay: {value: null, valueDataType: null, isCollection: false, label: 'Row Action Display Type', 
            helpText: 'Select how you want the row action to appear.  It can be a clickable Icon or a Button with a Label and an optional Icon'},
        removeLabel: {value: null, valueDataType: null, isCollection: false, label: 'Row Action Label', 
            helpText: 'This value will be used as the text that appears when hovering on the Row Action Button (Default: Perform Action, Remove Row or Run Flow)'},
        removeRowLeftOrRight: {value: null, valueDataType: null, isCollection: false, label: 'Row Action Column Location', 
                helpText: 'Specify if the Row Action column should be on the Left or the Right (Default: Right)'},
        removeIcon: {value: null, valueDataType: null, isCollection: false, label: 'Row Action Icon', 
            helpText: 'This is the icon that will be used for the Row Action Button (Default: utility:touch_action, utility:close or utility:flow)'},
        removeColor: {value: null, valueDataType: null, isCollection: false, label: 'Row Action Icon Color', 
            helpText: 'This is the color (Dafault, Red, Green or Black) for the icon that will be used for the Row Action Icon'},
        maxRemovedRows: {value: null, valueDataType: null, isCollection: false, label: 'Maximum # of rows that can be removed', 
            helpText: 'Enter a number here if you want to restrict how many rows can be removed from the datatable (Default: 0 - no limit)'},
        rowActionButtonLabel: {value: null, valueDataType: null, isCollection: false, label: 'Row Action Button Label', 
            helpText: 'This value will be used as the button text for the Row Action Button (Default: Perform Action, Remove Row or Run Flow)'},
        rowActionButtonIcon: {value: null, valueDataType: null, isCollection: false, label: 'Row Action Button Icon', 
            helpText: 'Select an optional icon for the Row Action Button (Default: utility:touch_action, utility:close or utility:flow)'},        
        rowActionButtonIconPosition: {value: null, valueDataType: null, isCollection: false, label: 'Row Action Button Icon Position', 
            helpText: 'Specify if the Row Action Button Icon should be on the Left or the Right of the label (Default: Left)'},
        rowActionButtonVariant: {value: null, valueDataType: null, isCollection: false, label: 'Row Action Button Variant', 
            helpText: 'Select the Row Action Button Variant.  This determines the visual appearance of the button.'},  
    };

    wizardHelpText = 'The Column Wizard Button runs a special Flow where you can select your column fields, manipulate the table to change column widths, '
        + 'select columns for editing and filtering, update labels and formats and much more.';

    sectionEntries = { 
        dataSource: {label: 'Data Source', info: []},
        tableFormatting: {label: 'Table Formatting', info: []},
        tableBehavior: {label: 'Table Behavior', info: []},
        rowActions: {label: 'Row Actions', info: []},
        advancedAttributes: {label: 'Advanced', info: []}
    }

    helpSections = [ 
        {name: 'dataSource', 
            attributes: [
                {name: 'objectName'},
                {name: 'displayAll'},
                {name: 'tableData'},
                {name: 'preSelectedRows'},
                {name: defaults.customHelpDefinition, 
                    label: 'Apex Defined Object Attributes', 
                    helpText: 'The Datatable component expects a serialized string of the object’s records and fields like the text seen here:\n' + 
                    '[{"field1":"StringRec1Value1","field2":"StringRec1Value2","field3":false,"field4":10},\n' + 
                    '{"field1":"StringRec2Value1","field2":"StringRec2Value2","field3":true,"field4":20},\n' + 
                    '{"field1":"StringRec3Value1","field2":"StringRec3Value2","field3":true,"field4":30}]'},
                {name: 'tableDataString'},
                {name: 'preSelectedRowsString'},
                {name: defaults.customHelpDefinition, 
                    label: 'For more information on using Apex Defined Objects with Datatable',
                    helpText: 'https://ericsplayground.wordpress.com/how-to-use-an-apex-defined-object-with-my-datatable-flow-component/'}
            ]
        },
        {name: 'tableFormatting',
            attributes: [
                {name: 'isDisplayHeader'},    
                {name: 'tableLabel'},
                {name: 'tableIcon'},
                {name: defaults.customHelpDefinition,
                    label: 'Icon Picker',
                    helpText: 'Select More to show all Icon Types, Select an Icon Type tab to see a list of icons, Select any icon to update the Header Icon value, ' +
                    'Select SELECT TYPE to hide the list of icons.'},
                {name: 'maxNumberOfRows'},
                {name: 'showPagination'},
                {name: 'recordsPerPage'},
                {name: 'showFirstLastButtons'},
                {name: 'showRowNumbers'},
                {name: 'showRecordCount'},
                {name: 'showSelectedCount'},
                {name: 'isShowSearchBar'},
                {name: 'tableBorder'},
                {name: defaults.customHelpDefinition, 
                    label: 'Configure Columns Button',
                    helpText: 'Click this button to select the columns(fields) to display.  Additionaly, the Configure Column Wizard will display\n' +
                    'a sample datatable where you can manipulate it to create the attributes needed to reproduce the format you create.'},                
            ]
        },
        {name: 'tableBehavior',
            attributes: [
                {name: 'isRequired'},
                {name: 'singleRowSelection'},                
                {name: 'hideCheckboxColumn'},
                {name: 'hideHeaderActions'},                
                {name: 'matchCaseOnFilters'},
                {name: 'hideClearSelectionButton'},
                {name: 'suppressBottomBar'},
                {name: 'navigateNextOnSave'},
                {name: 'not_suppressNameFieldLink'},
                {name: 'openLinkinSameTab'},
            ]
        },
        {name: 'rowActions',
            attributes: [
                {name: 'isRemoveRowAction'},
                {name: 'rowActionType'},
                {name: 'maxRemovedRows'},
                {name: 'rowActionDisplay'},
                {name: 'removeLabel'},
                {name: 'removeIcon'},
                {name: 'rowActionButtonLabel'},
                {name: 'rowActionButtonIcon'},
                {name: 'rowActionButtonIconPosition'},
                {name: 'rowActionButtonVariant'},
                {name: 'removeColor'},
                {name: 'removeRowLeftOrRight'},
            ]
        },
        {name: 'advancedAttributes',
            attributes: [
                {name: 'isUserDefinedObject'},
                {name: 'isSerializedRecordData'},                                                                     // LY
                {name: defaults.customHelpDefinition, 
                    label: 'Apex Defined Object Attributes', 
                    helpText: 'The Datatable component expects a serialized string of the object’s records and fields like the text seen here:\n' + 
                    '[{"field1":"StringRec1Value1","field2":"StringRec1Value2","field3":false,"field4":10},\n' + 
                    '{"field1":"StringRec2Value1","field2":"StringRec2Value2","field3":true,"field4":20},\n' + 
                    '{"field1":"StringRec3Value1","field2":"StringRec3Value2","field3":true,"field4":30}]'},
                {name: defaults.customHelpDefinition, 
                    label: 'For more information on using Apex Defined Objects with Datatable',
                    helpText: 'https://ericsplayground.wordpress.com/how-to-use-an-apex-defined-object-with-my-datatable-flow-component/'},
                {name: 'columnFields'},
                {name: 'columnAlignments'},
                {name: 'columnEdits'},
                {name: 'columnFilters'},
                {name: 'columnIcons'},
                {name: 'columnLabels'},
                {name: 'columnScales'},
                {name: 'columnTypes'},
                {name: 'columnWidths'},
                {name: 'columnFlexes'},
                {name: 'columnWraps'},
                {name: 'columnCellAttribs'},
                {name: 'apex_picklistFieldMap'},
                {name: 'columnTypeAttribs'},
                {name: 'columnOtherAttribs'},
                {name: 'recordTypeId'},
                {name: 'allowNoneToBeChosen'},
                {name: 'suppressCurrencyConversion'},
                {name: 'isCaseInsensitiveSort'},
                {name: 'allowOverflow'},
                {name: 'tableHeight'},
                {name: 'keyField'},
            ]
        }
    ]

    rowActionTypeOptions = [
        {
            label: 'Standard',
            value: 'Standard'
        },
        {
            label: 'Remove Row',
            value: 'Remove Row'
        // TODO: Add code needed to support a Run Flow row action
        // },
        // {
        //     label: 'Run Flow',
        //     value: 'Flow'
        }
    ]

    rowActionDisplayOptions = [
        {
            label: 'Icon Only',
            value: 'Icon'
        },
        {
            label: 'Button Only',
            value: 'Button'
        },
        {
            label: 'Button with Icon',
            value: 'Both'
        }
    ]

    actionButtonIconColorOptions = [
        {
            label: 'Default',
            value: ''
        },
        {
            label: 'Red',
            value: 'remove-icon'
        },
        {
            label: 'Green',
            value: 'remove-icon-green'
        },
        {
            label: 'Black',
            value: 'remove-icon-black'
        }
    ]

    buttonVariantOptions = [
        {value: 'base', label: 'Base'},
        {value: 'neutral', label: 'Neutral'},
        {value: 'brand', label: 'Brand'},
        {value: 'brand-outline', label: 'Brand Outline'},
        {value: 'destructive', label: 'Destructive'},
        {value: 'destructive-text', label: 'Destructive Text'},
        {value: 'inverse', label: 'Inverse'},
        {value: 'success', label: 'Success'}
    ]

    actionLeftOrRightOptions = [
        {
            label: 'Left',
            value: 'Left'
        },
        {
            label: 'Right',
            value: 'Right'
        }
    ]

    // settings = { 
    //     attributeObjectName: 'objectName',
    //     attributeFieldName: 'fieldName',
    //     flowDataTypeString: 'String',
    // }

    // selectDataSourceOptions = [
    //     {label: 'SObject Collection', value: !this.inputValues.isUserDefinedObject},
    //     {label: 'Apex Defined Object String', value: this.inputValues.isUserDefinedObject}
    // ];

    // Input attributes for the Wizard Flow
    @api flowParams = [
        {name: 'vSObject', type: 'String', value: null},
        {name: 'vSelectionMethod', type: 'String', value: ''},
        {name: 'vFieldList', type: 'String', value: ''},
        {name: 'colFieldList', type: 'String', value: []},
        {name: 'wiz_columnAlignments', type: 'String', value: ''},
        {name: 'wiz_columnEdits', type: 'String', value: ''},
        {name: 'wiz_columnFields', type: 'String', value: ''},
        {name: 'wiz_columnFilters', type: 'String', value: ''},
        {name: 'wiz_columnLabels', type: 'String', value: ''},
        {name: 'wiz_columnIcons', type: 'String', value: ''},
        {name: 'wiz_columnWidths', type: 'String', value: ''},
        {name: 'wiz_columnWraps', type: 'String', value: ''},
        {name: 'wiz_columnFlexes', type: 'String', value: ''},
        {name: 'wiz_columnCellAttribs', type: 'String', value: ''},
        {name: 'wiz_columnTypeAttribs', type: 'String', value: ''},
        {name: 'wiz_columnOtherAttribs', type: 'String', value: ''},
        {name: 'vWizRecordCount', type: 'String', value: ''},
    ]

    @api 
    get builderContext() {
        return this._builderContext;
    }
    set builderContext(context) {
        this._builderContext = context || {};
        if (this._builderContext) {
            const { variables } = this._builderContext;
            this._flowVariables = [...variables];
        }
    }

    @api 
    get automaticOutputVariables () {
        return this._automaticOutputVariables;
    }

    set automaticOutputVariables(value) {
        this._automaticOutputVariables = value;
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

    @api 
    get inputVariables() {
        return this._inputVariables;
    }

    set inputVariables(variables) {
        this._inputVariables = variables || [];
        this.initializeValues();
    }

    initializeValues() {
        console.log(DEBUG_INFO_PREFIX+'ers_datatableCPE - initializeValues');
        this.isCheckboxColumnHidden = false;
        this._inputVariables.forEach(curInputParam => {
            if (curInputParam.name && curInputParam.value != null) {
                console.log(DEBUG_INFO_PREFIX+'Init:', curInputParam.name, curInputParam.valueDataType, curInputParam.value);             
                if (curInputParam.name && this.inputValues[curInputParam.name] != null) {

                    try {
                        this.inputValues[curInputParam.name].value = (curInputParam.valueDataType === 'reference') ? '{!' + curInputParam.value + '}' : decodeURIComponent(curInputParam.value);
                    }
                    catch(err) {    // Handle column label that includes a % character
                        this.inputValues[curInputParam.name].value = curInputParam.value
                    }
                    this.inputValues[curInputParam.name].valueDataType = curInputParam.valueDataType;

                    if (curInputParam.name == 'objectName') { 
                        this.selectedSObject = curInputParam.value;    
                    }
                    if (curInputParam.name == 'columnFields') { 
                        this.vFieldList = curInputParam.value;
                        this.updateFlowParam('vFieldList', this.vFieldList, null, defaults.NOENCODE);
                        this.createFieldCollection(this.vFieldList);
                    }
                    if ((curInputParam.name == 'columnEdits') && curInputParam.value) {
                        this.isNoEdits = false;
                    }
                    if ((curInputParam.name == 'columnFilters') && curInputParam.value) {
                        this.isNoFilters = false;
                    }
                    if ((curInputParam.name == 'tableData') && curInputParam.value) {
                        this.isRecordCollectionSelected = true;
                    }
                    if ((curInputParam.name == 'hideCheckboxColumn') && curInputParam.value) {
                        this.isCheckboxColumnHidden = true;
                    }
                    if ((curInputParam.name == 'rowActionButtonIcon') && this.inputValues.rowActionDisplay.value == 'Button') {
                        this.inputValues.rowActionButtonIcon.value = "";
                    }
                    if ((curInputParam.name == 'rowActionDisplay') && curInputParam.value == 'Button') {
                        this.inputValues.rowActionButtonIcon.value = "";
                    }

                    // Handle Wizard Attributes
                    let wizName = defaults.wizardAttributePrefix + curInputParam.name;
                    if (this.flowParams.find(fp => fp.name == wizName)) {
                        this.updateFlowParam(wizName, this.inputValues[curInputParam.name].value, '');
                    }

                }
                if (curInputParam.isError) { 
                    this.inputValues[curInputParam.name].isError = false;
                }
            }
        });

        if (this.firstPass) { 
            this.handleDefaultAttributes();
            this.handleBuildHelpInfo();
        }
        this.firstPass = false;
    }

    handleDefaultAttributes() {
        console.log(DEBUG_INFO_PREFIX+'handle default attributes');
        if (this.inputValues.recordsPerPage.value == null) {
            this.inputValues.recordsPerPage.value = RECORDS_PER_PAGE.toString();
        }
        if (this.inputValues.rowActionDisplay.value == null) {
            this.inputValues.rowActionDisplay.value = DEFAULT_DISPLAY_TYPE;
        }
        if (this.inputValues.removeLabel.value == null) {
            this.inputValues.removeLabel.value = DEFAULT_ACTION;
        }
        if (this.inputValues.rowActionButtonLabel.value == null) {
            this.inputValues.rowActionButtonLabel.value = DEFAULT_ACTION;
        }
        if (this.inputValues.removeIcon.value == null) {
            this.inputValues.removeIcon.value = DEFAULT_ICON;
        }
        if (this.inputValues.rowActionButtonIcon.value == null) {
            this.inputValues.rowActionButtonIcon.value = DEFAULT_ICON;
        }
        if (this.inputValues.rowActionType.value == null) {
            this.inputValues.rowActionType.value = DEFAULT_ACTION;
            this.updateActionDefaults(DEFAULT_ACTION);
        }
        if (this.inputValues.removeColor.value == null) {
            this.inputValues.removeColor.value = DEFAULT_COLOR;
        }
        if (this.inputValues.rowActionButtonIconPosition.value == null) {
            this.inputValues.rowActionButtonIconPosition.value = 'Left';
        }
        if (this.inputValues.rowActionButtonVariant.value == null) {
            this.inputValues.rowActionButtonVariant.value = 'brand-outline';
        }
        if (this.inputValues.removeRowLeftOrRight.value == null) {
            this.inputValues.removeRowLeftOrRight.value = ACTION_BUTTON_SIDE;
        }
        if (this.inputValues.maxRemovedRows.value == null) {
            this.inputValues.maxRemovedRows.value = 0;
        }
        if (this.inputValues.rowActionDisplay.value == 'Button') {
            this.inputValues.rowActionButtonIcon.value = "";
        }
    }

    updateActionDefaults(actionType) {
        let newLabelValue = DEFAULT_ACTION;
        let newIconValue = DEFAULT_ICON;
        let newColorValue = DEFAULT_COLOR;
        if (actionType == 'Standard') {
            newLabelValue = PERFORM_ACTION_LABEL;
            newIconValue = PERFORM_ACTION_ICON;
            newColorValue = PERFORM_ACTION_COLOR;
        }
        if (actionType == 'Remove Row') {
            newLabelValue = REMOVE_ROW_LABEL;
            newIconValue = REMOVE_ROW_ICON;
            newColorValue = REMOVE_ROW_COLOR;
        }
        if (actionType == 'Flow') {
            newLabelValue = RUN_FLOW_LABEL;
            newIconValue = RUN_FLOW_ICON;
            newColorValue = RUN_FLOW_COLOR;
        }
        this.dispatchFlowValueChangeEvent('removeLabel', newLabelValue, 'String');
        this.dispatchFlowValueChangeEvent('removeIcon', newIconValue, 'String');
        this.dispatchFlowValueChangeEvent('removeColor', newColorValue, 'String');
        this.dispatchFlowValueChangeEvent('rowActionButtonLabel', newLabelValue, 'String');
        if (this.inputValues.rowActionDisplay.value == 'Button') {
            newIconValue = "";
        }
        this.dispatchFlowValueChangeEvent('rowActionButtonIcon', newIconValue, 'String');
    }

    handleBuildHelpInfo() {
        console.log(DEBUG_INFO_PREFIX+'build help info');
        this.helpSections.forEach(section => {
            this.sectionEntries[section.name].info = [];
            section.attributes.forEach(attribute => {
                if (attribute.name == defaults.customHelpDefinition) { 
                    this.sectionEntries[section.name].info.push({label: attribute.label, helpText: attribute.helpText});
                } else {
                    this.sectionEntries[section.name].info.push({label: this.inputValues[attribute.name].label, helpText: this.inputValues[attribute.name].helpText});
                }
            });
        });
    }

    handleDynamicTypeMapping(event) { 
        console.log(DEBUG_INFO_PREFIX+'handling a dynamic type mapping');
        console.log(DEBUG_INFO_PREFIX+'event is ' + JSON.stringify(event));
        let typeValue = event.detail.objectType;
        const typeName = this._elementType === "Screen" ? 'T' : 'T__record'; 
        console.log(DEBUG_INFO_PREFIX+'typeValue is: ' + typeValue);
        const dynamicTypeMapping = new CustomEvent('configuration_editor_generic_type_mapping_changed', {
            composed: true,
            cancelable: false,
            bubbles: true,
            detail: {
                typeName, 
                typeValue, 
            }
        });
        this.dispatchEvent(dynamicTypeMapping);
        this.updateRecordVariablesComboboxOptions(typeValue);
        this.updateFlowParam('vSObject', typeValue);
        if (this.selectedSObject != typeValue) {
            this.inputValues.tableData.value = null;
            this.inputValues.preSelectedRows.value = null;
            this.dispatchFlowValueChangeEvent('tableData', null, 'String');
            this.dispatchFlowValueChangeEvent('preSelectedRows', null, 'String');
            this.dispatchFlowValueChangeEvent('serializedRecordData', null, 'String');
            this.selectedSObject = typeValue;
            this.dispatchFlowValueChangeEvent('objectName', typeValue, 'String');
        }
        this.handleGetObjectDetails(typeValue);
    }    

    handleGetObjectDetails(objName) { 
        console.log(DEBUG_INFO_PREFIX+'Passing object name to Apex Controller', objName);
        getCPEReturnResults({ objName: objName })
        .then(result => {
            let returnResults = JSON.parse(result);

            // Assign return results from the Apex callout
            this.objectLabel = returnResults.objectLabel;
            this.objectPluralLabel = returnResults.objectPluralLabel;
            this.objectIconName = returnResults.objectIconName;
            console.log(`${DEBUG_INFO_PREFIX}Return Values for ${objName}, Label: ${this.objectLabel}, Plural: ${this.objectPluralLabel}, Icon: ${this.objectIconName}`);

        })  // Handle any errors from the Apex Class
        .catch(error => {
            console.log(DEBUG_INFO_PREFIX+'getCPEReturnResults error is: ' + JSON.stringify(error));
            if (error.body) {
                this.errorApex = 'Apex Action error: ' + error.body.message;
                alert(this.errorApex + '\n');  // Present the error to the user
            }
            return this.errorApex; 
        });
    }

    handleValueChange(event) {      
        if (event.target) {
            let curAttributeName = event.target.name ? event.target.name.replace(defaults.inputAttributePrefix, '') : null;
            let value = event.detail ? event.detail.value : event.target.value;
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
            if (curAttributeName == 'rowActionType') {
                this.updateActionDefaults(curAttributeValue);
            }
            if (curAttributeName == 'rowActionDisplay') {  // Clear or reset button icon if switching between button only & both
                this.inputValues.rowActionButtonIcon.value = (curAttributeValue == 'Button') ? "" : this.inputValues.removeIcon.value;
                this.dispatchFlowValueChangeEvent('rowActionButtonIcon', this.inputValues.rowActionButtonIcon.value, 'String');
            }
            if (curAttributeName == 'rowActionType') {  // Clear or reset button icon if switching between action types
                this.inputValues.rowActionButtonIcon.value = (this.inputValues.rowActionDisplay.value == 'Button') ? "" : this.inputValues.removeIcon.value;
                this.dispatchFlowValueChangeEvent('rowActionButtonIcon', this.inputValues.rowActionButtonIcon.value, 'String');
            }
        }
    }

    handleCheckboxChange(event) {
        if (event.target && event.detail) {
            let changedAttribute = event.target.name.replace(defaults.inputAttributePrefix, '');
            this.dispatchFlowValueChangeEvent(changedAttribute, event.detail.newValue, event.detail.newValueDataType);
            this.dispatchFlowValueChangeEvent(CB_PREFIX+changedAttribute, event.detail.newStringValue, 'String');

            // Handle isDisplayHeader
            if ((changedAttribute == 'isDisplayHeader') && this.isObjectSelected) {
                if (event.detail.newValue) { 
                    this.inputValues.tableLabel.value = this.objectPluralLabel;
                    this.dispatchFlowValueChangeEvent('tableLabel', this.inputValues.tableLabel.value, 'String');
                    this.inputValues.tableIcon.value = this.objectIconName;
                    this.dispatchFlowValueChangeEvent('tableIcon', this.inputValues.tableIcon.value, 'String');
                } else { 
                    this.inputValues.tableLabel.value = '';
                    this.dispatchFlowValueChangeEvent('tableLabel', this.inputValues.tableLabel.value, 'String');
                    this.inputValues.tableIcon.value = '';
                    this.dispatchFlowValueChangeEvent('tableIcon', this.inputValues.tableIcon.value, 'String');
                    this.updateCheckboxValue('isShowSearchBar', false);
                }
            }

            // Handle displayALl
            if (changedAttribute == 'displayAll') {
                this.inputValues.objectName.value = null;
                this.selectedSObject = null;
                this.dispatchFlowValueChangeEvent('objectName',this.selectedSObject, 'String');
            }

            // Change the displayed Data Sources if the Apex Defined Object is selected
            if (changedAttribute == 'isUserDefinedObject') {
                this.isApexSelected = event.detail.newValue;
                if (event.detail.newValue) {
                    this.isDisplayAll = false;                          // Clear & Disable Display All Selection when selecting User Defined Object
                    if (this.inputValues.objectName.value == null) {    // Have to force Dynamic Type Mapping to avoid an error when trying to exit CPE
                        let typeValue = 'User';                         // Aribtrary Object just so we can dispatch the event
                        const typeName = this._elementType === "Screen" ? 'T' : 'T__record'; 
                        const dynamicTypeMapping = new CustomEvent('configuration_editor_generic_type_mapping_changed', {
                            composed: true,
                            cancelable: false,
                            bubbles: true,
                            detail: {
                                typeName, 
                                typeValue,  
                            }
                        });
                        this.dispatchEvent(dynamicTypeMapping);
                    }
                }
                this.disableAllowAll = event.detail.newValue;
            }

            if (changedAttribute == 'isSerializedRecordData') {
                this.isSerializedSelected = event.detail.newValue;
                if (event.detail.newValue) {
                    this.isDisplayAll = false;                          
                    if (this.inputValues.objectName.value == null) {    // Have to force Dynamic Type Mapping to avoid an error when trying to exit CPE
                        let typeValue = 'Account';                         // Aribtrary Object just so we can dispatch the event
                        const typeName = this._elementType === "Screen" ? 'T' : 'T__record'; 
                        const dynamicTypeMapping = new CustomEvent('configuration_editor_generic_type_mapping_changed', {
                            composed: true,
                            cancelable: false,
                            bubbles: true,
                            detail: {
                                typeName, 
                                typeValue,  
                            }
                        });
                        this.dispatchEvent(dynamicTypeMapping);
                    }
                }
            }

            // Don't allow hide the checkbox column if a selection is required
            if (changedAttribute == 'isRequired') {
                this.isShowCheckboxColumn = event.detail.newValue;
                if (this.isShowCheckboxColumn) {
                    this.updateCheckboxValue('hideCheckboxColumn', false);
                }
            }
            
            // Skip is required and single row options if the checkbox column is hidden
            if (changedAttribute == 'hideCheckboxColumn') { 
                this.isCheckboxColumnHidden = event.detail.newValue;
                this.updateCheckboxValue('isRequired', false);
                this.updateCheckboxValue('singleRowSelection', false);
            }

            // Don't allow Navigate Next on Save when bottom bar (Save button) is suppressed
            if (changedAttribute == 'suppressBottomBar') { 
                this.isDisableNavigateNext = event.detail.newValue;
                if (this.isDisableNavigateNext) {
                    this.updateCheckboxValue('navigateNextOnSave', false);
                }
            }            

            // Don't allow bottom bar to be suppressed when Navigate Next on Save is selected
            if (changedAttribute == 'navigateNextOnSave') { 
                this.isDisableSuppressBottomBar = event.detail.newValue;
                if (this.isDisableSuppressBottomBar) {
                    this.updateCheckboxValue('suppressBottomBar', false);
                }
            }
            
            // Clear Show Selected Count if Disallow Row Relection is selected
            if (changedAttribute == 'hideCheckboxColumn') { 
                if (event.detail.newValue) {
                    this.updateCheckboxValue('showSelectedCount', false);
                }
            } 

        }

    }

    updateCheckboxValue(name, value) {
        this.inputValues[name].value = value;
        this.dispatchFlowValueChangeEvent(name, value, 'boolean');
        this.inputValues[CB_PREFIX+name].value = (value) ? CB_TRUE : CB_FALSE;
        this.dispatchFlowValueChangeEvent(CB_PREFIX+name, this.inputValues[CB_PREFIX+name].value, 'String');
    }

    handleHeightChange(event) { 
        this.wizardHeight = event.target.value;
    }

    updateRecordVariablesComboboxOptions(objectType) {       
        const variables = this._flowVariables.filter(
            (variable) => variable.objectType === objectType
        );
        let comboboxOptions = [];
        variables.forEach((variable) => {
            comboboxOptions.push({
                label: variable.name,
                value: "{!" + variable.name + "}"
            });
        });
        return comboboxOptions;
    }

    handleFlowComboboxValueChange(event) {   
        if (event.target && event.detail) {
            let changedAttribute = event.target.name.replace(defaults.inputAttributePrefix, '');
            let newType = event.detail.newValueDataType;
            let newValue = event.detail.newValue;
            if ((changedAttribute == 'maxNumberOfRows' || changedAttribute == 'maxRemovedRows' || changedAttribute == 'recordsPerPage') && newType != 'reference') {
                newType = 'Number';
            }
            this.dispatchFlowValueChangeEvent(changedAttribute, newValue, newType);

            if (changedAttribute == 'columnEdits') {
                if (!newValue) {
                    this.updateCheckboxValue('suppressBottomBar', false);
                    this.updateCheckboxValue('navigateNextOnSave', false);
                    this.isNoEdits = true;
                } else {
                    this.isNoEdits = false;
                }
            }

            if (changedAttribute == 'tableData') {
                this.isRecordCollectionSelected = !!event.detail.newValue;
            }
        }
    }

    handleTableIcon(event) {
        this.setIconAttribute('tableIcon', event);
    }

    handleActionIcon(event) {
        this.setIconAttribute('removeIcon', event);
    }

    setIconAttribute(changedAttribute, event) {
        this.inputValues[changedAttribute].value = event.detail;
        this.dispatchFlowValueChangeEvent(changedAttribute, event.detail, 'String');
    }

    handleShowColumnAttributesToggle(event) { 
        this.showColumnAttributesToggle = !this.showColumnAttributesToggle;
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
        console.log(DEBUG_INFO_PREFIX+'dispatchFlowValueChangeEvent', id, newValue, newValueDataType);
        if (!newValue) { 
            this.inputValues[id].value = newValue;  // You need to force any cleared values back to inputValues
        }                
        if (newValue) {
            this.inputValues[id].isError = false;   // Clear any prior error before validating again if the field has any value
        }
        if (id == 'removeLabel' || id == 'removeIcon') {
            let otherAttribute = 'rowActionButton'.concat(id.substr(6));
            this.inputValues[otherAttribute].value = newValue;
            this.dispatchFlowValueChangeEvent(otherAttribute, newValue, newValueDataType);
        }
    }

    dispatchFlowActionEvent(action) { 
        const flowActionEvent = new CustomEvent('flowAction', { 
            bubbles: true,
            cancelable: false,
            composed: true,
            detail: { 
                id: 'flowAction',
                name: action
            }
        });
        this.dispatchEvent(flowActionEvent);
    }

    updateFlowParam(name, value, ifEmpty=null, noEncode=false) {  
        // Set parameter values to pass to Wizard Flow
        console.log(DEBUG_INFO_PREFIX+'updateFlowParam:', name, value);        
        let currentValue = this.flowParams.find(param => param.name === name).value;
        if (value != currentValue) {
            if (noEncode) {
                this.flowParams.find(param => param.name === name).value = value || ifEmpty;
            } else { 
                this.flowParams.find(param => param.name === name).value = (value) ? encodeURIComponent(value) : ifEmpty;
            }
        }
    }

    // generateFieldDescriptor(label, name, required, type) { 
    //     return {
    //         label: label,
    //         name: name,
    //         required: required,
    //         type: type
    //     }
    // }

    get wizardParams() {
        // Parameter value string to pass to Wizard Flow
        this.updateFlowParam('vWizRecordCount', CONSTANTS.WIZROWCOUNT);
        this.updateFlowParam('vSObject', this.inputValues.objectName.value);
        return this.flowParams;
    }
    
    // handlePickObjectAndFieldValueChange(event) { 
    //     if (event.detail) {
    //         this.dispatchFlowValueChangeEvent(this.settings.attributeObjectName, event.detail.objectType, this.settings.flowDataTypeString);
    //         this.dispatchFlowValueChangeEvent(this.settings.attributeFieldName, event.detail.fieldName, this.settings.flowDataTypeString);
    //     }
    // }

    // These are values coming back from the Wizard Flow
    handleFlowStatusChange(event) {
        console.log(DEBUG_INFO_PREFIX+'=== handleFlowStatusChange -', event.detail.status, '===');
        if (event.detail.status === "ERROR") { 
            console.log(DEBUG_INFO_PREFIX+'Flow Error: ',JSON.stringify(event));
        } else {      
            this.isFlowLoaded = true;
            event.detail.outputVariables.forEach(attribute => {
                let name = attribute.name;
                let value = attribute.value; 
                console.log(DEBUG_INFO_PREFIX+'Output from Wizard Flow: ', name, value);

                if (name == 'vSelectionMethod') { 
                    this.vSelectionMethod = value;
                    this.updateFlowParam(name, value, '');
                    this.isNextDisabled = (value) ? false : true;
                }

                if (name == 'vFieldList' && value) { 
                    // Save Selected Fields & Create Collection
                    this.vFieldList = value.split(' ').join('');  //Remove all spaces  
                    this.updateFlowParam(name, value, null, defaults.NOENCODE);
                    this.createFieldCollection(this.vFieldList);
                }

                if (name == 'vEarlyExit') { 
                    // Determine which screen the user exited on
                    this.isEarlyExit = value;
                }

                if (name.substring(0,defaults.wizardAttributePrefix.length) == defaults.wizardAttributePrefix) {
                    let changedAttribute = name.replace(defaults.wizardAttributePrefix, '');                
                    if (event.detail.status === "FINISHED" && !this.isEarlyExit) { 

                        // Update the wizard variables to force passing the changed values back to the CPE which will then post to the Flow Builder
                        switch (changedAttribute) { 
                            case 'columnFields':
                                this.wiz_columnFields = value;
                                break;
                            case 'columnAlignments':
                                this.wiz_columnAlignments = value;
                                break;
                            case 'columnEdits':
                                this.wiz_columnEdits = value;
                                this.isNoEdits = (value) ? false : true;
                                this.dispatchFlowValueChangeEvent('isRequired', false, 'boolean');
                                if (this.isNoEdits) {
                                    this.updateCheckboxValue('suppressBottomBar', false);
                                    this.updateCheckboxValue('navigateNextOnSave', false);
                                    this.isDisableSuppressBottomBar = true;
                                    this.isDisableNavigateNext = true;
                                }
                                break;
                            case 'columnFilters':
                                this.wiz_columnFilters = value;
                                this.isNoFilters = (value) ? false : true;
                                if (this.isNoFilters) {
                                    this.updateCheckboxValue('matchCaseOnFilters', false);
                                }
                                break;
                            case 'columnIcons':
                                this.wiz_columnIcons = value;
                                break;
                            case 'columnLabels':
                                this.wiz_columnLabels = value;
                                break;
                            case 'columnWidths':
                                this.wiz_columnWidths = value;
                                break;
                            case 'columnWraps':
                                this.wiz_columnWraps = value;
                                break;
                            case 'columnFlexes':
                                this.wiz_columnFlexes = value;
                                break;
                            case 'columnCellAttribs': 
                                this.wiz_columnCellAttribs = value;
                                break;
                            case 'columnTypeAttribs': 
                                this.wiz_columnTypeAttribs = value;
                                break;
                            case 'columnOtherAttribs': 
                                this.wiz_columnOtherAttribs = value;
                                break;                                
                            default:
                        }
                        this.isFlowLoaded = false;
                        this.closeModal();
                    }
                }
            });
        }
    }

    createFieldCollection(fieldList) {
        // Create collection of fields from comma separated list
        if (fieldList && fieldList.length > 0) {
            this.colFieldList = [];
            fieldList.split(',').forEach(f => {
                this.colFieldList.push(f);
            });
            this.inputValues['columnFields'].isError = false;
            this.updateFlowParam('colFieldList', this.colFieldList, null, defaults.NOENCODE);
        }
    }

    handleWizardCancel() { 
        console.log(DEBUG_INFO_PREFIX+'handleWizardCancel');
    }

    handleWizardRestart() { 
        console.log(DEBUG_INFO_PREFIX+'handleWizardRestart');
    }
    
    handleWizardNext() { 
        console.log(DEBUG_INFO_PREFIX+'handleWizardNext');      
        this.dispatchFlowActionEvent('next');
    }

    connectedCallback() {
        this.template.addEventListener('keydown', this.handleKeyDown.bind(this), true);
        this.versionNumber = CONSTANTS.VERSION_NUMBER;
        
        // this.template.querySelector('.nextButton').addEventListener('click', event => { 
        //     console.log('Next Button Clicked');
        //     this.handleWizardNext();
        // });  

        // this.template.addEventListener('keydown', event => {
        //     var keycode = event.code;
        //     if(keycode == 'Escape'){
        //         console.log('CPE ESC Key Pressed');
        //         this.openModal = false;
        //         event.preventDefault();
        //         event.stopImmediatePropagation();
        //     }
        // }, true);
    }

    disconnectedCallback() { 
        // this.template.removeEventListener('keydown', this.handleKeyDown.bind(this)); //Causes: Error during LWC component disconnect phase: [Error during LWC component disconnect phase: [TypeError]] Failing descriptor: {builder_platform_interaction:screenEditor}
    }

    handleKeyDown(event) { 
        var keycode = event.code;
        if(keycode == 'Escape'){
            console.log(DEBUG_INFO_PREFIX+'CPE ESC Key Pressed');
            this.openModal = false;
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    }

    //don't forget to credit https://www.salesforcepoint.com/2020/07/LWC-modal-popup-example-code.html
    @track openModal = false;

    showModal() {
        this.openModal = true;
    }

    closeModal() {
        this.openModal = false;
    }

    @api
    validate() {
        this.validateErrors.length = 0;
        // Not Apex-Defined -- Check for Object, Record Collection, Columns
        if (this.isSObjectInput) {
            this.checkError((!this.isObjectSelected), 'objectName', 'You must select an Object');
            this.checkError((!this.isRecordCollectionSelected && !this.inputValues.isSerializedRecordData.value), 'tableData', 'You must provide a Collection of Records to display');
            this.checkError((!this.vFieldList), 'columnFields', 'At least 1 column must be selected');
        }
        this.checkError(this.inputValues.isSerializedRecordData.value && this.inputValues.isUserDefinedObject.value, 'isSerializedRecordData', 'Select only one option (Input data is Apex-Defined or Input data is Serialized)');

        let allComboboxes = this.template.querySelectorAll('c-fsc_flow-combobox');
        if (allComboboxes) {
            allComboboxes.forEach(curCombobox => {
                if (!curCombobox.reportValidity()) {
                    resultErrors.push('error');
                    console.log(DEBUG_INFO_PREFIX+'ComboBox Error:', error);
                }
            });
        }

        return this.validateErrors;
    }

    checkError(isError, key, errorString) {
        this.inputValues[key].class = 'slds-form-element';
        if (isError) { 
            this.validateErrors.push({key: key, errorString: errorString});
            this.inputValues[key].isError = true;
            this.inputValues[key].errorMessage = errorString;
            this.inputValues[key].class += ' slds-has-error';
            console.log(DEBUG_INFO_PREFIX+'CPE generated error:', key, isError, errorString);
        } else { 
            this.inputValues[key].isError = false;
        }
    }

}