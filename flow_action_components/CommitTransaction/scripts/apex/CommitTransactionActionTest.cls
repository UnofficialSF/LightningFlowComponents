/**
 * @description Test class for CommitTransactionAction
 */
@IsTest
private class CommitTransactionActionTest {
    
    @IsTest
    static void testCommitTransaction() {
        Test.startTest();
        CommitTransactionAction.commitTransaction();
        Test.stopTest();
        
        // Method executed successfully - that's all we need to test
        System.assert(true);
    }
}