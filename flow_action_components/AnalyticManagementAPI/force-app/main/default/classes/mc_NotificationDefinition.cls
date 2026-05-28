/**
 * Notification Definition wrapper class
 * 
 * Custom definition class for use in DataTable and Flow screens.
 * Contains simplified subscription notification data including report name,
 * action type, recipients, schedule, and threshold information.
 * 
 * @author Andy Haas
 */
public with sharing class mc_NotificationDefinition {
    // Custom Definitions for use in DataTable
    @AuraEnabled
    public String reportName;
    @AuraEnabled 
    public String actionType;
    @AuraEnabled
    public Boolean excludeSnapshot;
    @AuraEnabled
    public Integer recipientCount;
    @AuraEnabled
    public Integer timeOfDay;
    @AuraEnabled
    public String daysOfWeek;
    @AuraEnabled
    public String daysOfMonth;
    @AuraEnabled
    public String weekInMonth;
    @AuraEnabled
    public String frequency;
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
    public mc_SubscriptionListdefinition_Owner owner;
    @AuraEnabled
    public String recordId;	//00O5e000008VZezEAG
    @AuraEnabled
    public String source;	//lightningReportSubscribe
    @AuraEnabled
    public List<mc_SubscriptionListDefinition_Thresholds> thresholds;
}