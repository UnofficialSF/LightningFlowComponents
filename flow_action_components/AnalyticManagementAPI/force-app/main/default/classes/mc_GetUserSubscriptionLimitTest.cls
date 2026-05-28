/**
 * Test class for mc_GetUserSubscriptionLimit
 * 
 * Provides test coverage for the Get User Subscription Limit invocable action.
 * Tests subscription limit retrieval with mock HTTP callouts.
 * 
 * @author Andy Haas
 */
@isTest
public with sharing class mc_GetUserSubscriptionLimitTest {
    /**
     * Test method for mc_GetUserSubscriptionLimitList
     * 
     * Tests the subscription limit retrieval with mock HTTP callout.
     * Verifies that the method processes requests and returns results.
     */
    @isTest
    public static void mc_GetUserSubscriptionLimitTest() {
        // Set mock callout class 
        Test.setMock(HttpCalloutMock.class, new MockHttpResponse());
        
        // Create Request
        mc_GetUserSubscriptionLimit.Request request = new mc_GetUserSubscriptionLimit.Request();
        List<mc_GetUserSubscriptionLimit.Request> requests = new List<mc_GetUserSubscriptionLimit.Request>();

        // Set request parameters
        request.source = 'lightningReportSubscribe';
        request.recordId = '';

        // Add request to list
        requests.add(request);

        // Call method to test
        Test.startTest();
        List<mc_GetUserSubscriptionLimit.Results> res = mc_GetUserSubscriptionLimit.mc_GetUserSubscriptionLimitList(requests);
        Test.stopTest();
        
        // Verify response received contains fake values
        System.assertNotEquals(null, res, 'Response should not be null');
        System.assertEquals(1, res.size(), 'Should return one result');
        System.assertNotEquals(null, res[0].definition, 'Definition should not be null');
    }
    
    /**
     * Test method with recordId parameter
     */
    @isTest
    public static void mc_GetUserSubscriptionLimitTestWithRecordId() {
        // Set mock callout class 
        Test.setMock(HttpCalloutMock.class, new MockHttpResponse());
        
        // Create Request
        mc_GetUserSubscriptionLimit.Request request = new mc_GetUserSubscriptionLimit.Request();
        List<mc_GetUserSubscriptionLimit.Request> requests = new List<mc_GetUserSubscriptionLimit.Request>();

        // Set request parameters
        request.source = 'lightningReportSubscribe';
        request.recordId = '00O5e000008VZezEAG';

        // Add request to list
        requests.add(request);

        // Call method to test
        Test.startTest();
        List<mc_GetUserSubscriptionLimit.Results> res = mc_GetUserSubscriptionLimit.mc_GetUserSubscriptionLimitList(requests);
        Test.stopTest();
        
        // Verify response
        System.assertNotEquals(null, res, 'Response should not be null');
        System.assertEquals(1, res.size(), 'Should return one result');
    }
    
    /**
     * Test error handling for non-200 HTTP response
     */
    @isTest
    public static void mc_GetUserSubscriptionLimitTestErrorResponse() {
        // Set mock callout class with error response
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseError());
        
        // Create Request
        mc_GetUserSubscriptionLimit.Request request = new mc_GetUserSubscriptionLimit.Request();
        List<mc_GetUserSubscriptionLimit.Request> requests = new List<mc_GetUserSubscriptionLimit.Request>();

        request.source = 'lightningReportSubscribe';
        request.recordId = '';

        requests.add(request);

        // Call method to test
        Test.startTest();
        List<mc_GetUserSubscriptionLimit.Results> res = mc_GetUserSubscriptionLimit.mc_GetUserSubscriptionLimitList(requests);
        Test.stopTest();
        
        // Verify error handling - should return empty list or continue gracefully
        System.assertNotEquals(null, res, 'Response should not be null');
    }
    
    /**
     * Test error handling for empty response body
     */
    @isTest
    public static void mc_GetUserSubscriptionLimitTestEmptyResponse() {
        // Set mock callout class with empty response
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseEmpty());
        
        // Create Request
        mc_GetUserSubscriptionLimit.Request request = new mc_GetUserSubscriptionLimit.Request();
        List<mc_GetUserSubscriptionLimit.Request> requests = new List<mc_GetUserSubscriptionLimit.Request>();

        request.source = 'lightningReportSubscribe';
        request.recordId = '';

        requests.add(request);

        // Call method to test
        Test.startTest();
        List<mc_GetUserSubscriptionLimit.Results> res = mc_GetUserSubscriptionLimit.mc_GetUserSubscriptionLimitList(requests);
        Test.stopTest();
        
        // Verify error handling
        System.assertNotEquals(null, res, 'Response should not be null');
    }
    
    /**
     * Test error handling for invalid JSON
     */
    @isTest
    public static void mc_GetUserSubscriptionLimitTestInvalidJSON() {
        // Set mock callout class with invalid JSON
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseInvalidJSON());
        
        // Create Request
        mc_GetUserSubscriptionLimit.Request request = new mc_GetUserSubscriptionLimit.Request();
        List<mc_GetUserSubscriptionLimit.Request> requests = new List<mc_GetUserSubscriptionLimit.Request>();

        request.source = 'lightningReportSubscribe';
        request.recordId = '';

        requests.add(request);

        // Call method to test
        Test.startTest();
        List<mc_GetUserSubscriptionLimit.Results> res = mc_GetUserSubscriptionLimit.mc_GetUserSubscriptionLimitList(requests);
        Test.stopTest();
        
        // Verify error handling
        System.assertNotEquals(null, res, 'Response should not be null');
    }
    
    /**
     * Mock HTTP Callout class for successful responses
     */
    public class MockHttpResponse implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setHeader('Content-Type', 'application/json');
            res.setBody('{"userLimit":{"max":10,"remaining":5}}');
            res.setStatusCode(200);
            return res;
        }
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
}

