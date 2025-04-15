@isTest
public with sharing class getAggregateSOQL_Test {

    @TestSetup
    static void makeData(){
        // make Account records to test
        List<Account> acctlist = new List<Account>();
        for (integer i = 0; i < 10; i++) {
            Account a = new Account(name='Test Account ' + Math.mod(i, 4));
            acctlist.add(a);
        }
        insert(acctlist);
    }

    @isTest
    public static void getAggregateSOQL_Test() {
        
        List<getAggregateSOQL.InputVals> requests = new List<getAggregateSOQL.InputVals>();
        getAggregateSOQL.InputVals request = new getAggregateSOQL.InputVals();
        request.query = 'select name, count(id) from Account group by name order by name';
        request.fieldname = 'name';
        requests.add(request);

        Test.startTest();
        List<List<String>> responses = getAggregateSOQL.getRecords(requests);
        Test.stopTest();

        System.assertNotEquals(responses.size(), 0);
        if (responses.size() >0) {
            List<String> response = responses[0];
            System.assertEquals(response.size(), 4);
            for (integer i = 0; i < response.size(); i++) {
                System.assertEquals(response[i], 'Test Account ' + i);
            }

        }


    }
}
