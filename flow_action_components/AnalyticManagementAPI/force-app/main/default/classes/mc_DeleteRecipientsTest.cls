/**
 * Test class for mc_DeleteRecipients
 * 
 * Provides test coverage for the Delete Selected Recipients invocable action.
 * Tests both scenarios: deleting all recipients (which deletes the notification)
 * and deleting some recipients (which updates the notification).
 * 
 * @author Andy Haas
 */
@isTest
public class mc_DeleteRecipientsTest {
	/**
	 * Test method for mc_DeleteRecipients
	 * 
	 * Tests the recipient deletion functionality with mock HTTP callouts.
	 * Verifies that the method processes requests correctly for both
	 * full deletion and partial deletion scenarios.
	 */
	@isTest
    private static void mc_DeleteRecipients_test(){
        Test.setMock(HttpCalloutMock.class, new MockHttpResponse());
        
        // Test 1: Full deletion scenario (all recipients deleted)
        List<mc_DeleteRecipients.Request> fullDeleteRequests = new List<mc_DeleteRecipients.Request>();
        mc_DeleteRecipients.Request fullDeleteReq = new mc_DeleteRecipients.Request();
        fullDeleteReq.notificationId = '0Au3C00000000kdSAA';
        
        // Create recipients list
        List<mc_SubscriptionListDefinition_Recipients> recipients = new List<mc_SubscriptionListDefinition_Recipients>();
        mc_SubscriptionListDefinition_Recipients recip1 = new mc_SubscriptionListDefinition_Recipients();
        recip1.id = '0055e000001mKpC';
        recip1.displayName = 'Test User 1';
        recip1.type = 'user';
        recipients.add(recip1);
        
        mc_SubscriptionListDefinition_Recipients recip2 = new mc_SubscriptionListDefinition_Recipients();
        recip2.id = '0055e000001mKpD';
        recip2.displayName = 'Test User 2';
        recip2.type = 'user';
        recipients.add(recip2);
        
        fullDeleteReq.recipients = recipients;
        fullDeleteReq.definition = createTestDefinition();
        fullDeleteReq.deletedRecipients = JSON.serialize(recipients); // Delete all
        fullDeleteRequests.add(fullDeleteReq);
        
        Test.startTest();
        List<mc_DeleteRecipients.Results> fullDeleteResults = mc_DeleteRecipients.mc_DeleteRecipients(fullDeleteRequests);
        Test.stopTest();
        
        System.assertNotEquals(null, fullDeleteResults, 'Full delete results should not be null');
        System.assertEquals(1, fullDeleteResults.size(), 'Should return one result');
    }
    
    /**
     * Test partial deletion scenario (some recipients deleted)
     */
    @isTest
    private static void mc_DeleteRecipients_testPartialDeletion(){
        Test.setMock(HttpCalloutMock.class, new MockHttpResponse());
        
        List<mc_DeleteRecipients.Request> requests = new List<mc_DeleteRecipients.Request>();
        mc_DeleteRecipients.Request req = new mc_DeleteRecipients.Request();
        req.notificationId = '0Au3C00000000kdSAA';
        
        // Create recipients list with 3 recipients
        List<mc_SubscriptionListDefinition_Recipients> allRecipients = new List<mc_SubscriptionListDefinition_Recipients>();
        for (Integer i = 0; i < 3; i++) {
            mc_SubscriptionListDefinition_Recipients recip = new mc_SubscriptionListDefinition_Recipients();
            recip.id = '0055e000001mKp' + String.valueOf(i);
            recip.displayName = 'Test User ' + i;
            recip.type = 'user';
            allRecipients.add(recip);
        }
        
        req.recipients = allRecipients;
        req.definition = createTestDefinition();
        
        // Delete only first recipient
        List<mc_SubscriptionListDefinition_Recipients> recipientsToDelete = new List<mc_SubscriptionListDefinition_Recipients>();
        recipientsToDelete.add(allRecipients[0]);
        req.deletedRecipients = JSON.serialize(recipientsToDelete);
        
        requests.add(req);
        
        Test.startTest();
        List<mc_DeleteRecipients.Results> results = mc_DeleteRecipients.mc_DeleteRecipients(requests);
        Test.stopTest();
        
        System.assertNotEquals(null, results, 'Results should not be null');
        System.assertEquals(1, results.size(), 'Should return one result');
    }
    
    /**
     * Test validation errors - blank notificationId
     */
    @isTest
    private static void mc_DeleteRecipients_testValidationErrors(){
        List<mc_DeleteRecipients.Request> requests = new List<mc_DeleteRecipients.Request>();
        mc_DeleteRecipients.Request req = new mc_DeleteRecipients.Request();
        req.notificationId = ''; // Blank notificationId
        req.recipients = new List<mc_SubscriptionListDefinition_Recipients>();
        req.definition = createTestDefinition();
        req.deletedRecipients = '[]';
        requests.add(req);
        
        Test.startTest();
        List<mc_DeleteRecipients.Results> results = mc_DeleteRecipients.mc_DeleteRecipients(requests);
        Test.stopTest();
        
        System.assertNotEquals(null, results, 'Results should not be null');
        System.assertEquals(1, results.size(), 'Should return one result');
        System.assertEquals(400, results[0].status_code, 'Should return 400 for validation error');
    }
    
    /**
     * Test validation errors - null recipients
     */
    @isTest
    private static void mc_DeleteRecipients_testNullRecipients(){
        List<mc_DeleteRecipients.Request> requests = new List<mc_DeleteRecipients.Request>();
        mc_DeleteRecipients.Request req = new mc_DeleteRecipients.Request();
        req.notificationId = '0Au3C00000000kdSAA';
        req.recipients = null; // Null recipients
        req.definition = createTestDefinition();
        req.deletedRecipients = '[]';
        requests.add(req);
        
        Test.startTest();
        List<mc_DeleteRecipients.Results> results = mc_DeleteRecipients.mc_DeleteRecipients(requests);
        Test.stopTest();
        
        System.assertNotEquals(null, results, 'Results should not be null');
        System.assertEquals(1, results.size(), 'Should return one result');
        System.assertEquals(400, results[0].status_code, 'Should return 400 for validation error');
    }
    
    /**
     * Test error handling - HTTP error response
     */
    @isTest
    private static void mc_DeleteRecipients_testHttpError(){
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseError());
        
        List<mc_DeleteRecipients.Request> requests = new List<mc_DeleteRecipients.Request>();
        mc_DeleteRecipients.Request req = new mc_DeleteRecipients.Request();
        req.notificationId = '0Au3C00000000kdSAA';
        
        List<mc_SubscriptionListDefinition_Recipients> recipients = new List<mc_SubscriptionListDefinition_Recipients>();
        mc_SubscriptionListDefinition_Recipients recip = new mc_SubscriptionListDefinition_Recipients();
        recip.id = '0055e000001mKpC';
        recipients.add(recip);
        
        req.recipients = recipients;
        req.definition = createTestDefinition();
        req.deletedRecipients = '[]'; // Partial deletion to trigger GET request
        requests.add(req);
        
        Test.startTest();
        List<mc_DeleteRecipients.Results> results = mc_DeleteRecipients.mc_DeleteRecipients(requests);
        Test.stopTest();
        
        System.assertNotEquals(null, results, 'Results should not be null');
    }
    
    /**
     * Test error handling - invalid JSON in deletedRecipients
     * Note: In test context, JSON deserialization is skipped, so this tests the null handling path
     */
    @isTest
    private static void mc_DeleteRecipients_testInvalidJSON(){
        Test.setMock(HttpCalloutMock.class, new MockHttpResponse());
        
        List<mc_DeleteRecipients.Request> requests = new List<mc_DeleteRecipients.Request>();
        mc_DeleteRecipients.Request req = new mc_DeleteRecipients.Request();
        req.notificationId = '0Au3C00000000kdSAA';
        
        List<mc_SubscriptionListDefinition_Recipients> recipients = new List<mc_SubscriptionListDefinition_Recipients>();
        mc_SubscriptionListDefinition_Recipients recip = new mc_SubscriptionListDefinition_Recipients();
        recip.id = '0055e000001mKpC';
        recipients.add(recip);
        
        req.recipients = recipients;
        req.definition = createTestDefinition();
        req.deletedRecipients = '{invalid json}'; // Invalid JSON - in test context this is handled as null
        requests.add(req);
        
        Test.startTest();
        List<mc_DeleteRecipients.Results> results = mc_DeleteRecipients.mc_DeleteRecipients(requests);
        Test.stopTest();
        
        System.assertNotEquals(null, results, 'Results should not be null');
        System.assertEquals(1, results.size(), 'Should return one result');
    }
    
    /**
     * Test scenario where all recipients are deleted (empty recipientsToKeep)
     */
    @isTest
    private static void mc_DeleteRecipients_testEmptyRecipientsToKeep(){
        Test.setMock(HttpCalloutMock.class, new MockHttpResponse());
        
        List<mc_DeleteRecipients.Request> requests = new List<mc_DeleteRecipients.Request>();
        mc_DeleteRecipients.Request req = new mc_DeleteRecipients.Request();
        req.notificationId = '0Au3C00000000kdSAA';
        
        // Create recipients list
        List<mc_SubscriptionListDefinition_Recipients> recipients = new List<mc_SubscriptionListDefinition_Recipients>();
        mc_SubscriptionListDefinition_Recipients recip = new mc_SubscriptionListDefinition_Recipients();
        recip.id = '0055e000001mKpC';
        recipients.add(recip);
        
        req.recipients = recipients;
        req.definition = createTestDefinition();
        // Delete all recipients by providing the same list
        req.deletedRecipients = JSON.serialize(recipients);
        requests.add(req);
        
        Test.startTest();
        List<mc_DeleteRecipients.Results> results = mc_DeleteRecipients.mc_DeleteRecipients(requests);
        Test.stopTest();
        
        System.assertNotEquals(null, results, 'Results should not be null');
        System.assertEquals(1, results.size(), 'Should return one result');
    }
    
    /**
     * Test scenario with empty response body from GET request
     */
    @isTest
    private static void mc_DeleteRecipients_testEmptyResponseBody(){
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseEmpty());
        
        List<mc_DeleteRecipients.Request> requests = new List<mc_DeleteRecipients.Request>();
        mc_DeleteRecipients.Request req = new mc_DeleteRecipients.Request();
        req.notificationId = '0Au3C00000000kdSAA';
        
        List<mc_SubscriptionListDefinition_Recipients> recipients = new List<mc_SubscriptionListDefinition_Recipients>();
        mc_SubscriptionListDefinition_Recipients recip = new mc_SubscriptionListDefinition_Recipients();
        recip.id = '0055e000001mKpC';
        recipients.add(recip);
        
        req.recipients = recipients;
        req.definition = createTestDefinition();
        req.deletedRecipients = '[]'; // Partial deletion to trigger GET request
        requests.add(req);
        
        Test.startTest();
        List<mc_DeleteRecipients.Results> results = mc_DeleteRecipients.mc_DeleteRecipients(requests);
        Test.stopTest();
        
        System.assertNotEquals(null, results, 'Results should not be null');
        System.assertEquals(1, results.size(), 'Should return one result');
    }
    
    /**
     * Test scenario with invalid JSON in GET response
     */
    @isTest
    private static void mc_DeleteRecipients_testInvalidJSONResponse(){
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseInvalidJSON());
        
        List<mc_DeleteRecipients.Request> requests = new List<mc_DeleteRecipients.Request>();
        mc_DeleteRecipients.Request req = new mc_DeleteRecipients.Request();
        req.notificationId = '0Au3C00000000kdSAA';
        
        List<mc_SubscriptionListDefinition_Recipients> recipients = new List<mc_SubscriptionListDefinition_Recipients>();
        mc_SubscriptionListDefinition_Recipients recip = new mc_SubscriptionListDefinition_Recipients();
        recip.id = '0055e000001mKpC';
        recipients.add(recip);
        
        req.recipients = recipients;
        req.definition = createTestDefinition();
        req.deletedRecipients = '[]'; // Partial deletion to trigger GET request
        requests.add(req);
        
        Test.startTest();
        List<mc_DeleteRecipients.Results> results = mc_DeleteRecipients.mc_DeleteRecipients(requests);
        Test.stopTest();
        
        System.assertNotEquals(null, results, 'Results should not be null');
        System.assertEquals(1, results.size(), 'Should return one result');
    }
    
    /**
     * Test scenario with invalid definition structure
     */
    @isTest
    private static void mc_DeleteRecipients_testInvalidDefinitionStructure(){
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseInvalidStructure());
        
        List<mc_DeleteRecipients.Request> requests = new List<mc_DeleteRecipients.Request>();
        mc_DeleteRecipients.Request req = new mc_DeleteRecipients.Request();
        req.notificationId = '0Au3C00000000kdSAA';
        
        List<mc_SubscriptionListDefinition_Recipients> recipients = new List<mc_SubscriptionListDefinition_Recipients>();
        mc_SubscriptionListDefinition_Recipients recip = new mc_SubscriptionListDefinition_Recipients();
        recip.id = '0055e000001mKpC';
        recipients.add(recip);
        
        req.recipients = recipients;
        req.definition = createTestDefinition();
        req.deletedRecipients = '[]'; // Partial deletion to trigger GET request
        requests.add(req);
        
        Test.startTest();
        List<mc_DeleteRecipients.Results> results = mc_DeleteRecipients.mc_DeleteRecipients(requests);
        Test.stopTest();
        
        System.assertNotEquals(null, results, 'Results should not be null');
        System.assertEquals(1, results.size(), 'Should return one result');
    }
    
    /**
     * Test scenario with empty recipients list (edge case for size check)
     */
    @isTest
    private static void mc_DeleteRecipients_testEmptyRecipientsList(){
        Test.setMock(HttpCalloutMock.class, new MockHttpResponse());
        
        List<mc_DeleteRecipients.Request> requests = new List<mc_DeleteRecipients.Request>();
        mc_DeleteRecipients.Request req = new mc_DeleteRecipients.Request();
        req.notificationId = '0Au3C00000000kdSAA';
        
        // Empty recipients list
        req.recipients = new List<mc_SubscriptionListDefinition_Recipients>();
        req.definition = createTestDefinition();
        req.deletedRecipients = '[]';
        requests.add(req);
        
        Test.startTest();
        List<mc_DeleteRecipients.Results> results = mc_DeleteRecipients.mc_DeleteRecipients(requests);
        Test.stopTest();
        
        System.assertNotEquals(null, results, 'Results should not be null');
        System.assertEquals(1, results.size(), 'Should return one result');
    }
    
    /**
     * Test scenario with recipients that have null IDs
     */
    @isTest
    private static void mc_DeleteRecipients_testRecipientsWithNullIds(){
        Test.setMock(HttpCalloutMock.class, new MockHttpResponse());
        
        List<mc_DeleteRecipients.Request> requests = new List<mc_DeleteRecipients.Request>();
        mc_DeleteRecipients.Request req = new mc_DeleteRecipients.Request();
        req.notificationId = '0Au3C00000000kdSAA';
        
        // Recipients with null IDs
        List<mc_SubscriptionListDefinition_Recipients> recipients = new List<mc_SubscriptionListDefinition_Recipients>();
        mc_SubscriptionListDefinition_Recipients recip1 = new mc_SubscriptionListDefinition_Recipients();
        recip1.id = null; // Null ID
        recip1.displayName = 'Test User';
        recipients.add(recip1);
        
        mc_SubscriptionListDefinition_Recipients recip2 = new mc_SubscriptionListDefinition_Recipients();
        recip2.id = '0055e000001mKpC';
        recipients.add(recip2);
        
        req.recipients = recipients;
        req.definition = createTestDefinition();
        req.deletedRecipients = '[]'; // No deletion, triggers partial update path
        requests.add(req);
        
        Test.startTest();
        List<mc_DeleteRecipients.Results> results = mc_DeleteRecipients.mc_DeleteRecipients(requests);
        Test.stopTest();
        
        System.assertNotEquals(null, results, 'Results should not be null');
        System.assertEquals(1, results.size(), 'Should return one result');
    }
    
    /**
     * Test scenario with PUT request returning non-200 response
     */
    @isTest
    private static void mc_DeleteRecipients_testPutRequestError(){
        Test.setMock(HttpCalloutMock.class, new MockHttpResponsePutError());
        
        List<mc_DeleteRecipients.Request> requests = new List<mc_DeleteRecipients.Request>();
        mc_DeleteRecipients.Request req = new mc_DeleteRecipients.Request();
        req.notificationId = '0Au3C00000000kdSAA';
        
        List<mc_SubscriptionListDefinition_Recipients> recipients = new List<mc_SubscriptionListDefinition_Recipients>();
        mc_SubscriptionListDefinition_Recipients recip = new mc_SubscriptionListDefinition_Recipients();
        recip.id = '0055e000001mKpC';
        recipients.add(recip);
        
        req.recipients = recipients;
        req.definition = createTestDefinition();
        req.deletedRecipients = '[]'; // Partial deletion to trigger PUT request
        requests.add(req);
        
        Test.startTest();
        List<mc_DeleteRecipients.Results> results = mc_DeleteRecipients.mc_DeleteRecipients(requests);
        Test.stopTest();
        
        System.assertNotEquals(null, results, 'Results should not be null');
        System.assertEquals(1, results.size(), 'Should return one result');
    }
    
    /**
     * Test scenario with null deletedRecipients (to cover null check path)
     */
    @isTest
    private static void mc_DeleteRecipients_testNullDeletedRecipients(){
        Test.setMock(HttpCalloutMock.class, new MockHttpResponse());
        
        List<mc_DeleteRecipients.Request> requests = new List<mc_DeleteRecipients.Request>();
        mc_DeleteRecipients.Request req = new mc_DeleteRecipients.Request();
        req.notificationId = '0Au3C00000000kdSAA';
        
        List<mc_SubscriptionListDefinition_Recipients> recipients = new List<mc_SubscriptionListDefinition_Recipients>();
        mc_SubscriptionListDefinition_Recipients recip = new mc_SubscriptionListDefinition_Recipients();
        recip.id = '0055e000001mKpC';
        recipients.add(recip);
        
        req.recipients = recipients;
        req.definition = createTestDefinition();
        req.deletedRecipients = null; // Null deletedRecipients
        requests.add(req);
        
        Test.startTest();
        List<mc_DeleteRecipients.Results> results = mc_DeleteRecipients.mc_DeleteRecipients(requests);
        Test.stopTest();
        
        System.assertNotEquals(null, results, 'Results should not be null');
        System.assertEquals(1, results.size(), 'Should return one result');
    }
    
    /**
     * Helper method to create test subscription definition
     */
    private static mc_SubscriptionListDefinition createTestDefinition() {
        mc_SubscriptionListDefinition def = new mc_SubscriptionListDefinition();
        def.id = '0Au3C00000000kdSAA';
        def.active = true;
        def.source = 'lightningReportSubscribe';
        def.recordId = '00O5e000008VZezEAG';
        return def;
    }
    /**
     * Mock HTTP Callout class for successful responses
     */
    public class MockHttpResponse implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse resp = new HttpResponse();
            resp.setStatusCode(200);
            resp.setStatus('OK');
            resp.setHeader('Content-Type', 'application/json');
            
            // Handle DELETE requests
            if (req.getMethod() == 'DELETE') {
                resp.setStatusCode(204);
                resp.setStatus('No Content');
                resp.setBody('');
                return resp;
            }
            
            // Handle GET requests - return full subscription definition
            String jsonBody = '{"active":true,"createdDate":"2022-10-12T01:10:52Z","deactivateOnTrigger":false,"id":"0Au3C00000000kdSAA","lastModifiedDate":"2022-10-12T01:10:52Z","name":"Notification","owner":{"id":"0055e000001mKpC","name":"Andy Haas"},"recordId":"00O5e000008VZezEAG","runAs":null,"schedule":{"details":{"daysOfWeek":["tue"],"timeOfDay":20},"frequency":"weekly"},"source":"lightningReportSubscribe","thresholds":[{"type":"always","conditions":null,"actions":[{"type":"sendEmail","configuration":{"excludeSnapshot":false,"recipients":[{"id":"0055e000001mKpC","displayName":"Andy Haas","type":"user"}]}}]}]}';
            resp.setBody(jsonBody);
            return resp;
        }
    }
    
    /**
     * Mock HTTP Callout class for error responses
     */
    public class MockHttpResponseError implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse resp = new HttpResponse();
            resp.setStatusCode(404);
            resp.setStatus('Not Found');
            resp.setHeader('Content-Type', 'application/json');
            resp.setBody('{"error":"Not found"}');
            return resp;
        }
    }
    
    /**
     * Mock HTTP Callout class for empty responses
     */
    public class MockHttpResponseEmpty implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse resp = new HttpResponse();
            if (req.getMethod() == 'GET') {
                resp.setStatusCode(200);
                resp.setBody(''); // Empty body
            } else {
                resp.setStatusCode(200);
                resp.setBody('{"active":true}');
            }
            resp.setHeader('Content-Type', 'application/json');
            return resp;
        }
    }
    
    /**
     * Mock HTTP Callout class for invalid JSON responses
     */
    public class MockHttpResponseInvalidJSON implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse resp = new HttpResponse();
            if (req.getMethod() == 'GET') {
                resp.setStatusCode(200);
                resp.setBody('{invalid json}');
            } else {
                resp.setStatusCode(200);
                resp.setBody('{"active":true}');
            }
            resp.setHeader('Content-Type', 'application/json');
            return resp;
        }
    }
    
    /**
     * Mock HTTP Callout class for invalid structure responses
     */
    public class MockHttpResponseInvalidStructure implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse resp = new HttpResponse();
            if (req.getMethod() == 'GET') {
                resp.setStatusCode(200);
                // Response without thresholds/actions structure
                resp.setBody('{"active":true,"id":"0Au3C00000000kdSAA","thresholds":null}');
            } else {
                resp.setStatusCode(200);
                resp.setBody('{"active":true}');
            }
            resp.setHeader('Content-Type', 'application/json');
            return resp;
        }
    }
    
    /**
     * Mock HTTP Callout class for PUT request error responses
     */
    public class MockHttpResponsePutError implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse resp = new HttpResponse();
            if (req.getMethod() == 'GET') {
                resp.setStatusCode(200);
                String jsonBody = '{"active":true,"createdDate":"2022-10-12T01:10:52Z","deactivateOnTrigger":false,"id":"0Au3C00000000kdSAA","lastModifiedDate":"2022-10-12T01:10:52Z","name":"Notification","owner":{"id":"0055e000001mKpC","name":"Andy Haas"},"recordId":"00O5e000008VZezEAG","runAs":null,"schedule":{"details":{"daysOfWeek":["tue"],"timeOfDay":20},"frequency":"weekly"},"source":"lightningReportSubscribe","thresholds":[{"type":"always","conditions":null,"actions":[{"type":"sendEmail","configuration":{"excludeSnapshot":false,"recipients":[{"id":"0055e000001mKpC","displayName":"Andy Haas","type":"user"}]}}]}]}';
                resp.setBody(jsonBody);
            } else if (req.getMethod() == 'PUT') {
                resp.setStatusCode(500); // Error response
                resp.setBody('{"error":"Internal Server Error"}');
            } else {
                resp.setStatusCode(200);
                resp.setBody('{"active":true}');
            }
            resp.setHeader('Content-Type', 'application/json');
            return resp;
        }
    }
}