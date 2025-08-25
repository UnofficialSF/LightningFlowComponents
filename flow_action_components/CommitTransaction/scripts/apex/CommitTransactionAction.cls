public with sharing class CommitTransactionAction {
       @InvocableMethod(
        label='Simple Commit Transaction' 
        description='Commits pending DML - LWR compatible'
        category='Database'
    )
    public static void commitTransaction() {
        // Literally do nothing - just being invoked commits the transaction
        System.debug('Simple commit transaction invoked');
    }
}