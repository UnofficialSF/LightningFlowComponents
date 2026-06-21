# DetectAndLaunch Component - Fix Plan

Based on technical analysis and community feedback from [UnofficialSF](https://unofficialsf.com/from-andy-haas-trigger-screen-flows-with-record-changes-using-detect-and-launch/), here's a prioritized plan to fix and enhance the component.

## Priority 1: Critical Fixes (Must Fix)

### 1.1 Remove/Reduce Console Logging
**Issue**: 20+ console.log statements impact performance and expose internal logic
**Files**: `detectAndLaunchController.js`, `detectAndLaunchHelper.js`
**Action**:
- Remove all console.log statements from production code
- Add a debug mode attribute (optional)
- Keep only critical error logging

**Lines to fix**:
- Controller: 34, 41, 42, 45, 50, 59, 76, 77
- Helper: 3, 7, 9, 13, 16, 19, 22, 29, 30, 33, 50, 53, 60, 74, 77, 79

### 1.2 Fix Loose Equality Checks
**Issue**: Using `==` instead of `===` can cause unexpected type coercion
**Files**: `detectAndLaunchHelper.js`
**Action**: Replace all `==` and `!=` with `===` and `!==`

**Lines to fix**:
- Line 32: `if (flowApiName == null || flowApiName == undefined)` → `if (!flowApiName)`
- Line 35: `if(component.get("v.launchMode") == 'Modal')` → `if(component.get("v.launchMode") === 'Modal')`
- Line 39: `if(component.get("v.fieldChange") != null && component.get("v.fieldValue") != null)` → Use strict checks

### 1.3 Fix Null Value Error in Field Comparison
**Status**: ✅ **FIXED**
**Issue**: Calling `.toString()` on null field values causes runtime error
**Files**: `detectAndLaunchController.js`
**Fix Applied**: Added null check before calling toString() on field value
- Check if `fieldData` exists and `fieldData.value != null` before calling `.toString()`
- Prevents "Cannot read property 'toString' of null" errors

**Lines fixed**:
- Lines 49-56: Added proper null checking with `fieldData && fieldData.value != null`

### 1.4 Add Error Handling for Flow Launch
**Issue**: No try-catch around `flow.startFlow()` - errors not handled gracefully
**Files**: `detectAndLaunchHelper.js`
**Action**: Wrap flow.startFlow in try-catch block

**Lines to fix**:
- Line 51: Add try-catch around `flow.startFlow()`

### 1.5 Fix Modal Close Functionality (Optional Feature)
**Issue**: Modal header/footer are commented out - no way to close modal
**Files**: `detectAndLaunch.cmp`, `detectAndLaunchController.js`
**Action**: 
- Add new attribute `enableModalClose` (default: false) to avoid breaking changes
- Uncomment and fix modal header with close button, but only show when enabled
- Users must explicitly enable this feature if they want modal close functionality

**Breaking Change Consideration**: 
- This must be **disabled by default** to maintain backward compatibility
- Existing users who have built flows expecting the current modal behavior won't be affected
- Users can opt-in by setting `enableModalClose="true"`

**New attribute needed**:
```xml
<aura:attribute name="enableModalClose" type="Boolean" default="false" description="Enable close button in modal. Disabled by default to maintain backward compatibility."/>
```

**Lines to fix**:
- Lines 35-38: Conditionally show header with close button based on `enableModalClose` attribute
- Ensure closeModal controller method works properly

## Priority 2: Important Improvements (Should Fix)

### 2.1 Make Input Variable Name Configurable
**Status**: ❌ **Won't Fix** - Doesn't align with component design

**Issue**: Hardcoded "recordId" input variable name - assumes all flows use this
**Reason for Not Implementing**: 
- The component is designed to watch a specific record and launch flows based on record changes
- The component inherits `force:hasRecordId` and is fundamentally built around the recordId context
- Making the input variable configurable would conflict with the component's core purpose of detecting and responding to changes on the watched record
- Users who need different input variables should use the recordId in their flows and map it to their desired variable names

**Decision**: Keep hardcoded "recordId" as it's central to the component's functionality

### 2.2 Improve Code Readability with Template Literals
**Issue**: String concatenation is harder to read and maintain
**Files**: `detectAndLaunchHelper.js`
**Action**: Replace string concatenation with template literals

**Lines to fix**:
- Line 18: `/flow/${component.get("v.targetFlowName")}?recordId=${component.get("v.recordId")}`
- Line 65: Same pattern
- Line 78: Same pattern

### 2.3 Refactor Field Watching Logic
**Issue**: Complex nested conditionals in recordUpdated method
**Files**: `detectAndLaunchController.js`
**Action**: Extract field value matching logic to helper method

**New helper method needed**:
```javascript
checkFieldValueMatch: function(component, eventParams) {
    // Extract the complex field matching logic here
}
```

### 2.4 Add Input Validation
**Issue**: No validation that flow names are valid or flows are active
**Files**: `detectAndLaunchController.js`, `detectAndLaunchHelper.js`
**Action**: Add validation before attempting to launch flows

**Validation needed**:
- Check if flow name is provided
- Check if flow name is not empty
- Optionally: Validate field API names

### 2.5 Fix Modal Height Issue
**Issue**: Hardcoded 600px height - not responsive
**Files**: `detectAndLaunch.cmp`
**Action**: Use responsive CSS classes or remove fixed height

**Lines to fix**:
- Line 31: Remove `style="height: 600px;"` or make it responsive

## Priority 3: Enhancements (Nice to Have)

### 3.1 Support Multiple Field Conditions
**Issue**: Can only watch one field at a time
**Files**: All component files
**Action**: Add support for multiple field/value pairs (requires significant refactoring)

**Note**: This is a major enhancement, consider as separate feature request

### 3.2 Support Conditional Launch on Load/Delete
**Status**: ❌ **Cannot be Supported**

**Issue**: Conditional field-based launch only works on edit (per blog post limitations)
**Reason**: 
- The component architecture is designed to watch record changes and evaluate field conditions during edit events
- LOADED events don't have "changedFields" data to compare against
- REMOVED events occur when the record is deleted, so field value comparisons aren't meaningful
- This limitation is by design and cannot be supported with the current architecture

**Decision**: Keep as documented limitation - conditional field-based launch only works on CHANGED events

### 3.3 Add JSDoc Documentation
**Issue**: No function documentation
**Files**: All JS files
**Action**: Add JSDoc comments to all functions

**Example**:
```javascript
/**
 * Processes record change events and launches appropriate flows
 * @param {Component} component - The component instance
 * @param {Object} eventParams - Event parameters from force:recordData
 */
processChangeEvent: function(component, eventParams) {
    // ...
}
```

### 3.4 Update API Version
**Issue**: Using API version 48.0 (from 2020)
**Files**: `detectAndLaunch.cmp-meta.xml`
**Action**: Test and update to latest API version (currently 62.0+)

**Note**: Test thoroughly before updating

### 3.5 Add User Feedback for Errors
**Issue**: Errors are only logged to console
**Files**: `detectAndLaunchController.js`, `detectAndLaunchHelper.js`
**Action**: Add toast messages or error display for user-facing errors

## Implementation Order

### Phase 1: Critical Fixes (Week 1)
1. ✅ Fix null value error in field comparison (COMPLETED)
2. Remove console logging
3. Fix equality checks
4. Add error handling for flow launch
5. Fix modal close functionality (as optional feature, disabled by default)

### Phase 2: Important Improvements (Week 2)
1. Use template literals
2. Refactor field watching logic
3. Add input validation
4. Fix modal height

### Phase 3: Enhancements (Week 3+)
1. Add documentation
2. Update API version
3. Add user feedback
4. Consider major enhancements (multiple fields)

## Testing Checklist

After each fix, test:
- [ ] Record edit detection
- [ ] Record delete detection
- [ ] Record load detection
- [ ] Field value conditional launch
- [ ] Modal launch mode
- [ ] Modeless launch mode
- [ ] Console navigation
- [ ] Standard UI navigation
- [ ] Page builder mode (should not execute)
- [ ] Error scenarios (invalid flow name, missing flow, etc.)
- [ ] Multiple component instances on same page

## Known Limitations (From Blog Post)

These are documented limitations, not bugs:
1. **Cross-field comparisons not supported** - Change Value must be static
2. **Conditional launch only on edit** - Conditional field-based launch only works on CHANGED events, not LOADED or REMOVED (by design - cannot be supported)
3. **Modal close function** - Users need to build close function in flow (now optional via `enableModalClose` attribute, disabled by default)
4. **Input variable name** - Hardcoded to "recordId" (by design - component is built around recordId context)

## References

- [UnofficialSF Blog Post](https://unofficialsf.com/from-andy-haas-trigger-screen-flows-with-record-changes-using-detect-and-launch/)
- Component Analysis: `ANALYSIS.md`
- Component Source: `force-app/main/default/aura/detectAndLaunch/`

