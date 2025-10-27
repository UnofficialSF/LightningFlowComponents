global with sharing class GetRecordTypeInfobyObject {
    //given a target object name, return a collection of strings representing the available record types
    //great for extracting the Names and IDs of record types available for selection
    // source: https://github.com/alexed1/LightningFlowComponents/blob/master/flow_screen_components/quickChoiceFSCproject/force-app/main/default/classes/GetRecordTypeInfobyObject.cls
    // adapted by Tamar Erlich, added a toggle to ignore the master record type and to return the default record type.
    
    
        @InvocableMethod
        global static List <Results> get(List<Requests> requestList) {
            Results response = new Results();
            List<Results> responseWrapper = new List<Results>();
            for (Requests curRequest : requestList) {

                String objectName = curRequest.objectName;
                Boolean onlyReturnActiveRecordTypes = curRequest.onlyReturnActiveRecordTypes;
                Boolean onlyReturnRecordTypesAvailableToCurrentUser = curRequest.onlyReturnRecordTypesAvailableToCurrentUser;
                Boolean ignoreMasterRecordType = curRequest.ignoreMasterRecordType;
                List<String> recordTypeNames = new List<String>();
                List<String> recordTypeIds = new List<String>();
                String errors;
                String defaultId;
                String defaultName;
                // Send the email you have created.
                try {
                    
                    Map<String, Schema.RecordTypeInfo> recTypeInfoMap = Schema.getGlobalDescribe().get(objectName).getDescribe().getRecordTypegetRecordTypeInfosByDeveloperName();
                    List<Schema.RecordTypeInfo> recTypeInfoList = recTypeInfoMap.values();
                    
                    //extract the names and recordIds and return them as List<String> 
                    for(Schema.RecordTypeInfo curRecord : recTypeInfoList) {
                        System.debug('processing record: ' + curRecord);
                        Boolean filteredOut = false;
                        //if only active 
                        if (onlyReturnActiveRecordTypes == true && ! curRecord.isActive()) {
                                filteredOut = true;    
                        }
                        if (onlyReturnRecordTypesAvailableToCurrentUser == true && ! curRecord.isAvailable()) {
                                filteredOut = true;    
                        }
                        if (ignoreMasterRecordType == true && curRecord.isMaster()) {
                                filteredOut = true;    
                        }
                        if ( filteredOut != true) {
                            recordTypeNames.add(curRecord.getName());
                            recordTypeIds.add(curRecord.getRecordTypeId());
                        }
                        if (curRecord.isDefaultRecordTypeMapping()){
                            defaultId = curRecord.getRecordTypeId();
                            defaultName = curRecord.getName();
                        }
                       
                    }
        
                } catch (InvocableActionException e){
                    System.debug ('exception occured: ' + e.getMessage());
                    
                    errors = e.getMessage();
                } 
                response.recordTypeNames = recordTypeNames;
                response.recordTypeIds = recordTypeIds;
                response.defaultRecordTypeId = defaultId;
                response.defaultRecordTypeName = defaultName;                
                response.errors = errors;
              
                responseWrapper.add(response);
            }
    
    
            return responseWrapper;
    
    
        }
        global class Requests {
    
            @InvocableVariable(label='Object Name' required=true)
            global String objectName;
    
            @InvocableVariable
            global Boolean onlyReturnActiveRecordTypes;
    
            @InvocableVariable
            global Boolean onlyReturnRecordTypesAvailableToCurrentUser;
    
            @InvocableVariable
            global Boolean ignoreMasterRecordType;
    
        }
    
        global class Results {
    
            @InvocableVariable
            global String errors;
    
            @InvocableVariable
            global List<String> recordTypeNames;
    
            @InvocableVariable
            global List<String> recordTypeIds;

            @InvocableVariable
            global String defaultRecordTypeId;

            @InvocableVariable
            global String defaultRecordTypeName;
        }
    
        global class InvocableActionException extends Exception {}
    
    }