/**
 * Subscription List Definition Thresholds wrapper class
 * 
 * Represents threshold configuration for analytics notification subscriptions.
 * Contains actions, conditions, and threshold type (e.g., "always").
 * 
 * @author Andy Haas
 */
public with sharing class mc_SubscriptionListDefinition_Thresholds {
    @AuraEnabled
    public List<mc_SubscriptionListDefinition_Actions> actions;
    @AuraEnabled
    public List<mc_SubscriptionListDefinition_Conditions> conditions;
    @AuraEnabled
    public String type;	//always
}