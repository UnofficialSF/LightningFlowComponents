({
    doInit: function (component, event, helper) {
        helper.hlpCheckValidity(component, event);
    },
    handleScanSuccess: function (component, event, helper) {        
        const componentA = component.find('QuickLightningLookup');
        const scannedBarcode = event.getParam('value');
        componentA.invokeLookup(scannedBarcode);
      },
      handleScanError: function (component, event, helper) {
        const errorMessage = event.getParam('detail');
        var toast = $A.get('e.force:showToast');
        if (toast) {
          //fire the toast event in Salesforce app and Lightning Experience
          toast.setParams({
            title: 'Error!',
            message: errorMessage
          });
          toast.fire();
        }
    }
});