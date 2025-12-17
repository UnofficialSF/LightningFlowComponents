/**
 * Subscription List Definition Schedule wrapper class
 * 
 * Represents the schedule configuration for analytics notification subscriptions.
 * Contains frequency (e.g., "weekly", "daily") and schedule details.
 * 
 * @author Andy Haas
 */
public with sharing class mc_SubscriptionListDefinition_Schedule {
    @AuraEnabled
    public mc_SubscriptionListdefinition_Details details;
    @AuraEnabled
    public String frequency;	//weekly
    @AuraEnabled
    public String frequencyType;
}