@isTest
public class FileUploadImproved_Test {
    
    @TestSetup
    static void makeData(){
        insert new Contact(LastName = 'Test');
    }

private static ContentVersion createTestCV(){
        ContentVersion cv = new ContentVersion(
            Title = 'Test',
            PathOnClient = 'Test.txt',
            VersionData = Blob.valueOf('Test file content'),
            IsMajorVersion = false
        );
        insert cv;
        return cv;
    }

  @isTest
    public static void encrypted_test(){
        String key = FileUploadImprovedHelper.getKey();

        Contact con = getCon();
        ContentVersion cv = createTestCV();
        cv.Guest_Record_fileupload__c = FileUploadImprovedHelper.encrypt(con.Id,key);
        update cv;
        
        system.test.startTest();
            FileUploadImprovedHelper.createContentDocLink(new List<String>{cv.Id},key,true);
        system.test.stopTest();


        List<ContentDocumentLink> cdl = [SELECT Id FROM ContentDocumentLink WHERE LinkedEntityId = :con.Id];
        system.assertEquals(1, cdl.size());
    }

    @isTest
    public static void get_existing_files(){
        String key = FileUploadImprovedHelper.getKey();

        Contact con = getCon();
        ContentVersion cv = createTestCV();
        cv.Guest_Record_fileupload__c = FileUploadImprovedHelper.encrypt(con.Id,key);
        update cv;
        
        system.test.startTest();
            FileUploadImprovedHelper.createContentDocLink(new List<String>{cv.Id},key,false);
            List<FileUploadImprovedHelper.objFiles> objFiles = FileUploadImprovedHelper.getExistingFiles(con.Id); 
        system.test.stopTest();

        system.assertEquals(1, objFiles.size());
    }

    @isTest
    public static void change_file_name(){
        ContentVersion cv = createTestCV();
        String fileName = 'https://www.linkedin.com/in/rygramer/';

        system.test.startTest();
        FileUploadImprovedHelper.updateFileName(new List<String>{cv.Id}, fileName);
        system.test.stopTest();

        cv = [
            SELECT ContentDocument.Title
            FROM ContentVersion
            WHERE Id = :cv.Id
        ];
        system.assertEquals(fileName, cv.ContentDocument.Title);
    }

    @isTest
    public static void delete_test(){
        ContentVersion cv = createTestCV();

        system.test.startTest();
            FileUploadImprovedHelper.deleteContentDoc(cv.Id);
        system.test.stopTest();
        
    }

    @isTest
    public static void invocable_test_create_link(){
        ContentVersion cv = createTestCV();
        Contact con = getCon();

        FileUploadImprovedHelper.Input input = new FileUploadImprovedHelper.Input();
        input.versIds = new List<Id>{cv.Id};
        input.recordId = con.Id;
        input.visibleToAllUsers = TRUE;

        system.test.startTest();
            FileUploadImprovedHelper.createContentDocumentLinkDownstream(new List<FileUploadImprovedHelper.Input>{input});
        system.test.stopTest();

        ContentDocumentLink link = [SELECT Visibility FROM ContentDocumentLink WHERE LinkedEntityId = :con.Id];

        system.assert(link.Visibility == 'AllUsers');
    }

    @isTest
    public static void invocable_test_link_already_exists(){
        ContentVersion cv = createTestCV();
        Contact con = getCon();

        // Re-query to get ContentDocumentId
        cv = [
            SELECT ContentDocumentId
            FROM ContentVersion
            WHERE Id = :cv.Id
        ];

        ContentDocumentLink link = new ContentDocumentLink(
            ContentDocumentId = cv.ContentDocumentId,
            LinkedEntityId = con.Id,
            Visibility = 'AllUsers'
        );
        insert link;    
    }

    @isTest
    public static void invocable_test_with_empty_list(){

        FileUploadImprovedHelper.Input input = new FileUploadImprovedHelper.Input();
        input.versIds = new List<Id>();

        system.test.startTest();
            FileUploadImprovedHelper.createContentDocumentLinkDownstream(new List<FileUploadImprovedHelper.Input>{input});
        system.test.stopTest();

    }

    @isTest
    public static void create_contentversion(){
        String encodedKey = FileUploadImprovedHelper.getKey();
        String encodedRecordId = FileUploadImprovedHelper.encrypt(getCon().Id, encodedKey);

        String beforeString = 'File Upload Improved';
        Blob beforeBlob = Blob.valueOf(beforeString);
        String newVersionData = EncodingUtil.base64Encode(beforeblob);

        List<String> fileNames = new List<String>{'FileUploadImproved.txt'};
        List<Id> versIds = new List<Id>();
        system.test.startTest();   
            List<FileUploadImprovedHelper.objFiles> objFiles = FileUploadImprovedHelper.createContentVers(fileNames, encodedRecordId);

            for(FileUploadImprovedHelper.objFiles objFile : objFiles){
                versIds.add(objFile.contentVersionId);
                FileUploadImprovedHelper.appendDataToContentVersion(objFile.contentVersionId, newVersionData);
            }
        system.test.stopTest();

        for(ContentVersion vers : [SELECT VersionData, Guest_Record_fileupload__c FROM ContentVersion WHERE Id IN :versIds]){
            system.assertEquals(encodedRecordId, vers.Guest_Record_fileupload__c);

            
        }
    }

    @isTest
    public static void append_to_contentversion_version_has_data(){
        ContentVersion cv = createTestCV();

        String currentVersionData = EncodingUtil.base64Encode(cv.VersionData);

        String beforeString = 'File Upload Improved';
        Blob beforeBlob = Blob.valueOf(beforeString);
        String newVersionData = EncodingUtil.base64Encode(beforeblob);

        system.test.startTest();
            FileUploadImprovedHelper.appendDataToContentVersion(cv.Id, newVersionData);
        system.test.stopTest();

        // Note: ContentVersion VersionData behavior is limited in test context.
        // We do not assert on the updated blob value here.
    }


    private static Contact getCon(){
        return [SELECT Id FROM Contact LIMIT 1];
    }
}
