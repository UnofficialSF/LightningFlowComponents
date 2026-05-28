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
     * Test method for mc_GetRecipients - successful parsing
     * 
     * Tests the recipient parsing functionality by deserializing
     * a subscription definition string and extracting recipients.
     */
    @isTest
    public static void mc_GetRecipients_test(){
        List<mc_GetRecipients.Request> reqs = new List<mc_GetRecipients.Request>();
        mc_GetRecipients.Request req = new mc_GetRecipients.Request();
        
        // Create a valid subscription definition with recipients
        mc_SubscriptionListDefinition def = new mc_SubscriptionListDefinition();
        def.active = true;
        def.id = '0Au3C00000000kdSAA';
        
        List<mc_SubscriptionListDefinition_Thresholds> thresholds = new List<mc_SubscriptionListDefinition_Thresholds>();
        mc_SubscriptionListDefinition_Thresholds threshold = new mc_SubscriptionListDefinition_Thresholds();
        threshold.type = 'always';
        
        List<mc_SubscriptionListDefinition_Actions> actions = new List<mc_SubscriptionListDefinition_Actions>();
        mc_SubscriptionListDefinition_Actions action = new mc_SubscriptionListDefinition_Actions();
        action.type = 'sendEmail';
        
        mc_SubscriptionListDef_Config config = new mc_SubscriptionListDef_Config();
        config.excludeSnapshot = false;
        
        List<mc_SubscriptionListDefinition_Recipients> recipients = new List<mc_SubscriptionListDefinition_Recipients>();
        mc_SubscriptionListDefinition_Recipients recip = new mc_SubscriptionListDefinition_Recipients();
        recip.id = '0055e000001mKpC';
        recip.displayName = 'Test User';
        recip.type = 'user';
        recipients.add(recip);
        config.recipients = recipients;
        
        action.configuration = config;
        actions.add(action);
        threshold.actions = actions;
        thresholds.add(threshold);
        def.thresholds = thresholds;
        
        // Serialize with brackets to test bracket removal
        req.definition_string = '[' + JSON.serialize(def) + ']';
        reqs.add(req);
        
        Test.startTest();
        List<mc_GetRecipients.Results> results = mc_GetRecipients.mc_GetRecipients(reqs);
        Test.stopTest();
        
        System.assertNotEquals(null, results, 'Results should not be null');
        System.assertEquals(1, results.size(), 'Should return one result');
        System.assertNotEquals(null, results[0].recipients, 'Recipients should not be null');
        System.assertEquals(1, results[0].recipients.size(), 'Should have one recipient');
    }
    
    /**
     * Test empty definition_string
     */
    @isTest
    public static void mc_GetRecipients_testEmptyString(){
        List<mc_GetRecipients.Request> reqs = new List<mc_GetRecipients.Request>();
        mc_GetRecipients.Request req = new mc_GetRecipients.Request();
        req.definition_string = ''; // Empty string
        reqs.add(req);
        
        Test.startTest();
        List<mc_GetRecipients.Results> results = mc_GetRecipients.mc_GetRecipients(reqs);
        Test.stopTest();
        
        System.assertNotEquals(null, results, 'Results should not be null');
        System.assertEquals(0, results.size(), 'Should return empty list for invalid input');
    }
    
    /**
     * Test invalid JSON
     */
    @isTest
    public static void mc_GetRecipients_testInvalidJSON(){
        List<mc_GetRecipients.Request> reqs = new List<mc_GetRecipients.Request>();
        mc_GetRecipients.Request req = new mc_GetRecipients.Request();
        req.definition_string = '{invalid json}';
        reqs.add(req);
        
        Test.startTest();
        List<mc_GetRecipients.Results> results = mc_GetRecipients.mc_GetRecipients(reqs);
        Test.stopTest();
        
        System.assertNotEquals(null, results, 'Results should not be null');
        System.assertEquals(0, results.size(), 'Should return empty list for invalid JSON');
    }
    
    /**
     * Test missing thresholds/actions structure
     */
    @isTest
    public static void mc_GetRecipients_testMissingStructure(){
        List<mc_GetRecipients.Request> reqs = new List<mc_GetRecipients.Request>();
        mc_GetRecipients.Request req = new mc_GetRecipients.Request();
        
        // Create definition without thresholds
        mc_SubscriptionListDefinition def = new mc_SubscriptionListDefinition();
        def.active = true;
        def.id = '0Au3C00000000kdSAA';
        def.thresholds = null; // No thresholds
        
        req.definition_string = JSON.serialize(def);
        reqs.add(req);
        
        Test.startTest();
        List<mc_GetRecipients.Results> results = mc_GetRecipients.mc_GetRecipients(reqs);
        Test.stopTest();
        
        System.assertNotEquals(null, results, 'Results should not be null');
        System.assertEquals(1, results.size(), 'Should return one result');
        System.assertNotEquals(null, results[0].recipients, 'Recipients should not be null');
        System.assertEquals(0, results[0].recipients.size(), 'Should have empty recipients list');
    }
    
    /**
     * Test with null recipients
     */
    @isTest
    public static void mc_GetRecipients_testNullRecipients(){
        List<mc_GetRecipients.Request> reqs = new List<mc_GetRecipients.Request>();
        mc_GetRecipients.Request req = new mc_GetRecipients.Request();
        
        mc_SubscriptionListDefinition def = new mc_SubscriptionListDefinition();
        def.active = true;
        def.id = '0Au3C00000000kdSAA';
        
        List<mc_SubscriptionListDefinition_Thresholds> thresholds = new List<mc_SubscriptionListDefinition_Thresholds>();
        mc_SubscriptionListDefinition_Thresholds threshold = new mc_SubscriptionListDefinition_Thresholds();
        threshold.type = 'always';
        
        List<mc_SubscriptionListDefinition_Actions> actions = new List<mc_SubscriptionListDefinition_Actions>();
        mc_SubscriptionListDefinition_Actions action = new mc_SubscriptionListDefinition_Actions();
        action.type = 'sendEmail';
        
        mc_SubscriptionListDef_Config config = new mc_SubscriptionListDef_Config();
        config.excludeSnapshot = false;
        config.recipients = null; // Null recipients
        action.configuration = config;
        actions.add(action);
        threshold.actions = actions;
        thresholds.add(threshold);
        def.thresholds = thresholds;
        
        req.definition_string = JSON.serialize(def);
        reqs.add(req);
        
        Test.startTest();
        List<mc_GetRecipients.Results> results = mc_GetRecipients.mc_GetRecipients(reqs);
        Test.stopTest();
        
        System.assertNotEquals(null, results, 'Results should not be null');
        System.assertEquals(1, results.size(), 'Should return one result');
        System.assertNotEquals(null, results[0].recipients, 'Recipients should not be null');
        System.assertEquals(0, results[0].recipients.size(), 'Should have empty recipients list');
    }
}