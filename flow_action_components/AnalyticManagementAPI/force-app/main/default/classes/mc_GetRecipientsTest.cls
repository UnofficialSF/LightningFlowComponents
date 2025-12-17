/**
 * Test class for mc_GetRecipients
 * 
 * Provides test coverage for the Parse Recipient Data invocable action.
 * Tests parsing of subscription definition JSON strings to extract recipient information.
 * 
 * @author Andy Haas
 */
@isTest
public with sharing class mc_GetRecipientsTest {
    /**
     * Test method for mc_GetRecipients
     * 
     * Tests the recipient parsing functionality by deserializing
     * a subscription definition string and extracting recipients.
     */
    @isTest
    public static void mc_GetRecipients_test(){
        list<mc_GetRecipients.request> reqs = new list<mc_getRecipients.Request>();
        mc_GetRecipients.request req = new mc_GetRecipients.request();
        req.definition_string = '${"active": true,';
        req.definition_string += '"thresholds":';
        List<mc_SubscriptionListDefinition_Thresholds> thresholds = 
            new list<mc_SubscriptionListDefinition_Thresholds>();
        mc_SubscriptionListDefinition_Thresholds threshold = 
            new mc_SubscriptionListDefinition_Thresholds();
        List<mc_SubscriptionListDefinition_Actions> actions = 
            new List<mc_SubscriptionListDefinition_Actions>();
        mc_SubscriptionListDefinition_Actions action = new mc_SubscriptionListDefinition_Actions();
        mc_SubscriptionListDef_Config config = new mc_SubscriptionListDef_Config();
        action.configuration = config;
        actions.add(action);
        threshold.actions = actions;
        thresholds.add(threshold);
        req.definition_string += json.serialize(thresholds) + '}$';
        reqs.add(req);
        mc_GetRecipients.mc_GetRecipients(reqs);
    }
}