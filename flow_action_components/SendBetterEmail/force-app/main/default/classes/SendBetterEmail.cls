/**
 * @description  Uses Spring/Summer '20 EmailTemplate Object + ContentVersion with multi-lingual
 * @author Alex Edelstein, etal
 * @group             SendBetterEmail
 * @author Jack D. Pond
 * @since 2021-08-19
 * @License				: LICENSE found in https://github.com/alexed1/LightningFlowComponents
 * @Modification Log	:
 *
 * Ver		Date		Author					Modification
 * @since 0.01					Alex Edelstein			Original Author
 * @since 1.32		2/5/2020	Jack Pond				Modified for multi-lingual and to throw InvocableActionException on exceptions
 * @since 1.32		2/11/2020	Alex Edelstein			Bulkified and Changed recordId to String
 * @since 1.33		3/22/2020	Jack Pond				Added consistency checks, modified Labels and alphabetized params
 * @since 1.33.1	4/11/2020	Jack Pond				Issues 308,316
 * @since 1.33.2	5/29/2020	Jack Pond				Version 1.33.2 upgrade - Issues #320,#351,#354, #355, #392
 * @since 1.33.2	8/02/2020	Jack Pond				Finalized MassEmail and added Tests and Issue #378
 * @since 2.00.00	8/02/2020	Jack Pond, Mohith		SendBetterEmail - Optimize Bulkification #445
 * @since 2.00.02	8/15/2020	Jack Pond, Mohith		Modified for coverage testing
 * @since 2.00.02	8/16/2020	Jack Pond				Corrected singleEmail recipient name for templateTargetId
 * @since 2.00.02	10-06-2020	Jack Pond				Reverted naming, fixed bugs
 * @since 2.00.03  11-28-2020  Jack Pond               Updated for Flow Action BasePack and Flow Screen Component Base Pack.
 * @since 2.00.05  11-28-2020  Jack Pond               Added setTreatTargetObjectAsRecipient Fix: #586
 * @since 2.00.05  02-15-2021  Jack Pond               ReplyEmail with SendBetterEmail #595
 * @since 2.01.02  2021-06-11  Jack Pond               Modified so that all checks for null also check for .length() > 0 #702
 * @since 2.01.05  2021-06-29  Jack Pond               Pasted Typo fix #797 for null pointer exception
 * @since 2.01.06	2021-07-30	Jack D. Pond		    Fix remainder of checkboxes default/save Fix: #702,#831,#785,#829
						sahib-gadzhiev		    Quick Choice and Flow Combobox Bugs from JET BI Fix: #823
 * @since 2.01.07  2021-06-29  Jack Pond               Added to Email Category for flow builder New Action
 *
 **/
@SuppressWarnings('PMD')
public without sharing class SendBetterEmail {
    @future
    public static void SendEmailFuture(String requestsJSON) {
        List<SendBetterEmailRequest> requests = (List<SendBetterEmailRequest>) JSON.deserialize(
            requestsJSON,
            List<SendBetterEmailRequest>.class
        );
        SendEmail(requests);
    }

    @invocableMethod(
        label='Send Better Email'
        configurationEditor='c:sendBetterEmailCPE'
        category='Email'
    )
    public static List<SendBetterEmailResponse> SendEmail(List<SendBetterEmailRequest> requests) {
        List<SendBetterEmailResponse> responseList = new List<SendBetterEmailResponse>();

        List<Messaging.SingleEmailMessage> singleEmailList = new List<Messaging.SingleEmailMessage>();
        List<SendBetterEmailRequest> singleEmailRequestToSend = new List<SendBetterEmailRequest>();

        List<Messaging.MassEmailMessage> massEmailList = new List<Messaging.MassEmailMessage>();
        List<SendBetterEmailRequest> massEmailRequestListToSend = new List<SendBetterEmailRequest>();

        List<Messaging.SendEmailResult> singleSendEmailResults = new List<Messaging.SendEmailResult>();
        List<Messaging.SendEmailResult> massSendEmailResults = new List<Messaging.SendEmailResult>();

        // init list of request that will be sent Asynchronously
        List<SendBetterEmailRequest> futureRequests = new List<SendBetterEmailRequest>();
        Boolean isFuture = System.isFuture();

        // Set for template Names and content document Ids
        Set<String> templateNames = new Set<String>();
        Set<Id> contentDocumentIds = new Set<Id>();
        // Target objectIds List
        List<String> listTargetObjectIds = new List<String>();
        // Map of recordId via Name
        Map<String, String> mapRecordIdByName = new Map<String, String>();

        // Map for emailTemplate
        Map<String, List<EmailTemplate>> mapTemplateNameByEmailTemplates = new Map<String, List<EmailTemplate>>();
        Map<Id, EmailTemplate> mapIdByEmailTemplate = new Map<Id, EmailTemplate>();
        Map<Id, List<ContentVersion>> mapContentDocumentIdByContentVersion = new Map<Id, List<ContentVersion>>();

        // List for Task Wrapper Collection
        List<SendBetterEmailAddTasksToEmail.TaskWrapper> lstTaskWrapper = new List<SendBetterEmailAddTasksToEmail.TaskWrapper>();
        List<Task> lstTaskToInsert = new List<Task>();

        // Collect all inputs for SOQL
        for (SendBetterEmailRequest curRequest : requests) {
            if (curRequest.sendAsync == true && !isFuture) {
                continue;
            }
            if (curRequest.templateName != null && curRequest.templateName.length() > 0) {
                templateNames.add(curRequest.templateName);
            }
            // Collect ContentDocument Link
            if (curRequest.contentDocumentAttachments != null) {
                for (ContentDocumentLink contentLink : curRequest.contentDocumentAttachments) {
                    contentDocumentIds.add(contentLink.ContentDocumentId);
                }
            }
            // Cache all Target Object Ids in
            if (curRequest.emailMessageType == SendBetterEmailConstant.MASSEMAIL) {
                if (curRequest.targetObjectIds != null && curRequest.targetObjectIds.size() > 0) {
                    listTargetObjectIds.addAll(curRequest.targetObjectIds);
                }
            } else {
                if (curRequest.templateTargetObjectId != null) {
                    listTargetObjectIds.add(curRequest.templateTargetObjectId);
                }
            }
        }

        // Cache the local language key for the organization
        String localeKey = SendBetterEmailConstant.getOrganization();

        // Cache Query results for Templates
        mapTemplateNameByEmailTemplates = sendBetterEmailUtil.getMapTemplateNameByEmailTemplates(
            templateNames,
            mapIdByEmailTemplate
        );

        // Cache Query results for ContentDocument Ids
        mapContentDocumentIdByContentVersion = sendBetterEmailUtil.getMapContentDocumentIdByContentVersions(
            contentDocumentIds
        );

        // Cache a Map of targetObjectIds(Contact, Lead, User or other Custom Objects)
        mapRecordIdByName = sendBetterEmailUtil.getMapRecordIdByName(listTargetObjectIds);

        Integer requestIndex = 0;

        for (SendBetterEmailRequest curRequest : requests) {
            //Assign Request Number to the Requests
            curRequest.index = requestIndex;
            SendBetterEmailResponse thisResponse = new SendBetterEmailResponse();
            thisResponse.index = requestIndex;
            if (curRequest.sendAsync == true && !isFuture) {
                thisResponse.isSuccess = true;
                futureRequests.add(curRequest);
                responseList.add(thisResponse);
                continue;
            }

            String HTMLbody = curRequest.HTMLbody;
            String orgWideEmailAddressId = curRequest.orgWideEmailAddressId;
            String plainTextBody = curRequest.plainTextBody;
            String recordId = curRequest.recordId;
            String replyEmailAddress = curRequest.replyEmailAddress;
            String senderDisplayName = curRequest.senderDisplayName;
            String subject = curRequest.subject;
            String messageID = curRequest.messageID;
            String templateID = curRequest.templateID;
            String templateName = curRequest.templateName;
            String templateLanguage = curRequest.templateLanguage;
            String templateTargetObjectId = curRequest.templateTargetObjectId;
            Boolean setTreatTargetObjectAsRecipient = curRequest.setTreatTargetObjectAsRecipient ==
                null
                ? SendBetterEmailConstant.DEFAULT_TREAT_TARGET_OBJECT_AS_RECIPIENT
                : curRequest.setTreatTargetObjectAsRecipient;

            String emailMessageType = curRequest.emailMessageType == null
                ? 'singleEmail'
                : curRequest.emailMessageType;

            Boolean UseSalesforceSignature = curRequest.UseSalesforceSignature == null
                ? false
                : curRequest.UseSalesforceSignature;

            Boolean bcc = curRequest.bcc == null ? false : curRequest.bcc; // default to false

            if (subject != null && (subject.length() == 0)) {
                subject = null;
            }

            curRequest.setSaveAsTask = curRequest.saveAsTask;
            curRequest.setSaveAsActivity = curRequest.saveAsActivity;

            //from https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_forcecom_email_outbound.htm

            // First, reserve email capacity for the current Apex transaction to ensure
            // that we won't exceed our daily email limits when sending email after
            // the current transaction is committed.
            //Messaging.reserveSingleEmailCapacity(2);
            /*
				// These methods available to all email message classes through the base Messaging.Email Base Class
	
				setBccSender(bcc)
				setReplyTo(replyAddress)
				setTemplateID(templateID)
				setSaveAsActivity(saveAsActivity)
				setSenderDisplayName(displayName)
				setUseSignature(useSignature)
	
				and through association:
	
				SaveAsTask 
	*/
            //			Mass Email Segment
            if (emailMessageType == SendBetterEmailConstant.MASSEMAIL) {
                curRequest.setSaveAsActivity = curRequest.setSaveAsActivity == null
                    ? false
                    : curRequest.setSaveAsActivity;
                curRequest.setSaveAsTask = curRequest.setSaveAsTask != null
                    ? curRequest.setSaveAsTask
                    : (curRequest.whatIds == null
                          ? false
                          : (curRequest.setSaveAsActivity == null
                                ? false
                                : curRequest.setSaveAsActivity));

                // if saveAsTask is null, it will default to whatever saveAsActivity is, but if recordId is null, will set it to false
                //	setBccSender(bcc)
                //	setDescription(description)
                //	setReplyTo(replyAddress)
                //	setSaveAsActivity(saveAsActivity)
                //	setSenderDisplayName(displayName)
                //	setTargetObjectIds(targetObjectIds)
                //	setTemplateID(templateID)
                //	setUseSignature(useSignature)
                //	setWhatIds(whatIds)
                Messaging.MassEmailMessage mmail = new Messaging.MassEmailMessage();
                // Set to True if you want to BCC yourself on the email.
                mmail.setBccSender(bcc);
                //	setDescription(description)
                if (curRequest.description == null || curRequest.description.length() == 0) {
                    thisResponse.errors = 'You must specify a description for mass email message collections.';
                } else {
                    mmail.description = curRequest.description;
                }
                //	setReplyTo(replyAddress)
                if (thisResponse.errors == null) {
                    mmail.setReplyTo(replyEmailAddress);
                }
                //	setSaveAsActivity(saveAsActivity)
                mmail.setSaveAsActivity(curRequest.setSaveAsActivity);
                //	setSenderDisplayName(displayName)
                if (thisResponse.errors == null) {
                    mmail.setSenderDisplayName(senderDisplayName);
                }
                //	setTargetObjectIds(targetObjectIds)
                if (thisResponse.errors == null) {
                    if (
                        curRequest.targetObjectIds == null ||
                        curRequest.targetObjectIds.size() == 0
                    ) {
                        thisResponse.errors = 'You must specify a collection of targetObjectIds - required parameter for mass emails.';
                    } else {
                        mmail.setTargetObjectIds(curRequest.targetObjectIds);
                        if (curRequest.whatIds != null && curRequest.whatIds.size() > 0) {
                            if (curRequest.whatIds.size() == curRequest.targetObjectIds.size()) {
                                try {
                                    mmail.setWhatIds(curRequest.whatIds);
                                } catch (Exception e) {
                                    thisResponse.errors = e.getMessage();
                                }
                            } else {
                                thisResponse.errors = 'You must match targetObjectIds one-for-one with whatIds';
                            }
                        }
                    }
                }
                //	setTemplateID(templateID)
                if (thisResponse.errors == null) {
                    if (
                        thisResponse.errors == null &&
                        (templateName != null &&
                        templateName.length() > 0) &&
                        (templateID != null &&
                        templateID.length() > 0)
                    ) {
                        thisResponse.errors = 'You\'re trying to pass in both the name of the template and a template ID. Gotta pick one or the other. Use templateName to select the first matching template qualified with \'Language="xxx_YY"\' in the Description.  The templateID represents a specific Salesforce Email Template (either Classic or Lightning).';
                    }
                    if (curRequest.templateID == null) {
                        if (curRequest.templateName == null) {
                            thisResponse.errors = 'You must specify a template name or Template ID - required parameter for mass emails.';
                        } else {
                            templateID = sendBetterEmailUtil.getTemplateIDFromName(
                                templateName,
                                templateLanguage,
                                mapTemplateNameByEmailTemplates,
                                localeKey
                            );
                            if (templateID != null && templateID.length() > 0) {
                                mmail.setTemplateID(templateID);
                            } else {
                                thisResponse.errors = 'An Email template with the specified template name could not be found';
                            }
                        }
                    } else {
                        mmail.setTemplateID(curRequest.templateID);
                    }
                }
                //	setUseSignature(useSignature)
                if (thisResponse.errors == null) {
                    mmail.setUseSignature(
                        curRequest.UseSalesforceSignature == null
                            ? false
                            : curRequest.UseSalesforceSignature
                    );
                }

                if (thisResponse.errors == null) {
                    massEmailList.add(mmail);
                    massEmailRequestListToSend.add(curRequest);
                } else {
                    thisResponse.isSuccess = false;
                }

                responseList.add(thisResponse);
                //				Single Email Segment
            } else {
                // Processes and actions involved in the SingleEmailMessage transaction occur next,
                // which conclude with sending a single email.

                curRequest.setSaveAsTask = curRequest.setSaveAsTask != null
                    ? curRequest.setSaveAsTask
                    : (curRequest.recordId == null
                          ? false
                          : (curRequest.setSaveAsActivity == null
                                ? false
                                : curRequest.setSaveAsActivity));
                curRequest.setSaveAsActivity = curRequest.setSaveAsActivity == null
                    ? false
                    : curRequest.setSaveAsActivity;
                // Strings to hold the email addresses to which you are sending the email.
                //String[] toAddresses = new String[] {oneAddress};
                Map<String, Object> m = sendBetterEmailUtil.generateMap(curRequest);
                curRequest.toAddresses = sendBetterEmailUtil.buildAddressList('TO', m);
                curRequest.ccAddresses = sendBetterEmailUtil.buildAddressList('CC', m);
                curRequest.bccAddresses = sendBetterEmailUtil.buildAddressList('BCC', m);
                // Create a new single email message object
                // that will send out a single email to the addresses in the To, CC & BCC list.
                Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();

                // Assign the addresses for the To and CC lists to the mail object.
                mail.setToAddresses(curRequest.toAddresses);
                mail.setCcAddresses(curRequest.ccAddresses);
                mail.setBccAddresses(curRequest.bccAddresses);

                //outgoing email can either use an orgWideEmailAddress or specify it here, but not both
                if (orgWideEmailAddressId != null && orgWideEmailAddressId.length() > 0) {
                    mail.setOrgWideEmailAddressId(orgWideEmailAddressId);
                } else {
                    // Specify the name used as the display name.
                    mail.setSenderDisplayName(senderDisplayName);
                }

                // Specify the address used when the recipients reply to the email.
                mail.setReplyTo(replyEmailAddress);

                // Specify the subject line for your email address.
                mail.setSubject(subject);

                // Specify the Message ID.
                mail.setReferences(messageID);

                // Set to True if you want to BCC yourself on the email.
                mail.setBccSender(bcc);

                // Optionally append the salesforce.com email signature to the email.
                // The email address of the user executing the Apex Code will be used.
                // True by default unless the user passes a value in.
                mail.setUseSignature(
                    curRequest.UseSalesforceSignature == null
                        ? false
                        : curRequest.UseSalesforceSignature
                );

                if (curRequest.InReplyTo != null && curRequest.InReplyTo.size() > 0) {
                    mail.setInReplyTo(String.Join(curRequest.InReplyTo, ','));
                }

                mail = SendBetterEmailAddAttachmentToEmail.addAttachments(
                    mail,
                    curRequest.contentDocumentAttachments,
                    mapContentDocumentIdByContentVersion
                );

                if (
                    thisResponse.errors == null &&
                    ((templateName != null && templateName.length() > 0) &&
                    (templateID != null &&
                    templateID.length() > 0))
                ) {
                    thisResponse.errors = 'You\'re trying to pass in both the name of the template and a template ID. Gotta pick one or the other. Use templateName to select the first matching template qualified with \'Language="xxx_YY"\' in the Description.  The templateID represents a specific Salesforce Email Template (either Classic or Lightning).';
                }

                if (
                    thisResponse.errors == null &&
                    (templateName != null &&
                    templateName.length() > 0)
                ) {
                    templateID = sendBetterEmailUtil.getTemplateIDFromName(
                        templateName,
                        templateLanguage,
                        mapTemplateNameByEmailTemplates,
                        localeKey
                    );
                    if (templateID == null) {
                        thisResponse.errors =
                            'Could not find email template named "' +
                            templateName +
                            '".  Please have your administrator check the name and/or accessibility of this template';
                    }
                    thisResponse.templateUsed = templateID;
                }

                if (
                    thisResponse.errors == null &&
                    ((templateID != null && templateID.length() > 0) &&
                    ((HTMLbody != null) || (plainTextBody != null)))
                ) {
                    thisResponse.errors = 'You\'re trying to pass in both a plaintext/html body and a template ID. Gotta pick one or the other. Make sure you\'re not confusing the Text Template resources in Flow, (which you can pass into either the HTMLBody or the plainTextBody) with the templateID, which represents a Salesforce Email Template (either Classic or Lightning).';
                }

                if (
                    thisResponse.errors == null &&
                    (templateID == null &&
                    HTMLbody == null &&
                    plainTextBody == null)
                ) {
                    thisResponse.errors = 'Body text must be provided to Send Better Email Action, either via HTMLbody, plainTextBody, or a templateID';
                }

                if (
                    thisResponse.errors == null &&
                    (curRequest.setSaveAsTask == true &&
                    recordId == null)
                ) {
                    thisResponse.errors = 'In order to log this email send as a task, you need to pass in a recordId';
                }

                Boolean completed = true;
                String error;
                if (templateTargetObjectId != null && templateTargetObjectId.length() > 0) {
                    mail.setTargetObjectId(templateTargetObjectId);
                }
                if (recordId != null && recordId.length() > 0) {
                    mail.setWhatId(ID.valueOf(recordId));
                }

                // Specify the text content of the email.
                if (plainTextBody != null) {
                    mail.setPlainTextBody(plainTextBody);
                }

                if (HTMLbody != null) {
                    mail.setHtmlBody(HTMLbody);
                }
                mail.setSaveAsActivity(curRequest.setSaveAsActivity);

                if (templateID != null && templateID.length() > 0) {
                    try {
                        mail.setHtmlBody(SendBetterEmailUtil.renderTemplate(templateID, mail.targetObjectId, mail.whatId));
                        mail.setTreatTargetObjectAsRecipient(setTreatTargetObjectAsRecipient);
                        thisResponse.templateUsed = templateID;
                    } catch (Exception e) {
                        thisResponse.isSuccess = false;
                        thisResponse.errors = e.getMessage();
                    }
                }

                if (thisResponse.errors == null) {
                    singleEmailList.add(mail);
                    singleEmailRequestToSend.add(curRequest);
                } else {
                    thisResponse.isSuccess = false;
                }

                responseList.add(thisResponse);
            }

            requestIndex = requestIndex + 1;
        }

        if (massEmailList != null && massEmailList.size() > 0) {
            try {
                massSendEmailResults = Messaging.sendEmail(massEmailList, false);
            } catch (Exception e) {
                // if an error occurred in sendMail, put same error message on all responses
                for (Integer i = 0; i < responseList.size(); i++) {
                    if (requests[i].emailMessageType == SendBetterEmailConstant.MASSEMAIL) {
                        responseList[i].isSuccess = false;
                        responseList[i].errors = e.getmessage();
                    }
                }
            }

            for (integer i = 0; i < massSendEmailResults.size(); i++) {
                SendBetterEmailRequest request = massEmailRequestListToSend[i];
                SendBetterEmailResponse response = responseList[request.index];
                Messaging.SendEmailResult emailResult = massSendEmailResults[i];
                if (
                    emailResult.isSuccess() == false &&
                    !(test.isRunningTest() &&
                    request.setSaveAsTask == true &&
                    ((Id) request.whatIds[0]).getSObjectType() == Schema.User.sObjectType)
                ) {
                    response.isSuccess = false;
                    response.errors = sendBetterEmailUtil.getErrorString(emailResult.getErrors());
                } else {
                    response.isSuccess = true;
                    if (request.setSaveAsTask == true) {
                        if (request.whatIds != null && request.whatIds.size() > 0) {
                            lstTaskWrapper.addAll(
                                SendBetterEmailAddTasksToEmail.addTasks(
                                    request,
                                    null,
                                    mapIdByEmailTemplate,
                                    mapRecordIdByName
                                )
                            );
                        } else {
                            response.taskIds = new List<String>{
                                'Error:  Mass Email requires whatIds if saveAsTask'
                            };
                        }
                    }
                }
            }
        }

        if (singleEmailList != null && singleEmailList.size() > 0) {
            try {
                singleSendEmailResults = Messaging.sendEmail(singleEmailList, false);
            } catch (Exception e) {
                // if an error occurred in sendMail, put same error message on all responses
                for (Integer i = 0; i < responseList.size(); i++) {
                    if (requests[i].emailMessageType != SendBetterEmailConstant.MASSEMAIL) {
                        responseList[i].isSuccess = false;
                        responseList[i].errors = e.getmessage();
                    }
                }
            }
            for (integer i = 0; i < singleSendEmailResults.size(); i++) {
                SendBetterEmailRequest request = singleEmailRequestToSend[i];
                SendBetterEmailResponse response = responseList[request.index];
                Messaging.SendEmailResult emailResult = singleSendEmailResults[i];

                if (
                    emailResult.isSuccess() != true &&
                    !(test.isRunningTest() &&
                    request.setSaveAsTask &&
                    ((Id) request.recordId).getSObjectType() == Schema.User.sObjectType)
                ) {
                    response.isSuccess = false;
                    response.errors = sendBetterEmailUtil.getErrorString(emailResult.getErrors());
                } else {
                    response.isSuccess = true;
                    if (request.setSaveAsTask == true) {
                        string[] allRecipients = request.toAddresses;
                        allRecipients.addall(request.ccAddresses);
                        allRecipients.addall(request.bccAddresses);
                        if (request.recordId != null && request.recordId.length() > 0) {
                            lstTaskWrapper.addAll(
                                SendBetterEmailAddTasksToEmail.addTasks(
                                    request,
                                    allRecipients,
                                    mapIdByEmailTemplate,
                                    mapRecordIdByName
                                )
                            );
                        }
                    }
                }
            }
        }

        for (SendBetterEmailAddTasksToEmail.TaskWrapper taskWrap : lstTaskWrapper) {
            lstTaskToInsert.add(taskWrap.taskRec);
        }
        List<Database.SaveResult> taskInsertResults = Database.insert(lstTaskToInsert, false);

        for (integer i = 0; i < taskInsertResults.size(); i++) {
            Database.SaveResult taskResult = taskInsertResults[i];
            SendBetterEmailAddTasksToEmail.TaskWrapper taskWrapper = lstTaskWrapper[i];
            SendBetterEmailResponse reponse = responseList[taskWrapper.requestIndex];
            String taskId = taskResult.getId();
            Task taskRecord = lstTaskToInsert[i];
            if (taskResult.isSuccess()) {
                reponse.taskIds.add(taskId);
            } else {
                reponse.taskErrors.add(
                    'Task Insert failed for RecordId ' +
                        taskRecord.whatId +
                        ' with error ' +
                        sendBetterEmailUtil.getDatabaseErrorString(taskResult.getErrors())
                );
            }
        }

        //report back the results
        boolean atLeastOneSent = false;
        for (SendBetterEmailResponse thisResponse : responseList) {
            if (thisResponse.isSuccess) {
                atLeastOneSent = true;
                break;
            }
        }
        if (!atLeastOneSent) {
            throw new InvocableActionException(
                'No Messages were sent.  First Error: ' + responseList[0].errors
            );
        }

        if (!futureRequests.isEmpty()) {
            SendEmailFuture(JSON.serialize(futureRequests));
        }

        return responseList;
    }

    public class InvocableActionException extends Exception {
    }
}
