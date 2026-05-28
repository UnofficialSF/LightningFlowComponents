/**
 * Flow Action: Delete Selected Recipients
 * 
 * Deletes selected recipients from an analytics notification subscription.
 * If all recipients are deleted, the entire notification is removed.
 * Otherwise, the notification is updated with the remaining recipients.
 * 
 * @author Andy Haas
 * @see https://unofficialsf.com/from-andy-haas-use-analytics-management-actions-to-show-report-subscribers-and-assignments/
 */
public with sharing class mc_DeleteRecipients {
    // API version constant for REST API calls
    private static final String API_VERSION = 'v65.0';
    
    /**
     * Invocable method to delete selected recipients from a notification subscription
     * 
     * @param requests List of Request objects containing notificationId, recipients, definition, and deletedRecipients
     * @return List<Results> List of Results containing HTTP status code
     */
    @InvocableMethod(label='Delete Selected Recipients' description='Delete selected recipients from a notification subscription'  category='Analytic Subscription')
    public static List<Results> mc_DeleteRecipients(List<Request> requests) {
        // Set Response Wrapper
        List<Results> responseWrapper = new List<Results>();

        // Instantiate a new http object
        Http h = new Http();
            
        // Get Domain URL
        string domainURL = System.Url.getOrgDomainUrl().toExternalForm();
        System.debug('domainURL: ' + domainURL);

        // Set Session ID
        string sessionId = 'some_text\nwritten_here';
        if(!test.isRunningTest()){
            sessionId =  Page.usf3__GenerateSessionIdForLWC.getContent().toString();
        }
        // Fix Session Id - extract the actual session ID after the newline
        if (sessionId.indexOf('\n') >= 0) {
            sessionId = sessionId.substring(sessionId.indexOf('\n')+1);
        }

        for (Request request : requests) {
            try {
                Results response = new Results();
                
                // Validate required inputs
                if (String.isBlank(request.notificationId)) {
                    System.debug('Error: notificationId is required');
                    response.status_code = 400;
                    responseWrapper.add(response);
                    continue;
                }
                
                if (request.recipients == null) {
                    System.debug('Error: recipients list is required');
                    response.status_code = 400;
                    responseWrapper.add(response);
                    continue;
                }
                
                // Set Base URL
                string baseURL =  '/services/data/' + API_VERSION + '/analytics/notifications/' + request.notificationId;
                // Set URL from domain and base url
                string url = domainURL + baseURL;

                // Get current recipients list
                List<mc_SubscriptionListDefinition_Recipients> recipients = request.recipients;

                // Deserialize the recipients to delete
                List<mc_SubscriptionListDefinition_Recipients> recipientsToDelete = 
                    new List<mc_SubscriptionListDefinition_Recipients>();
                if(!test.isRunningTest() && !String.isBlank(request.deletedRecipients)){
                    try {
                        recipientsToDelete = (List<mc_SubscriptionListDefinition_Recipients>)
                            JSON.deserialize(request.deletedRecipients, 
                                             List<mc_SubscriptionListDefinition_Recipients>.class);
                    } catch (JSONException e) {
                        System.debug('Error deserializing deletedRecipients: ' + e.getMessage());
                        response.status_code = 400;
                        responseWrapper.add(response);
                        continue;
                    }
                }
                
                // Validate recipientsToDelete is not null
                if (recipientsToDelete == null) {
                    recipientsToDelete = new List<mc_SubscriptionListDefinition_Recipients>();
                }
                
                // If all recipients are being deleted, delete the entire notification
                if (recipients.size() == recipientsToDelete.size() && recipients.size() > 0) {
                    // Delete the entire notification
                    System.debug('Delete the entire notification: ' + request.notificationId);

                    // Instantiate a new HTTP request, specify the method (DELETE) as well as the endpoint
                    HttpRequest req = new HttpRequest();
                    req.setEndpoint(url);
                    req.setMethod('DELETE');
                    req.setHeader('Authorization', 'OAuth ' + sessionId);

                    // Send the request, and return a response
                    HttpResponse res = h.send(req);

                    // Validate response
                    response.status_code = res.getStatusCode();
                    if (res.getStatusCode() != 200 && res.getStatusCode() != 204) {
                        System.debug('Error deleting notification: HTTP ' + res.getStatusCode() + ' - ' + res.getStatus());
                        System.debug('Response Body: ' + res.getBody());
                    }
                    responseWrapper.add(response);

                } else {
                    // Create a new recipient list with the recipients that are NOT in the recipientsToDelete list
                    System.debug('Current recipients count: ' + recipients.size());
                    System.debug('Recipients to delete count: ' + recipientsToDelete.size());
                    
                    // Create a set of recipient IDs to delete for efficient lookup
                    Set<String> recipientIdsToDelete = new Set<String>();
                    for (mc_SubscriptionListDefinition_Recipients recipientToDelete : recipientsToDelete) {
                        if (recipientToDelete != null && recipientToDelete.id != null) {
                            recipientIdsToDelete.add(recipientToDelete.id);
                        }
                    }
                    
                    // Filter recipients: keep only those NOT in the delete list
                    List<mc_SubscriptionListDefinition_Recipients> recipientsToKeep = new List<mc_SubscriptionListDefinition_Recipients>();
                    for (mc_SubscriptionListDefinition_Recipients recipient : recipients) {
                        if (recipient != null && recipient.id != null && !recipientIdsToDelete.contains(recipient.id)) {
                            recipientsToKeep.add(recipient);
                        }
                    }
                    
                    System.debug('Recipients to keep count: ' + recipientsToKeep.size());

                    // Validate we have recipients to keep
                    if (recipientsToKeep.isEmpty()) {
                        System.debug('Warning: No recipients remaining, but size check failed. Deleting notification instead.');
                        // Delete the entire notification if no recipients remain
                        HttpRequest req = new HttpRequest();
                        req.setEndpoint(url);
                        req.setMethod('DELETE');
                        req.setHeader('Authorization', 'OAuth ' + sessionId);
                        HttpResponse res = h.send(req);
                        response.status_code = res.getStatusCode();
                        responseWrapper.add(response);
                        continue;
                    }

                    // Get current notification definition to update
                    HttpRequest req = new HttpRequest();
                    req.setEndpoint(url);
                    req.setMethod('GET');
                    req.setHeader('Authorization', 'OAuth ' + sessionId);
                    req.setHeader('Content-Type', 'application/json');

                    // Send the request, and return a response
                    HttpResponse res = h.send(req);

                    // Validate GET response
                    if (res.getStatusCode() != 200) {
                        System.debug('Error retrieving notification: HTTP ' + res.getStatusCode() + ' - ' + res.getStatus());
                        System.debug('Response Body: ' + res.getBody());
                        response.status_code = res.getStatusCode();
                        responseWrapper.add(response);
                        continue;
                    }

                    // Replace time: with timeOfDay: in the response body (for Apex class compatibility)
                    String responseBody = res.getBody();
                    if (String.isBlank(responseBody)) {
                        System.debug('Error: Empty response body received');
                        response.status_code = 500;
                        responseWrapper.add(response);
                        continue;
                    }
                    
                    responseBody = responseBody.replace('"time":', '"timeOfDay":');

                    System.debug('responseBody length: ' + responseBody.length());

                    // Deserialize the response body
                    mc_SubscriptionListDefinition definition;
                    try {
                        definition = (mc_SubscriptionListDefinition)JSON.deserialize(responseBody, mc_SubscriptionListDefinition.class);
                    } catch (JSONException e) {
                        System.debug('Error deserializing notification definition: ' + e.getMessage());
                        response.status_code = 500;
                        responseWrapper.add(response);
                        continue;
                    }

                    System.debug('definition retrieved successfully');

                    // Validate definition structure before updating
                    if (definition == null ||
                        definition.thresholds == null ||
                        definition.thresholds.isEmpty() ||
                        definition.thresholds[0].actions == null ||
                        definition.thresholds[0].actions.isEmpty() ||
                        definition.thresholds[0].actions[0].configuration == null) {
                        System.debug('Error: Invalid notification definition structure');
                        response.status_code = 500;
                        responseWrapper.add(response);
                        continue;
                    }

                    // Update definition with the new recipients list
                    definition.thresholds[0].actions[0].configuration.recipients = recipientsToKeep;

                    System.debug('definition updated with ' + recipientsToKeep.size() + ' recipients');

                    // Serialize Body
                    String body = JSON.serialize(definition, true);

                    // Put timeOfDay back to time otherwise API will fail
                    body = body.replace('"timeOfDay":', '"time":');
                    System.debug('body length: ' + body.length());

                    // Instantiate a new HTTP request, specify the method (PUT) as well as the endpoint
                    HttpRequest req2 = new HttpRequest();
                    req2.setEndpoint(url);
                    req2.setMethod('PUT');
                    req2.setHeader('Authorization', 'OAuth ' + sessionId);
                    req2.setHeader('Content-Type', 'application/json');
                    req2.setBody(body);

                    // Send the request, and return a response
                    HttpResponse res2 = h.send(req2);
                    
                    // Validate PUT response
                    response.status_code = res2.getStatusCode();
                    if (res2.getStatusCode() != 200) {
                        System.debug('Error updating notification: HTTP ' + res2.getStatusCode() + ' - ' + res2.getStatus());
                        System.debug('Response Body: ' + res2.getBody());
                    } else {
                        System.debug('Notification updated successfully');
                    }
                    responseWrapper.add(response);
                }
            } catch (Exception e) {
                System.debug('Error processing request: ' + e.getMessage());
                System.debug('Stack trace: ' + e.getStackTraceString());
                Results errorResponse = new Results();
                errorResponse.status_code = 500;
                responseWrapper.add(errorResponse);
            }
        }
        return responseWrapper;
    }

    /**
     * Request wrapper class for invocable method input
     */
    public class Request {
        @InvocableVariable(required=true)
        public string notificationId;
        
        @InvocableVariable(required=true)
        public List<mc_SubscriptionListDefinition_Recipients> recipients;
        
        @InvocableVariable(required=true)
        public mc_SubscriptionListDefinition definition;
        
        @InvocableVariable(required=true)
        public string deletedRecipients;
    }

    /**
     * Results wrapper class for invocable method output
     */
    public class Results {
        @InvocableVariable
        public Integer status_code;
    }
}