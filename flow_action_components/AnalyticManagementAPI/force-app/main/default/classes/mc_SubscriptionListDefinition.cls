/**
 * Subscription List Definition wrapper class
 * 
 * Represents the full structure of an analytics notification subscription
 * as returned by the Analytics Notification API. This class maps directly
 * to the JSON response from the API.
 * 
 * @author Andy Haas
 */
global with sharing class mc_SubscriptionListDefinition {
    @AuraEnabled
    public boolean active;
    @AuraEnabled
    public Datetime createdDate;	//2022-10-12T01:10:52Z
    @AuraEnabled
    public boolean deactivateOnTrigger;
    @AuraEnabled
    public String id;	//0Au3C00000000kdSAA
    @AuraEnabled
    public Datetime lastModifiedDate;	//2022-10-12T01:10:52Z
    @AuraEnabled
    public String name;	//Notification
    @AuraEnabled
    public mc_SubscriptionListdefinition_Owner owner;
    @AuraEnabled
    public String recordId;	//00O5e000008VZezEAG
    @AuraEnabled
    public mc_SubscriptionListdefinition_RunAs runAs;
    @AuraEnabled
    public mc_SubscriptionListdefinition_Schedule schedule;
    @AuraEnabled
    public String source;	//lightningReportSubscribe
    @AuraEnabled
    public List<mc_SubscriptionListDefinition_Thresholds> thresholds;

}