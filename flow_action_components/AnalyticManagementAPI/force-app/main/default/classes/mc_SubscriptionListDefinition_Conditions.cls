/**
 * Subscription List Definition Conditions wrapper class
 * 
 * Represents threshold conditions for analytics notification subscriptions.
 * Contains operator (e.g., "greaterThan"), value, and column name.
 * 
 * @author Andy Haas
 */
public with sharing class mc_SubscriptionListDefinition_Conditions {
    @AuraEnabled
    public String operator;	//greaterThan
    @AuraEnabled
    public String value;	//0
    @AuraEnabled
    public String colName;
}