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

    /**
     * Shows an error toast notification to the user
     * @param {Component} component - The component instance
     * @param {String} title - Title of the error toast
     * @param {String} message - Error message to display
     */
    showErrorToast: function(component, title, message) {
        var notifLib = component.find("notifLib");
        if (notifLib) {
            notifLib.showToast({
                "title": title || "Error",
                "message": message,
                "variant": "error",
                "mode": "sticky"
            });
        }
        // Also log to console for debugging
        console.error(title + ":", message);
    },

    /**
     * Checks if a field value matches the expected value when a record is changed
     * @param {Component} component - The component instance
     * @param {Object} eventParams - Event parameters from force:recordData
     * @returns {Boolean} - True if field value matches, false otherwise
     */
    checkFieldValueMatch: function(component, eventParams) {
        var fieldChange = component.get("v.fieldChange");
        var fieldValue = component.get("v.fieldValue");
        
        // Check if both fieldChange and fieldValue are configured
        if (fieldChange === null || fieldChange === undefined || 
            fieldValue === null || fieldValue === undefined) {
            return false;
        }

        // Only check field values on CHANGED events
        if (eventParams.changeType !== "CHANGED") {
            return false;
        }

        // Check if changedFields exists
        if (!eventParams.changedFields) {
            return false;
        }

        // Get the field data from changed fields
        var changed = JSON.parse(JSON.stringify(eventParams.changedFields));
        var fieldKey = component.get("v.fieldCompare");
        var fieldData = changed[fieldKey];

        // Check if field exists and has a non-null value
        if (!fieldData || fieldData.value === null) {
            return false;
        }

        // Compare the field value
        var newValue = fieldData.value.toString();
        this.debugLog(component, 'changed.dynamic.value', newValue);
        
        return newValue === fieldValue;
    },

    /**
     * Processes record change events and launches appropriate flows
     * Prevents execution in page builder mode and routes to appropriate launch method
     * @param {Component} component - The component instance
     * @param {Object} eventParams - Event parameters from force:recordData
     * @param {String} eventParams.changeType - Type of change: CHANGED, REMOVED, or LOADED
     */
    processChangeEvent : function(component, eventParams) {
        this.debugLog(component, 'entering processChangeEvent');
        // Get current URL 
        // If URL contains flexipageEditor do nothing
        var currentUrl = window.location.href;
        this.debugLog(component, `currentUrl is: ${currentUrl}`);
        if (currentUrl.includes('flexipageEditor')) {
            this.debugLog(component, 'currentUrl includes flexipageEditor');
            return;
        } else {
            if(eventParams.changeType === "CHANGED") {
                this.debugLog(component, `changeType is: ${eventParams.changeType}`);
                this.callFlow(component, eventParams);
            }  else if(eventParams.changeType === "REMOVED") {
                this.debugLog(component, 'record is being deleted');
                //the other launch paths don't work well when the underlying page is deleted
                var targetUrl = `/flow/${component.get("v.targetFlowName")}?recordId=${component.get("v.recordId")}`;
                this.debugLog(component, `targetURL is: ${targetUrl}`);
                window.open(targetUrl);
            } else if(eventParams.changeType === "LOADED") {
                this.debugLog(component, `changeType is: ${eventParams.changeType}`);
                this.callFlow(component, eventParams);
            }
        }
    },

    /**
     * Launches a flow in either modal or modeless mode based on launchMode setting
     * Handles both console and standard UI navigation
     * @param {Component} component - The component instance
     * @param {Object} eventParams - Event parameters from force:recordData
     * @param {String} eventParams.changeType - Type of change: CHANGED, REMOVED, or LOADED
     */
    callFlow : function(component, eventParams) {
        this.debugLog(component, 'entering callFlow');
        this.debugLog(component, `changeType is: ${eventParams.changeType}`);
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
                // Check to see if flow component exists and flowApiName is valid before calling startFlow
                if (flow && flowApiName) {
                    this.debugLog(component, 'Starting flow:', flowApiName);
                    try {
                        flow.startFlow(flowApiName, inputVariable);
                    } catch (error) {
                        // Show error toast to user
                        var errorMessage = error.message || 'An error occurred while starting the flow.';
                        this.showErrorToast(component, 'Flow Error', 
                            `Unable to start flow "${flowApiName}". ${errorMessage}`);
                        // Close modal if flow fails to start
                        component.set('v.openModal', false);
                    }
                } else {
                    // Show error toast to user
                    if (!flow) {
                        this.showErrorToast(component, 'Configuration Error', 
                            'Flow component not found. Please contact your administrator.');
                    }
                    if (!flowApiName) {
                        this.showErrorToast(component, 'Configuration Error', 
                            'Flow name is missing or invalid. Please check the component configuration.');
                    }
                    // Close modal if we can't start the flow
                    component.set('v.openModal', false);
                }

            } else {
                //launch modelessly in a tab or browser window
                var workspaceAPI = component.find("workspace");
                var self = this;
                workspaceAPI.isConsoleNavigation().then(function(response) {
                    self.debugLog(component, `current workspace is console? : ${response}`);
                    if (response) {
                        //we are in console mode
                        workspaceAPI.getFocusedTabInfo()
                        .then(function(response) {
                            var targetUrl = `/flow/${component.get("v.targetFlowName")}?recordId=${component.get("v.recordId")}`;
                            workspaceAPI.openSubtab({
                                parentTabId: response.tabId,
                                url:  targetUrl,
                                focus: true
                            })
            
                        })
                        .catch(function(error) {
                            // Show error toast to user
                            self.showErrorToast(component, 'Navigation Error', 
                                'Unable to open flow in console. Please try again.');
                        });
                    } else {
                        self.debugLog(component, 'need to launch flow a different way');
                        var targetUrl = `/flow/${component.get("v.targetFlowName")}?recordId=${component.get("v.recordId")}`;
                        self.debugLog(component, `targetURL is: ${targetUrl}`);
                        window.open(targetUrl);
                    }
                })
            }
        }
    }
    
})
