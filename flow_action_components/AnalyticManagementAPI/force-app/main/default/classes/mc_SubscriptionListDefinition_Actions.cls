/**
 * Subscription List Definition Actions wrapper class
 * 
 * Represents actions to be taken when notification thresholds are met.
 * Contains action type (e.g., "sendEmail") and configuration details.
 * 
 * @author Andy Haas
 */
public with sharing class mc_SubscriptionListDefinition_Actions {
    @AuraEnabled
    public mc_SubscriptionListDef_Config configuration;
    @AuraEnabled
    public String type;	//sendEmail
}