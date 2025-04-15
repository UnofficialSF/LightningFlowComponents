@isTest
public with sharing class StringNormaliserTest {
    @isTest
    public static void testDiacritical() {
        
        String textToNormalise = 'àáâäãåąèéêëęðçćìíîïòóôöõøùúûüÿýžźżñńšś';
        StringNormaliserInvocableAction.RequestWrapper req = new StringNormaliserInvocableAction.RequestWrapper();
        String errorMessage;

        // Test with all diacritical characters
        req.requestString1 = textToNormalise;
        req.requestString2 = textToNormalise;
        List<StringNormaliserInvocableAction.ResultWrapper> results = 
            StringNormaliserInvocableAction.normaliseText(new List<StringNormaliserInvocableAction.RequestWrapper>{req});
        errorMessage = 'The normalised string did not match the expected output for repeated diacritical characters.';
        Assert.areEqual('aaaaaaaeeeeeecciiiioooooouuuuyyzzznnss', results[0].resultString1, errorMessage);
        Assert.areEqual('aaaaaaaeeeeeecciiiioooooouuuuyyzzznnss', results[0].resultString2, errorMessage);

        // Repeated diacritical characters
        textToNormalise = 'ààááââ';
        req.requestString1 = textToNormalise;
        req.requestString2 = textToNormalise;
        List<StringNormaliserInvocableAction.ResultWrapper> results2 = 
            StringNormaliserInvocableAction.normaliseText(new List<StringNormaliserInvocableAction.RequestWrapper>{req});
        errorMessage = 'Diacritical characters should be replaced by their ASCII equivalent.';
        Assert.areEqual('aaaaaa', results2[0].resultString1, errorMessage);
        Assert.areEqual('aaaaaa', results2[0].resultString2, errorMessage);

        // Test Capital with diacritical characters
        textToNormalise = 'ÁÃAAÃÇČ';
        req.requestString1 = textToNormalise;
        req.requestString2 = textToNormalise;
        List<StringNormaliserInvocableAction.ResultWrapper> results3 = 
            StringNormaliserInvocableAction.normaliseText(new List<StringNormaliserInvocableAction.RequestWrapper>{req});
        errorMessage = 'The normalised string did not match the expected output for capital case diacritical characters.';
        Assert.areEqual('aaaaacc', results3[0].resultString1, errorMessage);
        Assert.areEqual('aaaaacc', results3[0].resultString2, errorMessage); 
    }
    
    @isTest
    public static void testNoSpaces() {
        StringNormaliserInvocableAction.RequestWrapper req = new StringNormaliserInvocableAction.RequestWrapper();
        req.requestString1 = ' Jo h   n ';
        req.requestString2 = '  D o  e ';
        req.doNoSpaces = true;

        List<StringNormaliserInvocableAction.ResultWrapper> results = 
            StringNormaliserInvocableAction.normaliseText(new List<StringNormaliserInvocableAction.RequestWrapper>{req});

        String errorMessage = 'The normalised string should return with no spaces';
        Assert.areEqual('john', results[0].resultString1, errorMessage);
        Assert.areEqual('doe', results[0].resultString2, errorMessage);
    }

    @isTest
    public static void testProperCase() {
        StringNormaliserInvocableAction.RequestWrapper req = new StringNormaliserInvocableAction.RequestWrapper();
        req.requestString1 = 'jOhN aNgeL';
        req.requestString2 = 'dOe sMIth';
        req.doProperCase = true;

        List<StringNormaliserInvocableAction.ResultWrapper> results = 
            StringNormaliserInvocableAction.normaliseText(new List<StringNormaliserInvocableAction.RequestWrapper>{req});

        String errorMessage = 'The normalised string did not return with correct capitalisation of firts letter capital and remaining lower case';
        Assert.areEqual('John Angel', results[0].resultString1, errorMessage);
        Assert.areEqual('Doe Smith', results[0].resultString2, errorMessage);
    }

    @isTest
    public static void testAlphanumeric() {
        StringNormaliserInvocableAction.RequestWrapper req = new StringNormaliserInvocableAction.RequestWrapper();
        req.requestString1 = 'Jo@hn!';
        req.requestString2 = 'Do#e$';
        req.doAlphanumeric = true;

        List<StringNormaliserInvocableAction.ResultWrapper> results = 
            StringNormaliserInvocableAction.normaliseText(new List<StringNormaliserInvocableAction.RequestWrapper>{req});

        String errorMessage = 'The normalised string did not remove all special characters returning alphanumeric only';
        Assert.areEqual('john', results[0].resultString1, errorMessage);
        Assert.areEqual('doe', results[0].resultString2, errorMessage);
    }

    @isTest
    public static void testStandardNormalisation() {
        StringNormaliserInvocableAction.RequestWrapper req = new StringNormaliserInvocableAction.RequestWrapper();
        req.requestString1 = 'jOhN !aNgeL,';
        req.requestString2 = 'dOe o\'hANNah';
        req.doProperCase = true;
        req.doAlphanumericWithSpace = true;

        List<StringNormaliserInvocableAction.ResultWrapper> results = 
            StringNormaliserInvocableAction.normaliseText(new List<StringNormaliserInvocableAction.RequestWrapper>{req});
        
        String errorMessage = 'The normalised string did not return with correct capitalisation of firts letter capital and remaining lower case and replace all special characters by a spaces, returning alphanumeric only';
        Assert.areEqual('John Angel', results[0].resultString1, errorMessage);
        Assert.areEqual('Doe O Hannah', results[0].resultString2, errorMessage);
    }

    @isTest
    public static void testAlphanumericWithSpace() {
        StringNormaliserInvocableAction.RequestWrapper req = new StringNormaliserInvocableAction.RequestWrapper();
        req.requestString1 = 'John!@2 Spaces';
        req.requestString2 = 'Doe_O\'hannah';
        req.doAlphanumericWithSpace = true;

        List<StringNormaliserInvocableAction.ResultWrapper> results = 
            StringNormaliserInvocableAction.normaliseText(new List<StringNormaliserInvocableAction.RequestWrapper>{req});

        String errorMessage = 'The normalised string did not replace all special characters by a space, returning alphanumeric only';
        Assert.areEqual('john  2 spaces', results[0].resultString1, errorMessage);
        Assert.areEqual('doe o hannah', results[0].resultString2, errorMessage);
    }

    @isTest
    public static void testEmptyString() {

        // Should return null instead of an Exception
        StringNormaliserInvocableAction.RequestWrapper req = new StringNormaliserInvocableAction.RequestWrapper();
        req.requestString1 = '';
        req.requestString2 = null;
        req.doAlphanumericWithSpace = true;
        req.doAlphanumeric = true;
        req.doNoSpaces = true;
        req.doProperCase = true;

        List<StringNormaliserInvocableAction.ResultWrapper> results = 
            StringNormaliserInvocableAction.normaliseText(new List<StringNormaliserInvocableAction.RequestWrapper>{req});

        String errorMessage = 'The normalised string did not return null';
        Assert.isNull(results[0].resultString1, errorMessage);
        Assert.isNull(results[0].resultString2, errorMessage);
    }
}