/**
 * Subscription List Definition Configuration wrapper class
 * 
 * Represents configuration settings for notification actions.
 * Contains exclude snapshot flag and list of recipients.
 * 
 * @author Andy Haas
 */
public with sharing class mc_SubscriptionListDef_Config {
    @AuraEnabled
    public boolean excludeSnapshot;
    @AuraEnabled
    public List<mc_SubscriptionListDefinition_Recipients> recipients;
}