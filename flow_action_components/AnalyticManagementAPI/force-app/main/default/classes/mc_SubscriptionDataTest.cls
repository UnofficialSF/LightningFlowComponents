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
     * Test method for mc_GetSubscriptionDataList - basic test
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
        Test.startTest();
        List<mc_SubscriptionData.Results> res = mc_SubscriptionData.mc_GetSubscriptionDataList(requests);
        Test.stopTest();
        
        // Verify response received contains fake values
        System.assertNotEquals(null, res, 'Response should not be null');
        System.assertEquals(1, res.size(), 'Should return one result');
        System.assertNotEquals(null, res[0].definition, 'Definition should not be null');
    }
    
    /**
     * Test with ownerId and recordId parameters
     */
    @isTest
    public static void mc_SubscriptionDataTestWithParameters() {
        Test.setMock(HttpCalloutMock.class, new SubscriptionData_MockHTTP());
        
        mc_SubscriptionData.Request request = new mc_SubscriptionData.Request();
        List<mc_SubscriptionData.Request> requests = new List<mc_SubscriptionData.Request>();

        request.source = 'lightningReportSubscribe';
        request.ownerId = '0055e000001mKpC';
        request.recordId = '00O5e000008VZezEAG';

        requests.add(request);

        Test.startTest();
        List<mc_SubscriptionData.Results> res = mc_SubscriptionData.mc_GetSubscriptionDataList(requests);
        Test.stopTest();
        
        System.assertNotEquals(null, res, 'Response should not be null');
        System.assertEquals(1, res.size(), 'Should return one result');
    }
    
    /**
     * Test error handling - HTTP error response
     */
    @isTest
    public static void mc_SubscriptionDataTestErrorResponse() {
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseError());
        
        mc_SubscriptionData.Request request = new mc_SubscriptionData.Request();
        List<mc_SubscriptionData.Request> requests = new List<mc_SubscriptionData.Request>();

        request.source = 'lightningReportSubscribe';
        request.ownerId = '';
        request.recordId = '';

        requests.add(request);

        Test.startTest();
        List<mc_SubscriptionData.Results> res = mc_SubscriptionData.mc_GetSubscriptionDataList(requests);
        Test.stopTest();
        
        // Should handle error gracefully and continue
        System.assertNotEquals(null, res, 'Response should not be null');
    }
    
    /**
     * Test error handling - empty response body
     */
    @isTest
    public static void mc_SubscriptionDataTestEmptyResponse() {
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseEmpty());
        
        mc_SubscriptionData.Request request = new mc_SubscriptionData.Request();
        List<mc_SubscriptionData.Request> requests = new List<mc_SubscriptionData.Request>();

        request.source = 'lightningReportSubscribe';
        request.ownerId = '';
        request.recordId = '';

        requests.add(request);

        Test.startTest();
        List<mc_SubscriptionData.Results> res = mc_SubscriptionData.mc_GetSubscriptionDataList(requests);
        Test.stopTest();
        
        System.assertNotEquals(null, res, 'Response should not be null');
    }
    
    /**
     * Test error handling - invalid JSON
     */
    @isTest
    public static void mc_SubscriptionDataTestInvalidJSON() {
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseInvalidJSON());
        
        mc_SubscriptionData.Request request = new mc_SubscriptionData.Request();
        List<mc_SubscriptionData.Request> requests = new List<mc_SubscriptionData.Request>();

        request.source = 'lightningReportSubscribe';
        request.ownerId = '';
        request.recordId = '';

        requests.add(request);

        Test.startTest();
        List<mc_SubscriptionData.Results> res = mc_SubscriptionData.mc_GetSubscriptionDataList(requests);
        Test.stopTest();
        
        System.assertNotEquals(null, res, 'Response should not be null');
    }
    
    /**
     * Test with subscription missing thresholds/actions
     */
    @isTest
    public static void mc_SubscriptionDataTestMissingStructure() {
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseMissingStructure());
        
        mc_SubscriptionData.Request request = new mc_SubscriptionData.Request();
        List<mc_SubscriptionData.Request> requests = new List<mc_SubscriptionData.Request>();

        request.source = 'lightningReportSubscribe';
        request.ownerId = '';
        request.recordId = '';

        requests.add(request);

        Test.startTest();
        List<mc_SubscriptionData.Results> res = mc_SubscriptionData.mc_GetSubscriptionDataList(requests);
        Test.stopTest();
        
        System.assertNotEquals(null, res, 'Response should not be null');
        System.assertEquals(1, res.size(), 'Should return one result');
    }
    
    /**
     * Mock HTTP Callout class for error responses
     */
    public class MockHttpResponseError implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setHeader('Content-Type', 'application/json');
            res.setBody('{"error":"Not found"}');
            res.setStatusCode(404);
            return res;
        }
    }
    
    /**
     * Mock HTTP Callout class for empty responses
     */
    public class MockHttpResponseEmpty implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setHeader('Content-Type', 'application/json');
            res.setBody('');
            res.setStatusCode(200);
            return res;
        }
    }
    
    /**
     * Mock HTTP Callout class for invalid JSON responses
     */
    public class MockHttpResponseInvalidJSON implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setHeader('Content-Type', 'application/json');
            res.setBody('{invalid json}');
            res.setStatusCode(200);
            return res;
        }
    }
    
    /**
     * Mock HTTP Callout class for missing structure responses
     */
    public class MockHttpResponseMissingStructure implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setHeader('Content-Type', 'application/json');
            // Response without thresholds
            res.setBody('[{"active":true,"id":"0Au3C00000000kdSAA","recordId":"00O5e000008VZezEAG","source":"lightningReportSubscribe","thresholds":null}]');
            res.setStatusCode(200);
            return res;
        }
    }
}