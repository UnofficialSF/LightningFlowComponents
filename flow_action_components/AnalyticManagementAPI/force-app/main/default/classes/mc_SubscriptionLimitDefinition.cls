/**
 * Subscription Limit Definition wrapper class
 * 
 * Represents the subscription limit information for a user as returned
 * by the Analytics Notification Limits API.
 * 
 * @author Andy Haas
 */
public with sharing class mc_SubscriptionLimitDefinition {
    @AuraEnabled
    public mc_SubscriptionLimitDefinitionDetails userLimit;
}
