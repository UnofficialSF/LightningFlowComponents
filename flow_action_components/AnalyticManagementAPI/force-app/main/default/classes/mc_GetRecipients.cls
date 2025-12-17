/**
 * Flow Action: Parse Recipient Data
 * 
 * Parses subscription definition JSON string to extract recipient information.
 * This invocable action takes a serialized subscription definition and extracts
 * the recipients list for use in Flow screens or other actions.
 * 
 * @author Andy Haas
 * @see https://unofficialsf.com/from-andy-haas-use-analytics-management-actions-to-show-report-subscribers-and-assignments/
 */
public with sharing class mc_GetRecipients {
    /**
     * Invocable method to parse recipient data from subscription definition string
     * 
     * @param requests List of Request objects containing definition_string (JSON)
     * @return List<Results> List of Results containing recipients and notification details
     */
    @InvocableMethod(label='Parse Recipient Data' description='Parses the Recipient Data into usable class for the flow'  category='Analytic Subscription')
    public static List<Results> mc_GetRecipients(List<Request> requests) {
        System.debug('mc_GetRecipients: Processing ' + requests.size() + ' request(s)');
        
        // Set Response Wrapper
        List<Results> responseWrapper = new List<Results>();

        // Loop through the requests
        for (Request request : requests) {
            try {
                // Validate input
                if (String.isBlank(request.definition_string)) {
                    System.debug('Warning: Empty definition_string provided');
                    continue;
                }

                // Fix definition_string to remove [ and ] brackets if present
                String definition_string = request.definition_string.trim();
                
                // Remove the first character if it's a bracket
                if (definition_string.startsWith('[')) {
                    definition_string = definition_string.substring(1);
                }
                
                // Remove the last character if it's a bracket
                if (definition_string.endsWith(']')) {
                    definition_string = definition_string.substring(0, definition_string.length() - 1);
                }

                // Deserialize the request with SubscriptionListDefinition
                mc_SubscriptionListDefinition subscriptionListDefinition;
                try {
                    subscriptionListDefinition = (mc_SubscriptionListDefinition)JSON.deserialize(definition_string, mc_SubscriptionListDefinition.class);
                } catch (JSONException e) {
                    System.debug('Error deserializing definition_string: ' + e.getMessage());
                    continue;
                }

                System.debug('mc_GetRecipients: subscriptionListDefinition: ' + subscriptionListDefinition);
                
                Results response = new Results();

                // Check if subscriptionListDefinition is not null and has required data
                if (subscriptionListDefinition != null) {
                    // Validate thresholds and actions exist before accessing
                    if (subscriptionListDefinition.thresholds != null &&
                        !subscriptionListDefinition.thresholds.isEmpty() &&
                        subscriptionListDefinition.thresholds[0].actions != null &&
                        !subscriptionListDefinition.thresholds[0].actions.isEmpty() &&
                        subscriptionListDefinition.thresholds[0].actions[0].configuration != null) {
                        
                        // Extract recipients safely
                        List<mc_SubscriptionListDefinition_Recipients> recipients = 
                            subscriptionListDefinition.thresholds[0].actions[0].configuration.recipients;
                        
                        response.recipients_string = JSON.serialize(recipients != null ? recipients : new List<mc_SubscriptionListDefinition_Recipients>());
                        response.recipients = recipients != null ? recipients : new List<mc_SubscriptionListDefinition_Recipients>();
                    } else {
                        // Set empty recipients if structure is invalid
                        response.recipients_string = JSON.serialize(new List<mc_SubscriptionListDefinition_Recipients>());
                        response.recipients = new List<mc_SubscriptionListDefinition_Recipients>();
                        System.debug('Warning: Subscription definition missing thresholds or actions structure');
                    }
                    
                    response.notificationId = subscriptionListDefinition.id;
                    response.definition = subscriptionListDefinition;
                    responseWrapper.add(response);
                    
                    System.debug('recipients_string: ' + response.recipients_string);
                    System.debug('recipients count: ' + (response.recipients != null ? response.recipients.size() : 0));
                } else {
                    System.debug('Warning: subscriptionListDefinition is null after deserialization');
                }
            } catch (Exception e) {
                System.debug('Error processing request: ' + e.getMessage());
                System.debug('Stack trace: ' + e.getStackTraceString());
                // Continue to next request instead of failing entire batch
            }
        }

        return responseWrapper;
    }

    /**
     * Request wrapper class for invocable method input
     */
    public class Request {
        @InvocableVariable(required=true)
        public string definition_string;
    }

    /**
     * Results wrapper class for invocable method output
     */
    public class Results {
        @InvocableVariable
        public List<mc_SubscriptionListDefinition_Recipients> recipients;

        @InvocableVariable
        public mc_SubscriptionListDefinition definition;

        @InvocableVariable
        public string notificationId;

        @InvocableVariable
        public string recipients_string;
    }
}