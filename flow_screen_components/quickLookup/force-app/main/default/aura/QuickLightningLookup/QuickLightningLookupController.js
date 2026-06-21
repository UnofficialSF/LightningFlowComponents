/*
Copyright 2017 OpFocus, Inc

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation 
files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, 
modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the 
Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES 
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE 
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR 
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
({
    doInit : function(component, event, helper) {
        console.log('llu init');
        // If a default value is specified, override the whereClause to select it
        component.set("v.saveWhereClause", component.get('v.whereClause'));
        var defaultV = component.get('v.defaultValue');   
        if(!(!defaultV || defaultV == '')){
            var newWhere = component.get('v.displayedFieldName')+"='"+defaultV+"'"
            component.set("v.whereClause", newWhere);
        }
        
        helper.hlpGetFieldHelp(component);
        helper.hlpGetField(component);

        // Add Event Listner for click event on the component
        document.addEventListener('click', $A.getCallback(function(event) {
            if (helper.isDropDownOpen(component, event)) {
                helper.hideDropDown(component);
            }
        }, false));
    },
    handleInvokeLookup : function(component, event, helper) {
        const { searchString } = event.getParam("arguments");
        if(searchString) {
            document.getElementById(component.getGlobalId() + "_myinput").value = searchString;
            helper.hlpPerformLookup(component);
        }
    },
    performLookup : function(component, event, helper) {
        helper.hlpPerformLookup(component);
    },
    selectItem : function(component, event, helper) {
        var index = event.currentTarget.dataset.index;
        helper.hlpSelectItem(component, index);
    },
    toggleMenu : function(component, event, helper) {
        console.log('toggleMenu');
        if(component.get('v.performLookupOnFocus') === true && !helper.isDropDownOpen(component)){
            console.log('performLookupOnFocus');
            var defaultV = component.get('v.defaultValue'); 
            if(!(!defaultV || defaultV == '')){
                var newWhere = component.get('v.displayedFieldName')+"='"+defaultV.replace(/'/g,'\\\'') +"'"
                component.set("v.whereClause", newWhere);
            }
            helper.hlpPerformLookup(component, true);
        }
        else if(component.get('v.availableRecords')){
            helper.getRecordsFromList(component);
        }
        helper.hlpToggleMenu(component);
    },
    checkValidity : function(component, event, helper) {
        helper.hlpCheckValidity(component);
    },
    setHelpTextProperties : function(component, event, helper) {
        helper.hlpSetHelpTextProperties(component);
    },
    setInputValue : function(component, event, helper) {
        var selectedName = component.get("v.selectedName");
        console.log('selectedName: ' + selectedName);
        if(document.getElementById(component.getGlobalId() + "_myinput")){
            document.getElementById(component.getGlobalId() + "_myinput").value = selectedName;   
        }
        console.log('selectedName changed: ' + selectedName);         
    },
    setFilterInputName : function(component, event, helper) {
        var selectedFilterName = component.get("v.selectedFilterName");
        document.getElementById(component.getGlobalId() + "_myinput").value = selectedFilterName;
    },
    setFilterInputValue : function(component, event, helper) {
        var selectedFilterValue = component.get("v.selectedFilterValue");
        document.getElementById(component.getGlobalId() + "_myinput").value = selectedFilterValue;
    },
    getMasterFilterValue : function(component, event, helper) {
        console.log('getMasterFilterValue')
        console.log(component.get('v.parentChild') + ' == Child && ' + component.get('v.parentId') + ' == ' + event.getParam('parent'));
        if((component.get('v.parentChild') == 'Child' || component.get('v.parentChild') == 'Both') && component.get('v.parentId') == event.getParam('parent')) {
            component.set("v.masterFilterValue", event.getParam("MasterFilterValue"));
            helper.clearField(component,true);
            helper.toggleIcons(component,true);
        }
    },
    clearField : function(component, event, helper){
        helper.clearField(component,true);
        helper.toggleIcons(component,true);
    },

    selectValueChange : function(component, event, helper){
        var selectedValue = component.get("v.selectedValue");
        if(!selectedValue){
            component.clearField(component,true);
            // helper.toggleIcons(component,true);
        }
    },

    /**
	 * support for highlighting suggestions using the up and down arrow
	 * support for selecting highlighted record by pressing Enter
	 */
    // highlight : function(component, event, helper){
    //     var el = $('#lookup-65 ul li');
    //     var highlighted = $('#lookup-65 ul li.hlight');
    //     if(event.code == 'ArrowDown'){
    //         highlighted.removeClass('hlight').next().addClass('hlight');
    //         if(highlighted.next().length == 0){
    //             el.eq(0).addClass('hlight');
    //         }
    //     }
    //     else if(event.code == 'ArrowUp'){
    //         highlighted.removeClass('hlight').prev().addClass('hlight');
    //         if(highlighted.prev().length == 0){
    //             el.eq(-1).addClass('hlight')
    //         }
    //     }
    //         else if(event.code == 'Enter'){
    //             if($A.util.hasClass(component.find("dropDown"),'slds-is-open')){
    //                 highlighted.click();
    //             }
    //         }
    // },
    // hover : function(component, event, helper){
    //     $('#lookup-65 ul li').removeClass('hlight')
    // }
})
