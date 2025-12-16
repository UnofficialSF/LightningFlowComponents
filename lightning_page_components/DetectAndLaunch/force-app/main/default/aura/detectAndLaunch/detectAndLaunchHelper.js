({
    /**
     * Debug logging helper - only logs if debugMode is enabled
     * @param {Component} component - The component instance
     * @param {String} message - Message to log
     * @param {*} data - Optional data to log
     */
    debugLog: function(component, message, data) {
        if (component.get("v.debugMode")) {
            if (data !== undefined) {
                console.log(message, data);
            } else {
                console.log(message);
            }
        }
    },

    processChangeEvent : function(component, eventParams) {
        this.debugLog(component, 'entering processChangeEvent');
        // Get current URL 
        // If URL contains flexipageEditor do nothing
        var currentUrl = window.location.href;
        this.debugLog(component, 'currentUrl is: ' + currentUrl);
        if (currentUrl.includes('flexipageEditor')) {
            this.debugLog(component, 'currentUrl includes flexipageEditor');
            return;
        } else {
            if(eventParams.changeType === "CHANGED") {
                this.debugLog(component, 'changeType is: ' + eventParams.changeType);
                this.callFlow(component, eventParams);
            }  else if(eventParams.changeType === "REMOVED") {
                this.debugLog(component, 'record is being deleted');
                //the other launch paths don't work well when the underlying page is deleted
                var targetUrl = '/flow/' + component.get("v.targetFlowName") + '?recordId=' + component.get("v.recordId"); //added input variable
                this.debugLog(component, 'targetURL is: ' + targetUrl);
                window.open(targetUrl);
            } else if(eventParams.changeType === "LOADED") {
                this.debugLog(component, 'changeType is: ' + eventParams.changeType);
                this.callFlow(component, eventParams);
            }
        }
    },

    callFlow : function(component, eventParams) {
        this.debugLog(component, 'entering callFlow');
        this.debugLog(component, 'changeType is: ' + eventParams.changeType);
        var flowApiName = component.get("v.targetFlowName");
        if (!flowApiName) {
            this.debugLog(component, 'flowApiName is null or undefined');
        } else {
            if(component.get("v.launchMode") === 'Modal') {
                component.set('v.openModal',true);

                //Set input variable
                var inputVariable = [
                    {
                        name : "recordId",
                        type : "String",
                        value: component.get("v.recordId")
                    }
                ];

                var flow = component.find("flow");
                // Check to see if flow is not null before calling startFlow
                if (flowApiName) {
                    this.debugLog(component, 'flow is not null', flowApiName);
                    flow.startFlow(flowApiName, inputVariable); //added input variable
                } else {
                    this.debugLog(component, 'flow is null', flow);
                }

            } else {
                //launch modelessly in a tab or browser window
                var workspaceAPI = component.find("workspace");
                var self = this;
                workspaceAPI.isConsoleNavigation().then(function(response) {
                    self.debugLog(component, 'current workspace is console? : ' + response);
                    if (response) {
                        //we are in console mode
                        workspaceAPI.getFocusedTabInfo()
                        .then(function(response) {
                            var targetUrl = '/flow/' + component.get("v.targetFlowName") + '?recordId=' + component.get("v.recordId"); //added input variable;
                            workspaceAPI.openSubtab({
                                parentTabId: response.tabId,
                                url:  targetUrl,
                                focus: true
                            })
            
                        })
                        .catch(function(error) {
                            // Critical error - always log for troubleshooting
                            console.error('Error opening subtab:', error);
                        });
                    } else {
                        self.debugLog(component, 'need to launch flow a different way');
                        var targetUrl = '/flow/' + component.get("v.targetFlowName") + '?recordId=' + component.get("v.recordId"); //added input variable;
                        self.debugLog(component, 'targetURL is: ' + targetUrl);
                        window.open(targetUrl);
                    }
                })
            }
        }
    }
    
})
