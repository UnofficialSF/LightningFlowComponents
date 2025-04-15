public with sharing class GetNextFiveRecords {
    
    @InvocableMethod(label='Get Next 5 Records')
    public static List<OutputVals> getRecords(List<InputVals> inputs) {
        List<OutputVals> outputs = new List<OutputVals>();
        OutputVals output = new OutputVals();
        if (inputs.size() > 0) {
            InputVals input = inputs[0];
            if (input.listOfRecs != null && input.counter != null && input.listOfRecs.size() >= input.counter) {
                output.totalNumRecs = input.listOfRecs.size();
                integer currentCounter = input.counter;
                integer endCounter = Math.min(currentCounter+5, input.listOfRecs.size()) - currentCounter;
                output.newCounter = currentCounter + endCounter;
                output.foundCount = endCounter;
                output.percent = Math.round(currentCounter / output.totalNumRecs);
                for (integer i = 0; i < endCounter; i++) {
                    
                    switch on (i) {
                        when 0 {
                            output.firstRec = input.listOfRecs[i+currentCounter];
                        }
                        when 1 {
                            output.secondRec = input.listOfRecs[i+currentCounter];
                        }
                        when 2 {
                            output.thirdRec = input.listOfRecs[i+currentCounter];
                        }
                        when 3 {
                            output.fourthRec = input.listOfRecs[i+currentCounter];
                        }
                        when 4 {
                            output.fifthRec = input.listOfRecs[i+currentCounter];
                        }
                    }
                    
                }
            } else {
                // empty list sent
                output.totalNumRecs = -1;
                output.newCounter = -1;
                output.foundCount = -1;
                output.percent = -1;
            }
            
            
        } else {
            output.foundCount = -1;
            output.newCounter = -1;
            output.totalNumRecs = -1;
            output.percent = -1;
        }
        outputs.add(output);
        return outputs;
    }
    
    public class InputVals{
        @InvocableVariable
        public integer counter;
        
        @InvocableVariable
        public List<SObject> listOfRecs;
    }
    
    public class OutputVals{
        @InvocableVariable
        public integer totalNumRecs;
        
        @InvocableVariable
        public integer foundCount;
        
        @InvocableVariable
        public integer newCounter;
        
        @InvocableVariable
        public SObject firstRec;
        
        @InvocableVariable
        public SObject secondRec;
        
        @InvocableVariable
        public SObject thirdRec;
        
        @InvocableVariable
        public SObject fourthRec;
        
        @InvocableVariable
        public SObject fifthRec;
        
        @InvocableVariable
        public integer percent;
    }

}