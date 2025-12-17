/**
 * Test class for mc_SubscriptionData
 * 
 * Provides test coverage for the Get Subscription Data invocable action.
 * Uses HttpCalloutMock to simulate API responses without making actual callouts.
 * 
 * @author Andy Haas
 */
@isTest
public with sharing class mc_SubscriptionDataTest {
    /**
     * Test method for mc_GetSubscriptionDataList
     * 
     * Tests the subscription data retrieval with mock HTTP callout.
     * Verifies that the method processes requests and returns results.
     */
    @isTest
    public static void mc_SubscriptionDataTest() {
        // Set mock callout class 
        Test.setMock(HttpCalloutMock.class, new SubscriptionData_MockHTTP());
        System.debug('Available reports: ' + [SELECT Id FROM Report].size());
        
        // Create Request
        mc_SubscriptionData.Request request = new mc_SubscriptionData.Request();
        List<mc_SubscriptionData.Request> requests = new List<mc_SubscriptionData.Request>();

        // Set request parameters
        request.source = 'lightningReportSubscribe';
        request.ownerId = '';
        request.recordId = '';

        // Add request to list
        requests.add(request);

        // Call method to test.
        // This causes a fake response to be sent
        // from the class that implements HttpCalloutMock. 
        Test.startTest();
        List<mc_SubscriptionData.Results> res = mc_SubscriptionData.mc_GetSubscriptionDataList(requests);
        Test.stopTest();
        
        // Verify response received contains fake values
        System.assertNotEquals(null, res, 'Response should not be null');
        System.assertEquals(1, res.size(), 'Should return one result');
        System.assertNotEquals(null, res[0].definition, 'Definition should not be null');
    }
}