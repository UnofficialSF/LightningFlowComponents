@isTest
public with sharing class GetNextFiveRecords_Test {


    @isTest
    public static void ValuesReturnedProperlyZero() {

        // make list of strings for the test methods
        List<Account> listOfRequests = new List<Account>();
        for (integer i = 0; i < 7; i++) {
            listOfRequests.add(new Account(name = 'This is my string ' + i));
        }

        List<GetNextFiveRecords.InputVals> requests = new List<GetNextFiveRecords.InputVals>();
        GetNextFiveRecords.InputVals request = new GetNextFiveRecords.InputVals();
        request.counter = 0;
        request.listOfRecs = listOfRequests;
        requests.add(request);

        Test.startTest();
        List<GetNextFiveRecords.OutputVals> responses = GetNextFiveRecords.getRecords(requests);
        Test.stopTest();

        // check outputs
        System.assertNotEquals(responses.size(), 0);
        if (responses.size() >0) {
            GetNextFiveRecords.OutputVals response = responses[0];
            System.assertEquals(response.totalNumRecs, 7);
            System.assertEquals(response.foundCount, 5);
            System.assertEquals(response.newCounter, 5);
            System.assertEquals(response.percent, 0/7);
            System.assertEquals(response.firstRec, listOfRequests[0]);
            System.assertEquals(response.secondRec, listOfRequests[1]);
            System.assertEquals(response.thirdRec, listOfRequests[2]);
            System.assertEquals(response.fourthRec, listOfRequests[3]);
            System.assertEquals(response.fifthRec, listOfRequests[4]);
        } 

    }

    @isTest
    public static void ValuesReturnedProperlyFour() {
        
        // make list of strings for the test methods
        List<Account> listOfRequests = new List<Account>();
        for (integer i = 0; i < 7; i++) {
            listOfRequests.add(new Account(name = 'This is my string ' + i));
        }
        
        List<GetNextFiveRecords.InputVals> requests = new List<GetNextFiveRecords.InputVals>();
        GetNextFiveRecords.InputVals request = new GetNextFiveRecords.InputVals();
        request.counter = 4;
        request.listOfRecs = listOfRequests;
        requests.add(request);

        Test.startTest();
        List<GetNextFiveRecords.OutputVals> responses = GetNextFiveRecords.getRecords(requests);
        Test.stopTest();

        // check outputs
        System.assertNotEquals(responses.size(), 0);
        if (responses.size() >0) {
            GetNextFiveRecords.OutputVals response = responses[0];
            System.assertEquals(response.totalNumRecs, 7);
            System.assertEquals(response.foundCount, 3);
            System.assertEquals(response.newCounter, 7);
            System.assertEquals(response.percent, 4/7);
            System.assertEquals(response.firstRec, listOfRequests[4]);
            System.assertEquals(response.secondRec, listOfRequests[5]);
            System.assertEquals(response.thirdRec, listOfRequests[6]);
            System.assertEquals(response.fourthRec, null);
            System.assertEquals(response.fifthRec, null);
        } 

    }

    @isTest
    public static void NoValuesReturned() {

        // make list of strings for the test methods
        List<Account> listOfRequests = new List<Account>();
        for (integer i = 0; i < 7; i++) {
            listOfRequests.add(new Account(name = 'This is my string ' + i));
        }
    
        List<GetNextFiveRecords.InputVals> requests = new List<GetNextFiveRecords.InputVals>();
        GetNextFiveRecords.InputVals request = new GetNextFiveRecords.InputVals();
        request.counter = 7;
        request.listOfRecs = listOfRequests;
        requests.add(request);

        Test.startTest();
        List<GetNextFiveRecords.OutputVals> responses = GetNextFiveRecords.getRecords(requests);
        Test.stopTest();

        // check outputs
        System.assertNotEquals(responses.size(), 0);
        if (responses.size() >0) {
            GetNextFiveRecords.OutputVals response = responses[0];
            System.assertEquals(response.totalNumRecs, 7);
            System.assertEquals(response.foundCount, 0);
            System.assertEquals(response.newCounter, 7);
            System.assertEquals(response.percent, 7/7);
            System.assertEquals(response.firstRec, null);
            System.assertEquals(response.secondRec, null);
            System.assertEquals(response.thirdRec, null);
            System.assertEquals(response.fourthRec, null);
            System.assertEquals(response.fifthRec, null);
        } 

    }

    @isTest
    public static void NoValuesGiven() {
            List<GetNextFiveRecords.InputVals> requests = new List<GetNextFiveRecords.InputVals>();

            Test.startTest();
            List<GetNextFiveRecords.OutputVals> responses = GetNextFiveRecords.getRecords(requests);
            Test.stopTest();

            // check outputs
            System.assertNotEquals(responses.size(), 0);
            if (responses.size() >0) {
                GetNextFiveRecords.OutputVals response = responses[0];
                System.assertEquals(response.totalNumRecs, -1);
                System.assertEquals(response.foundCount, -1);
                System.assertEquals(response.newCounter, -1);
                System.assertEquals(response.percent, -1);
                System.assertEquals(response.firstRec, null);
                System.assertEquals(response.secondRec, null);
                System.assertEquals(response.thirdRec, null);
                System.assertEquals(response.fourthRec, null);
                System.assertEquals(response.fifthRec, null);
            } 

    }
}
