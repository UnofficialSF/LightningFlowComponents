({
    doInit: function(component, event, helper) {
        // By Default set the Id field as this is required
        var tempFieldList = ['Id'];
        // Check to see if the user wants to watch any other fields
        if (component.get("v.fieldChange")) {
            tempFieldList.push(component.get("v.fieldChange"));

            // The field we compare will always be in the #2 spot. We can grab that value and store for later use
            component.set("v.fieldCompare", component.get("v.fieldChange"));
        }
        // Set the updated list which recordData uses
        component.set("v.fieldNameList", tempFieldList);
    },

    openModal : function(component, event, helper) {
		component.set('v.openModal',true);
	},
 
	closeModal : function(component, event, helper) {
		component.set('v.openModal',false);
	},
 


    flowStatusChange : function( component, event, helper ) {
        if ( event.getParam( "status" ).indexOf( "FINISHED" ) !== -1 ) {
            component.set( "v.openModal", false );
            
        }
    },
    
    recordUpdated: function(component, event, helper) {
        console.log('entering recordUpdate');
        var eventParams = event.getParams();

        // If both Field Change and Field Value are not null then set to isChangedRecord to true
        // This will then populate the users field value within the fields list
        if(component.get("v.fieldChange") != null && component.get("v.fieldValue") != null ){
            component.set("v.isChangedRecord", true);
            console.log('fieldChange',component.get("v.fieldChange"));
            console.log('fieldValue',component.get("v.fieldValue"));
            // Make sure there was an edited field and we just edited a record
            if ( eventParams.changedFields && eventParams.changeType === "CHANGED") {
                console.log('eventParams.changedFields', eventParams.changedFields);
                var changed = JSON.parse(JSON.stringify(eventParams.changedFields));
                var fieldKey = component.get("v.fieldCompare");
                var fieldData = changed[fieldKey];
                
                // Check if field exists and has a non-null value before calling toString()
                if (fieldData && fieldData.value != null) {
                    var newValue = fieldData.value.toString();
                    console.log('changed.dynamic.value', newValue);
                    if (newValue === component.get("v.fieldValue")) {
                        component.set("v.targetFlowName", component.get("v.editFlowName"));
                        helper.processChangeEvent(component, eventParams);
                    }
                }
            }
        } else {
            console.log('changeType: ' + eventParams.changeType);
            // Get Flow To Use
            if(eventParams.changeType === "CHANGED") {
                component.set("v.targetFlowName", component.get("v.editFlowName"));
            } else if(eventParams.changeType === "REMOVED") {
                component.set("v.targetFlowName", component.get("v.deleteFlowName"));
            } else if(eventParams.changeType === "LOADED") {
                component.set("v.targetFlowName", component.get("v.loadFlowName"));
            }


            // Launch Flow
            if(eventParams.changeType === "CHANGED" || eventParams.changeType === "REMOVED") {
                helper.processChangeEvent(component, eventParams);
            } else if( eventParams.changeType === "LOADED")  {
                helper.processChangeEvent(component, eventParams);
            } else if(eventParams.changeType === "ERROR") {
                console.log(eventParams);
                console.log('Update event received Error: ' + component.get("v.error"));
            }
        }
    }
            
})
