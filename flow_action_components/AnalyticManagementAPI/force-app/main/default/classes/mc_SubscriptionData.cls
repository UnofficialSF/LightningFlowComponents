/**
 * Flow Action: Get Subscription Data
 * 
 * Retrieves analytics notification subscription data using the Analytics Notification API.
 * This invocable action queries subscriptions for reports and returns detailed information
 * including thresholds, actions, schedules, and recipients.
 * 
 * @author Andy Haas
 * @see https://unofficialsf.com/from-andy-haas-use-analytics-management-actions-to-show-report-subscribers-and-assignments/
 */
public with sharing class mc_SubscriptionData {
    // API version constant for REST API calls
    private static final String API_VERSION = 'v65.0';
    
    /**
     * Invocable method to get subscription data from Analytics Notification API
     * 
     * @param requestList List of Request objects containing source, ownerId, and recordId
     * @return List<Results> List of Results containing subscription definitions and details
     */
    @InvocableMethod(label='Get Subscription Data' description='Get Subscription Data' category='Analytic Subscription')
    public static List<Results> mc_GetSubscriptionDataList(List<Request> requestList) {
        System.debug('mc_SubscriptionDataList: Processing ' + requestList.size() + ' request(s)');

        // Set Response Wrapper
        List<Results> responseWrapper = new List<Results>();

        for( Request currRequest : requestList ) {
            try {
                System.debug('source: ' + currRequest.source);
                System.debug('ownerId: ' + currRequest.ownerId);
                System.debug('recordId: ' + currRequest.recordId);
        
                // Instantiate a new http object
                Http h = new Http();
        
                // Get Domain URL
                string domainURL = System.Url.getOrgDomainUrl().toExternalForm();
                System.debug('domainURL: ' + domainURL);
                string baseURL =  '/services/data/' + API_VERSION + '/analytics/notifications?source=' + currRequest.source;

                // Go through the inputs and set the URL Parameters
                if (currRequest.ownerId != null && currRequest.ownerId != '') {
                    baseURL = baseURL + '&ownerId=' + currRequest.ownerId;
                }

                if (currRequest.recordId != null && currRequest.recordId != '') {
                    baseURL = baseURL + '&recordId=' + currRequest.recordId;
                }
        
                // Set URL from domain and base url
                string url = domainURL + baseURL;
        
                // Set Session ID
                string sessionId = 'session \n id';
                if(!test.isRunningTest()){
                	sessionId =  Page.usf3__GenerateSessionIdForLWC.getContent().toString();
                }
                // Fix Session Id - extract the actual session ID after the newline
                if (sessionId.indexOf('\n') >= 0) {
                    sessionId = sessionId.substring(sessionId.indexOf('\n')+1);
                }
                
                // Instantiate a new HTTP request, specify the method (GET) as well as the endpoint
                HttpRequest req = new HttpRequest();
                req.setEndpoint(url);
                req.setMethod('GET');
                req.setHeader('Accept', 'application/json');
                req.setHeader('Accept-Encoding', 'gzip, deflate, br');
                req.setHeader('Authorization', 'OAuth ' + sessionId);
        
                System.debug('userSessionId: ' + (sessionId.length() > 10 ? sessionId.substring(0, 10) + '...' : sessionId));
            
                // Send the request, and return a response
                HttpResponse res = h.send(req);
        
                // Validate HTTP response status
                if (res.getStatusCode() != 200) {
                    System.debug('Error: HTTP Status Code ' + res.getStatusCode() + ' - ' + res.getStatus());
                    System.debug('Response Body: ' + res.getBody());
                    // Continue to next request instead of throwing exception
                    continue;
                }
        
                // Set Response Body
                string responseBody = res.getBody();
                System.debug('responseBody length: ' + responseBody.length());
                
                // Validate response body is not empty
                if (String.isBlank(responseBody)) {
                    System.debug('Warning: Empty response body received');
                    continue;
                }
                
                // replace time: with timeOfDay: in the response body (for Apex class compatibility)
                responseBody = responseBody.replace('"time":', '"timeOfDay":');
        
                // Parse JSON Response
                List<mc_SubscriptionListDefinition> parsedResponse;
                try {
                    parsedResponse = (List<mc_SubscriptionListDefinition>)JSON.deserialize(responseBody, List<mc_SubscriptionListDefinition>.class);
                } catch (JSONException e) {
                    System.debug('Error parsing JSON response: ' + e.getMessage());
                    continue;
                }
                
                System.debug('parsedResponse size: ' + (parsedResponse != null ? parsedResponse.size() : 0));
                
                Results response = new Results();
                response.definition = parsedResponse;

                // Create a temp list for notificationDefinitions
                List<mc_NotificationDefinition> notificationDefinitions = new List<mc_NotificationDefinition>();

                // Iterate through the list of subscriptions and set report name and other details to another list
                if (parsedResponse != null) {
                    for( mc_SubscriptionListDefinition currSubscription : parsedResponse ) {
                        System.debug('currSubscription: ' + currSubscription.recordId);

                        // Validate subscription has required data before processing
                        if (currSubscription == null || 
                            currSubscription.thresholds == null || 
                            currSubscription.thresholds.isEmpty() ||
                            currSubscription.thresholds[0].actions == null ||
                            currSubscription.thresholds[0].actions.isEmpty()) {
                            System.debug('Warning: Skipping subscription with missing threshold or action data: ' + currSubscription?.recordId);
                            continue;
                        }

                        mc_NotificationDefinition notificationDefinition = new mc_NotificationDefinition();

                        // Set Report Name
                        if(!test.isRunningTest() && currSubscription.recordId != null){
                            try {
                                List<Report> reports = [SELECT Name FROM Report WHERE Id = :currSubscription.recordId LIMIT 1];
                                if (!reports.isEmpty()) {
                                    notificationDefinition.reportName = reports[0].Name;
                                }
                            } catch (Exception e) {
                                System.debug('Error retrieving report name: ' + e.getMessage());
                            }
                        }
                        
                        // Set Action Type (with null check)
                        if (currSubscription.thresholds[0].type != null) {
                            notificationDefinition.actionType = currSubscription.thresholds[0].type;
                        }

                        // Set Exclude Snapshot (with null check)
                        if (currSubscription.thresholds[0].actions[0].configuration != null) {
                            notificationDefinition.excludeSnapshot = currSubscription.thresholds[0].actions[0].configuration.excludeSnapshot;
                        }

                        // Set Recipient Count (with null check)
                        if (currSubscription.thresholds[0].actions[0].configuration != null &&
                            currSubscription.thresholds[0].actions[0].configuration.recipients != null) {
                            notificationDefinition.recipientCount = currSubscription.thresholds[0].actions[0].configuration.recipients.size();
                        } else {
                            notificationDefinition.recipientCount = 0;
                        }

                        // Set Thresholds
                        notificationDefinition.thresholds = currSubscription.thresholds;

                        // Set Time of Day (if applicable) with null check
                        if (currSubscription.schedule != null && 
                            currSubscription.schedule.details != null) {
                            notificationDefinition.timeOfDay = currSubscription.schedule.details.timeOfDay;
                            
                            // Set Days of Week (if applicable)
                            if (currSubscription.schedule.details.daysOfWeek != null) {
                                notificationDefinition.daysOfWeek = currSubscription.schedule.details.daysOfWeek.toString();
                            }
                            
                            // Set Days of Month (if applicable)
                            if (currSubscription.schedule.details.daysOfMonth != null) {
                                notificationDefinition.daysOfMonth = currSubscription.schedule.details.daysOfMonth.toString();
                            }
                            
                            // Set Week In Month (if applicable)
                            notificationDefinition.weekInMonth = currSubscription.schedule.details.weekInMonth;
                        }

                        // Set Frequency (with null check)
                        if (currSubscription.schedule != null) {
                            notificationDefinition.frequency = currSubscription.schedule.frequency;
                        }

                        // Set Active
                        notificationDefinition.active = currSubscription.active;

                        // Set Id
                        notificationDefinition.id = currSubscription.id;

                        // Set createdDate
                        notificationDefinition.createdDate = currSubscription.createdDate;

                        // Set lastModifiedDate
                        notificationDefinition.lastModifiedDate = currSubscription.lastModifiedDate;

                        // Set name
                        notificationDefinition.name = currSubscription.name;

                        // Set recordId
                        notificationDefinition.recordId = currSubscription.recordId;

                        // Set source
                        notificationDefinition.source = currSubscription.source;

                        // Push notification object to list
                        System.debug('notificationDefinition: ' + notificationDefinition);
                        notificationDefinitions.add(notificationDefinition);
                    }
                }

                // Add notificationDefinitions to response
                response.definitionDetails = notificationDefinitions;

                // Stringify the response for use in DataTable
                response.definition_string = JSON.serialize(response.definition);
                response.definitionDetails_string = JSON.serialize(response.definitionDetails);

                responseWrapper.add(response);
            } catch (Exception e) {
                System.debug('Error processing request: ' + e.getMessage());
                System.debug('Stack trace: ' + e.getStackTraceString());
                // Continue to next request instead of failing entire batch
            }
        }

        // Return the list of records
        return responseWrapper;
    }

    /**
     * Request wrapper class for invocable method input
     */
    public class Request {
        @InvocableVariable(required=true)
        public string source;

        @InvocableVariable
        public string ownerId;

        @InvocableVariable
        public string recordId;
    }

    /**
     * Results wrapper class for invocable method output
     */
    public class Results {
        @InvocableVariable
        public List<mc_SubscriptionListDefinition> definition;

        @InvocableVariable
        public List<mc_NotificationDefinition> definitionDetails;

        @InvocableVariable
        public string definition_string;

        @InvocableVariable
        public string definitionDetails_string;
    }

    /**
     * Helper method to parse JSON string into SubscriptionListDefinition
     * 
     * @param json JSON string to parse
     * @return mc_SubscriptionListDefinition Parsed subscription definition
     */
    public static mc_SubscriptionListDefinition parse(String json){
        return (mc_SubscriptionListDefinition) System.JSON.deserialize(json, mc_SubscriptionListDefinition.class);
    }
}