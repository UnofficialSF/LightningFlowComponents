public without sharing class StringNormaliserInvocableAction {

    public class RequestWrapper { 
        @InvocableVariable(label='String 1' description='eg. First Name' required=false)
        public String requestString1;

        @InvocableVariable(label='String 2' description='eg. Last Name' required=true)
        public String requestString2;

        @InvocableVariable(label='Apply Proper Case' description='Capitalizes the first letter of every word' required=false)
        public Boolean doProperCase = false;

        @InvocableVariable(label='Remove special characters' description='Removes any non-alphanumeric character' required=false)
        public Boolean doAlphanumeric = false;

        @InvocableVariable(label='Replace special characters for a space' description='Replaces special characters for a space' required=false)
        public Boolean doAlphanumericWithSpace = false;

        @InvocableVariable(label='Remove spaces' description='Removes all white or empty spaces giving a consecutive string' required=false)
        public Boolean doNoSpaces = false;

    }

    public class ResultWrapper { 
        @InvocableVariable
        public String resultString1;

        @InvocableVariable
        public String resultString2;
    }

    @InvocableMethod(label='String Normaliser' description='Replaces Diacritical characters (eg. accented names) with their ASCII version, removes special characters, and replaces whitespace. All in lowercase.' category='Utilities')
    public static List<ResultWrapper> normaliseText(List<RequestWrapper> reqCollection) {
        
        List<ResultWrapper> resultList = new List<ResultWrapper>();

        // Iterate through each CleanNameRequestWrapper in the input list
        for (RequestWrapper r : reqCollection) {

            ResultWrapper result = new ResultWrapper();
            
            String convertedString1 = StringNormaliser.removeDiacritics(r.requestString1);
            String convertedString2 = StringNormaliser.removeDiacritics(r.requestString2);

            if(r.doAlphanumericWithSpace) {
                convertedString1 = StringNormaliser.replaceSpecialCharactersForSpace(convertedString1);
                convertedString2 = StringNormaliser.replaceSpecialCharactersForSpace(convertedString2);
            }
            if(r.doAlphanumeric) {
                convertedString1 = StringNormaliser.removeSpecialCharacters(convertedString1);
                convertedString2 = StringNormaliser.removeSpecialCharacters(convertedString2);
            }
            if(r.doProperCase) {
                convertedString1 = StringNormaliser.convertToProperCase(convertedString1);
                convertedString2 = StringNormaliser.convertToProperCase(convertedString2);
            }
            if(r.doNoSpaces) {
                convertedString1 = StringNormaliser.removeAllWhiteSpaces(convertedString1);
                convertedString2 = StringNormaliser.removeAllWhiteSpaces(convertedString2);
            }

            result.resultString1 = convertedString1;
            result.resultString2 = convertedString2;
            resultList.add(result);
        }
        return resultList;
    }
}