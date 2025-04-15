public class getAggregateSOQL {
	@InvocableMethod(label='Get Aggregate String List')
    public static List<List<String>> getRecords(List<InputVals> inputs) {
        List<String> outputs = new List<String>();
        if (inputs.size() > 0) {
            String query = inputs[0].query;
            String fieldname = inputs[0].fieldname;
            if (query.contains('group by')) {
                List<AggregateResult> arlist = Database.query(query);
                for (AggregateResult a : arlist) {
                    Object val = a.get(fieldname);
                    outputs.add(val.toString());
                }
            } else {
                // no results
            }
        } else {
            // no results
        }
        List<List<String>> finallist = new List<List<String>>();
        finallist.add(outputs);
        return finallist;
    }
    
    public class InputVals{
        @InvocableVariable
        public String query;
        
        @InvocableVariable
        public String fieldname;
    }
}