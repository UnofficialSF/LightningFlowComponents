/**
 * Flow Action: Get User Subscription Limit
 * 
 * Retrieves the subscription limit for a user using the Analytics Notification Limits API.
 * This invocable action queries the maximum number of subscriptions allowed for a user
 * based on the source type (e.g., lightningReportSubscribe).
 * 
 * @author Andy Haas
 * @see https://unofficialsf.com/from-andy-haas-use-analytics-management-actions-to-show-report-subscribers-and-assignments/
 */
public with sharing class mc_GetUserSubscriptionLimit {
    // API version constant for REST API calls
    private static final String API_VERSION = 'v65.0';
    
    /**
     * Invocable method to get user subscription limit from Analytics Notification Limits API
     * 
     * @param requestList List of Request objects containing source and optional recordId
     * @return List<Results> List of Results containing subscription limit definition
     */
    @InvocableMethod(label='Get User Subscription Limit' description='Get the subscription limit for a user' category='Analytic Subscription')
    public static List<Results> mc_GetUserSubscriptionLimitList(List<Request> requestList) {
        // Set Response wrapper
        List<Results> responseList = new List<Results>();

        for( Request currRequest : requestList ) {
            try {
                System.debug('source: ' + currRequest.source);
                System.debug('recordId: ' + currRequest.recordId);
                
                // Instantiate a new http object
                Http http = new Http();

                // Get Domain URL
                string domainURL = URL.getSalesforceBaseUrl().toExternalForm();
                string baseURL = '/services/data/' + API_VERSION + '/analytics/notifications/limits?source=' + currRequest.source;

                // Go through inputs and set parameters
                if ( currRequest.recordId != null && currRequest.recordId != '' ) {
                    baseURL += '&recordId=' + currRequest.recordId;
                }

                // Set URL from domain and base URL
                string url = domainURL + baseURL;

                // Set Session Id
                string sessionId = 'session \n id';
                if(!test.isRunningTest()){
                	sessionId =  Page.usf3__GenerateSessionIdForLWC.getContent().toString();
                }
                // Fix Session Id - extract the actual session ID after the newline
                if (sessionId.indexOf('\n') >= 0) {
                    sessionId = sessionId.substring(sessionId.indexOf('\n')+1);
                }

                // Instantiate a new HTTP request, specify the method (GET) as well as the endpoint
                HttpRequest request = new HttpRequest();
                request.setEndpoint(url);
                request.setMethod('GET');
                request.setHeader('Accept', 'application/json');
                request.setHeader('Accept-Encoding', 'gzip, deflate, br');
                request.setHeader('Authorization', 'OAuth ' + sessionId);

                // Send the request and store the response
                HttpResponse response = http.send(request);

                // Validate HTTP response status
                if (response.getStatusCode() != 200) {
                    System.debug('Error: HTTP Status Code ' + response.getStatusCode() + ' - ' + response.getStatus());
                    System.debug('Response Body: ' + response.getBody());
                    continue;
                }

                // Set Response Body
                String responseBody = response.getBody();
                System.debug('responseBody length: ' + responseBody.length());

                // Validate response body is not empty
                if (String.isBlank(responseBody)) {
                    System.debug('Warning: Empty response body received');
                    continue;
                }

                // Parse JSON Response
                mc_SubscriptionLimitDefinition parsedResponse;
                try {
                    parsedResponse = (mc_SubscriptionLimitDefinition)JSON.deserialize(responseBody, mc_SubscriptionLimitDefinition.class);
                } catch (JSONException e) {
                    System.debug('Error parsing JSON response: ' + e.getMessage());
                    continue;
                }
                
                Results results = new Results();
                results.definition = parsedResponse;
                responseList.add(results);
            } catch (Exception e) {
                System.debug('Error processing request: ' + e.getMessage());
                System.debug('Stack trace: ' + e.getStackTraceString());
                // Continue to next request instead of failing entire batch
            }
        }   

        return responseList;
    }

    /**
     * Request wrapper class for invocable method input
     */
    public class Request {
        @InvocableVariable(required=true)
        public string source;

        @InvocableVariable
        public string recordId;
    }

    /**
     * Results wrapper class for invocable method output
     */
    public class Results {
        @InvocableVariable
        public mc_SubscriptionLimitDefinition definition;
    }
}
