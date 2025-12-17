/**
 * Subscription List Definition Details wrapper class
 * 
 * Represents detailed schedule information for analytics notification subscriptions.
 * Contains days of week, time of day, week in month, and days of month.
 * 
 * @author Andy Haas
 */
public with sharing class mc_SubscriptionListDefinition_Details {
    @AuraEnabled
    public string[] daysOfWeek;
    @AuraEnabled
    public Integer timeOfDay;	//20
    @AuraEnabled
    public String weekInMonth;	//first
    @AuraEnabled
    public Integer[] daysOfMonth;
}