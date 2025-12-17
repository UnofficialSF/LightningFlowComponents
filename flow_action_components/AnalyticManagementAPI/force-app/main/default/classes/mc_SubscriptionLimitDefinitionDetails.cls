/**
 * Subscription Limit Definition Details wrapper class
 * 
 * Represents detailed subscription limit information for a user.
 * Contains maximum allowed subscriptions and remaining count.
 * 
 * @author Andy Haas
 */
public class mc_SubscriptionLimitDefinitionDetails {
    @AuraEnabled
    public Integer max;
    @AuraEnabled
    public Integer remaining;
}
