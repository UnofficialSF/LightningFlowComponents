/** 
 *  Upsert Record by Key Test - Apex Tests
 * 
 *  Eric Smith - 11/26/24 - v1.0
 * 
 *  This will test both GetIndexFromKey.cls and UpsertRecordByKey.cls
 * 
**/ 

@isTest
public with sharing class UpsertRecordByKeyTest {

    @isTest
    static void upsertTest() {
        
        Account acct = new Account(Name='Test Account1', AccountNumber='1');
        insert acct;
        List<Account> accts = new List<Account>();
        accts.add(acct);
        acct = new Account(Name='Test Account2', AccountNumber='2');
        insert acct;
        Id acct2id = acct.Id;
        accts.add(acct);
        acct = new Account(Name='Test Account3', AccountNumber='3');
        insert acct;
        accts.add(acct);

        UpsertRecordByKey.Requests testUpsert = new UpsertRecordByKey.Requests();
        List<UpsertRecordByKey.Requests> testUpsertList = new List<UpsertRecordByKey.Requests>();

        // Test match with field API name provided
        Account upd_acct1 = new Account(Name='Test Account1', AccountNumber='11');
        testUpsert.inputCollection = accts;
        testUpsert.inputRecord = upd_acct1;
        testUpsert.fieldAPIName = 'Name';
        testUpsertList.add(testUpsert);
        List<UpsertRecordByKey.Results> testResultList = UpsertRecordByKey.upsertRecordByKey(testUpsertList);
        Assert.areEqual('Test Account1', testResultList[0].outputCollection[0].get('Name'));
        Assert.areEqual('11', testResultList[0].outputCollection[0].get('AccountNumber'));
        Assert.areEqual(3, testResultList[0].outputCollection.size());
        testUpsertList.clear();

        // Test match of Id field by default
        Account upd_acct2 = accts[1];
        upd_acct2.AccountNumber='22';
        testUpsert.inputCollection = accts;
        testUpsert.inputRecord = upd_acct2;
        testUpsert.fieldAPIName = '';
        testUpsertList.add(testUpsert);
        testResultList = UpsertRecordByKey.upsertRecordByKey(testUpsertList);
        Assert.areEqual(acct2Id, testResultList[0].outputCollection[1].Id);
        Assert.areEqual('Test Account2', testResultList[0].outputCollection[1].get('Name'));
        Assert.areEqual('22', testResultList[0].outputCollection[1].get('AccountNumber'));
        Assert.areEqual(3, testResultList[0].outputCollection.size());
        Assert.isFalse(testResultList[0].noMatchFound);
        testUpsertList.clear();

        // Test upsert last record in collection
        Account upd_acct3 = accts[2];
        upd_acct3.AccountNumber='33';
        testUpsert.inputCollection = accts;
        testUpsert.inputRecord = upd_acct3;
        testUpsert.fieldAPIName = 'Name';
        testUpsertList.add(testUpsert);
        testResultList = UpsertRecordByKey.upsertRecordByKey(testUpsertList);
        Assert.areEqual('Test Account3', testResultList[0].outputCollection[2].get('Name'));
        Assert.areEqual('33', testResultList[0].outputCollection[2].get('AccountNumber'));
        Assert.areEqual(3, testResultList[0].outputCollection.size());
        Assert.isFalse(testResultList[0].noMatchFound);
        testUpsertList.clear();

        // Test skip add new record when no match
        Account acct4 = new Account(Name='Test Account4', AccountNumber='4');
        insert acct4;
        testUpsert.inputCollection = accts;
        testUpsert.inputRecord = acct4;
        testUpsert.fieldAPIName = 'Name';
        testUpsert.skipInsertIfNoMatchFound = true;
        testUpsertList.add(testUpsert);
        testResultList = UpsertRecordByKey.upsertRecordByKey(testUpsertList);
        Assert.areEqual(3, testResultList[0].outputCollection.size());
        Assert.IsTrue(testResultList[0].noMatchFound);
        testUpsertList.clear();

        // Test add new record when no match        
        testUpsert.inputCollection = accts;
        testUpsert.inputRecord = acct4;
        testUpsert.fieldAPIName = 'Name';
        testUpsert.skipInsertIfNoMatchFound = false;
        testUpsertList.add(testUpsert);
        testResultList = UpsertRecordByKey.upsertRecordByKey(testUpsertList);
        Assert.areEqual(4, testResultList[0].outputCollection.size());
        Assert.IsTrue(testResultList[0].noMatchFound);
    }

}