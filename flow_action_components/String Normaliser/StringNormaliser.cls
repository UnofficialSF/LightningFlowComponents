/*
 * Created by: Jose De Oliveira
 * 
 * Description: 
 * This utility class is intented to help names comparison by returning a normalized version of the name (ASCII),
 * from the accented original version (diacritical), eg. Mélanie, François, José, Iñaki​, João, João, etc.
 * This method returns lower case to reduce the size of the Map, so another method allows normalising with Proper case
 * where the first letter of every word is capitalized.
 * 
 * It also offers other utility methods such as removing white spaces and special characters to return alphanumeric only.
 * 
 * It can be used in Custom fields (eg. FirstNameASCII__c, LastNameASCII__c) that matching rules can read when performing duplicate detection.
 * It can also be used in flows from an Apex Action to perform the comparison during runtime. 
 * (Custom fields are recomended to avoid adding processing time.
 * Those fields can be populated by a Before-Save flow when names are edited - or a record is created)
*/

public without sharing class StringNormaliser {

        // Replaces Diacritical characters with their ASCII version
        public static String removeDiacritics(String originalString) {
    
            if (!String.isBlank(originalString)) {

                // To do: Move Map to Custom Metadata Types to allow declarative changes
                final Map<String, String> diacriticalASCII_MAP = new Map<String, String>{
                    'à' => 'a', 'á' => 'a', 'â' => 'a', 'ã' => 'a', 'ä' => 'a', 'å' => 'a', 'ą' => 'a',
                    'ç' => 'c', 'ć' => 'c', 'č' => 'c', 
                    'è' => 'e', 'é' => 'e', 'ê' => 'e', 'ë' => 'e', 'ę' => 'e', 'ð' => 'e',
                    'ì' => 'i', 'í' => 'i', 'î' => 'i', 'ï' => 'i',
                    'ñ' => 'n', 'ń' => 'n',
                    'ò' => 'o', 'ó' => 'o', 'ô' => 'o', 'õ' => 'o', 'ö' => 'o', 'ø' => 'o',
                    'ś' => 's', 'š' => 's',
                    'ù' => 'u', 'ú' => 'u', 'û' => 'u', 'ü' => 'u',
                    'ý' => 'y', 'ÿ' => 'y',
                    'ź' => 'z', 'ż' => 'z', 'ž' => 'z'
                };
        
                // Convert to lower case to minimise the size of the Map by avoiding Capital letters
                String convertedString = originalString.toLowerCase();

                //To do: Iterate thru String rather than the Map Key Set
                for (String diacritical : diacriticalASCII_MAP.keySet()) {
                    convertedString = convertedString.replace(diacritical, diacriticalASCII_MAP.get(diacritical));
                }

                return convertedString; 

            } else {
                return null;
            }
        }

        public static String convertToProperCase(String originalString) {
            if (!String.isBlank(originalString)) {
        
                List<String> orgWordsCollection = originalString.toLowerCase().split(' ');
                List<String> propWordsCollection = new List<String>();

                for (String w :orgWordsCollection) {
                    if (w.length() > 0) {
                        String properWord = w.substring(0, 1).toUpperCase() + w.substring(1);
                        propWordsCollection.add(properWord);
                    }
                }

                return String.join(propWordsCollection, ' ');

            } else {
                return null;
            }
        }

        public static String removeSpecialCharacters(String originalString) {
            if (!String.isBlank(originalString)) {
                return originalString.replaceAll('[^a-z0-9]', ''); 
            } else {
                return null;
            }
        }

        public static String replaceSpecialCharactersForSpace(String originalString) {
            if (!String.isBlank(originalString)) {
                return originalString.replaceAll('[^a-z0-9]', ' ').trim();
            } else {
                return null;
            }
        }

        public static String removeAllWhiteSpaces(String originalString) {
            if (!String.isBlank(originalString)) {
                return originalString.replaceAll('\\s+', '');
            } else {
                return null;
            }
        }
    
}