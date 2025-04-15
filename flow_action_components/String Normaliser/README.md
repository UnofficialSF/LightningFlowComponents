# String Normaliser
String Normaliser is an utility class initially developed to replace accented characters on names (diacritical) into their ASCII equivalents. 
eg. Mélanie > Melanie, François > Francois, José > Jose, Iñaki > Inaki​, João > Joao, etc.
(all strings are returned in lower case to increase processing time by reducing the number of characters to iterate).

Additional methods have been added to extend its functionality such as:
- Removing special characters keeping alphanumeric only, eg. O'brian > Obrian
- Replacing special characters with empty spaces, eg. O'brian > O brian
- Returning using proper case (first letter capitalised), eg. joe doe > Joe Doe
- Removing all spaces

Specially useful during duplicate detection, eg when comparing Records in Matching Rules by populating Custom fields (eg. FirstNameASCII__c, LastNameASCII__c), 
or when searching existing Contacts/Leads in the Query element and avoid duplicates by creating a new record.

Custom fields can be populated by a Before-Save Flow or by an Apex Trigger when names are edited or a record is created.
And a Batch Job can be implemented to update all the existing records in the Org to populate the custom fields.
(The utility class is separated from the Invocable Action to allow using in Apex, although the Test Class includes both).

Current diacritics values can be expanded declarative by moving the Map to a Custom Metadata or Custom Settings.

Sandbox Installation: https://test.salesforce.com/packaging/installPackage.apexp?p0=04tJ7000000D8xn
Production Installation: https://login.salesforce.com/packaging/installPackage.apexp?p0=04tJ7000000D8xn

Written by: Jose De Oliveira
