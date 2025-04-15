global with sharing class FindRecordsInCollection {

    @InvocableMethod(label='Find Records in Collection [USF Collection Processor]' category='Util' iconName='resource:CollectionProcessorsSVG:colproc')
    global static List <Results> execute(List<Requests> requestList) {
        System.debug('entering FindRecordInCollection');
        List<Results> responseWrapper = new List<Results>();

        for (Requests curRequest : requestList) {
            List<SObject> inputCollection = curRequest.inputCollection;
            String targetField = curRequest.targetField;
            String targetValue = curRequest.targetValue;
            String targetObject = curRequest.targetObject;

            //Create a Results object to hold the return values
            Results response = new Results();


            //given a list of items, and a search string, find all of the matches
            //iterate through input collection
            //check the value of the current input  
            Schema.SobjectField curField = getFieldByName(targetObject, targetField);
            for (SObject curRecord : inputCollection) {
                String value = (String) curRecord.get(curField);
                if (value == targetValue) {
                    if (response.multipleOutputMembers == null) {
                        response.multipleOutputMembers = new List<SObject>();
                    }

                    response.multipleOutputMembers.add(curRecord);
                }
            }

            //because a lot of flow manipulations are easier if you're dealing with a single record
            //instead of a collection, we provide a single record return value if there's only one hit.
            if (response.multipleOutputMembers != null && response.multipleOutputMembers.size() == 1) {
                response.singleOutputMember = response.multipleOutputMembers[0];
            }

            //Wrap the Results object in a List container (an extra step added to allow this interface to also support bulkification)
        
            responseWrapper.add(response);
            System.debug('response is: ' + response);
            System.debug('responseWrapper is: ' + responseWrapper);
        }
        
        return responseWrapper;

    }

    //given the name of a field, return the actual field itself
    //ref https://salesforce.stackexchange.com/a/192792/24822
    global static Schema.SobjectField getFieldByName(String objectName, String fieldName) {

        // get the SObjectType
        Schema.SObjectType objectType;
        if(objectName == 'KnowledgeArticleVersion'){
            // KnowledgeArticleVersion is a special case, it needs to be handled differently
            objectType = KnowledgeArticleVersion.getSObjectType();
        }
        else{
            objectType = Schema.getGlobalDescribe().get(objectName);
        }

        // get the fields on the object
        Map<String, SObjectField> fieldMap = objectType.getDescribe().fields.getMap();

        // The key to the map is the api name of the field
        Schema.SobjectField theField = fieldMap.get(fieldName);

        return theField;
    }


    global class Requests {
        @InvocableVariable(required=true)
        global List<SObject> inputCollection;

        @InvocableVariable
        global String targetObject;

        @InvocableVariable
        global String targetField;

        @InvocableVariable
        global String targetValue;

    }

    global class Results {

        @InvocableVariable
        global SObject singleOutputMember;

        @InvocableVariable
        global List<SObject> multipleOutputMembers;
    }
}