/**
 * Mock HTTP Callout class for testing mc_SubscriptionData
 * 
 * Implements HttpCalloutMock to provide mock responses for HTTP callouts
 * during test execution. This allows testing of the subscription data
 * retrieval without making actual API calls.
 * 
 * @author Andy Haas
 */
@isTest
global with sharing class SubscriptionData_MockHTTP implements HttpCalloutMock {
    // API version constant for REST API calls (matches main class)
    private static final String API_VERSION = 'v65.0';
    
    /**
     * Implement this interface method to provide mock HTTP responses
     * 
     * @param req HTTPRequest object from the callout
     * @return HTTPResponse Mock response with subscription data
     */
    global HTTPResponse respond(HTTPRequest req) {
        // Optionally, only send a mock response for a specific endpoint and method.
        String expectedEndpoint = 'https://salesforce.com/services/data/' + API_VERSION + '/analytics/notifications?source=lightningReportSubscribe';
        req.setEndpoint('https://salesforce.com/' + 
                        'services/data/' + API_VERSION + '/analytics/' + 
                        'notifications?source=lightningReportSubscribe');
        req.setMethod('GET');
        System.assertEquals(expectedEndpoint, req.getEndpoint(), 'Endpoint should match expected value');
        System.assertEquals('GET', req.getMethod(), 'HTTP method should be GET');
        
        // Create a fake response
        HttpResponse res = new HttpResponse();
        res.setHeader('Content-Type', 'application/json');
        res.setBody('[{"thresholds":[{"type":"always","conditions":null,"actions":[{"type":"sendEmail","configuration":{"recipients":[{"type":"user","id":"0055e000001mKpCAAU","displayName":"Andy Haas"}],"excludeSnapshot":false}}]}],"source":"lightningReportSubscribe","schedule":{"frequencyType":null,"frequency":"weekly","details":{"weekInMonth":null,"timeOfDay":18,"daysOfWeek":["tue","wed"],"daysOfMonth":null}},"runAs":null,"recordId":"00O5e000008VIIbEAO","owner":{"name":"Andy Haas","id":"0055e000001mKpCAAU"},"name":"Notification","lastModifiedDate":"2022-10-25T04:28:18.000Z","id":"0Au3C00000000knSAA","deactivateOnTrigger":false,"createdDate":"2022-10-12T23:24:40.000Z","active":true}]');
        res.setStatusCode(200);
        return res;
    }
}