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
        list<mc_DeleteRecipients.request> rqLst = new list<mc_DeleteRecipients.request>();
        list<mc_DeleteRecipients.request> rqLst1 = new list<mc_DeleteRecipients.request>();
        for(integer i = 0; i < 5; i++){
            mc_DeleteRecipients.request rq = new mc_DeleteRecipients.request();
            mc_DeleteRecipients.request rq1 = new mc_DeleteRecipients.request();
            List<mc_SubscriptionListDefinition_Recipients> rec = 
                new List<mc_SubscriptionListDefinition_Recipients>{
                    new mc_SubscriptionListDefinition_Recipients(),
                        new mc_SubscriptionListDefinition_Recipients()
                        };
            List<mc_SubscriptionListDefinition_Recipients> rec1 = 
                new List<mc_SubscriptionListDefinition_Recipients>();
            rq1.recipients = rec;
            rq.recipients = rec1;
            rqLst.add(rq1);
            rqlst.add(rq);
        }
        test.startTest();
        test.setMock(httpCalloutMock.class, new mock());
        mc_DeleteRecipients.mc_DeleteRecipients(rqLst);
        mc_DeleteRecipients.mc_DeleteRecipients(rqlst1);
        test.stopTest();
    }
    /**
     * Mock HTTP Callout class for testing mc_DeleteRecipients
     * 
     * Implements HttpCalloutMock to provide mock responses for HTTP callouts
     * during test execution.
     */
    public class mock implements httpCalloutMock {
        /**
         * Provides mock HTTP response for testing
         * 
         * @param req HTTPRequest object from the callout
         * @return HTTPResponse Mock response with subscription definition data
         */
        public system.HttpResponse respond(system.HttpRequest req){
            httpResponse resp = new system.HttpResponse();
            resp.setStatusCode(200);
            resp.setStatus('OK');
            resp.setHeader('Content-Type', 'application/json');
            string jsonInp = '{"active": true,' + '\n';
            jsonInp += '"thresholds":';
            list<mc_SubscriptionListDefinition_Thresholds> thresholds = 
                new list<mc_SubscriptionListDefinition_Thresholds>();
            mc_SubscriptionListDefinition_Thresholds threshold = 
                new mc_SubscriptionListDefinition_Thresholds();
            list<mc_SubscriptionListDefinition_Actions> actions = 
                new list<mc_SubscriptionListDefinition_Actions>();
            mc_SubscriptionListDefinition_Actions action = 
                new mc_SubscriptionListDefinition_Actions();
            mc_SubscriptionListDef_Config conf = new mc_SubscriptionListDef_Config();
            List<mc_SubscriptionListDefinition_Recipients> recips = 
                new List<mc_SubscriptionListDefinition_Recipients>();
            mc_SubscriptionListDefinition_Recipients recip = 
                new mc_SubscriptionListDefinition_Recipients();
            recip.displayName = 'Andy';
            recip.type = 'user';
            recips.add(recip);
            conf.recipients = recips;
            action.configuration = conf;
            actions.add(action);
            threshold.actions = actions;
            thresholds.add(threshold);
            jsonInp += json.serialize(thresholds);
            jsonInp += '}';
            resp.setBody(jsonInp);
            return resp;
        }
    }
}