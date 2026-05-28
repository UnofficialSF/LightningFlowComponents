/**
 * Subscription List Definition Recipients wrapper class
 * 
 * Represents a recipient in an analytics notification subscription.
 * Contains the recipient's ID, display name, and type (user, role, etc.).
 * 
 * @author Andy Haas
 */
public with sharing class mc_SubscriptionListDefinition_Recipients {
    @AuraEnabled
    public Id id;	//0055e000001mKpC
    @AuraEnabled
    public String displayName;	//Andy Haas
    @AuraEnabled
    public String type;	//user
}