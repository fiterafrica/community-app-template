(function (module) {
    mifosX.controllers = _.extend(module, {
        NewGroupPrequalificatoinController: function (scope, routeParams, route, dateFilter, location, resourceFactory, validationService, http, $uibModal, API_VERSION, $timeout, $rootScope, Upload) {

            scope.agenciesList = [];
            scope.portfoliosList = [];
            scope.centersList = [];
            scope.groupsList = [];
            scope.productsList = [];
            scope.facilitators = [];
            scope.yesNo = [{value: "YES", name: "Yes"}, {value: "NO", name: "No"}];
            scope.restrictDate = new Date();
            scope.formData = {};
            scope.formData.members = [];
            scope.errorMessage;
            scope.presidentSelected =false;
            scope.membersForm = {
                puente: "YES"
            };
            scope.memberDetailsForm;
            scope.groupData;
            scope.membersList = [];
            scope.tf = "HH:mm";
            scope.groupingType=routeParams.groupingType;
            scope.isAgencySelected = false;
            scope.isCenterSelected = false;

            if (routeParams.groupingType === 'group'){
                scope.previousPageUrl = "#/prequalificationGroups/group/list";
            }

            if (routeParams.groupingType === 'individual'){
                scope.previousPageUrl = "#/prequalificationGroups/individual/new";
            }

            resourceFactory.prequalificationTemplateResource.get({groupingType:routeParams.groupingType},function (data) {
                scope.agenciesList = data.agencies;
                if (data.agencies.length === 1) {
                    scope.formData.agencyId = data.agencies[0].id;
                    let facilitators = data.facilitators.filter((facilitator) => facilitator.username === scope.currentSession.user.name);
                    scope.formData.facilitator = facilitators[0].id;
                }

                scope.centersList = data.centerData;
                scope.facilitators = data.facilitators;
                scope.productsList = data.loanProducts;
                scope.formData.prequalilficationTimespan = Number(data.prequalilficationTimespan)
            });

            scope.$watch('formData.agencyId',function(){
                scope.onAgencyChange();
            });

            scope.onAgencyChange = function(){
              delete scope.formData.centerId;
              delete scope.centersList;
              resourceFactory.prequalificationTemplateResource.get({groupingType:routeParams.groupingType, agencyId: scope.formData.agencyId},function (data) {
                scope.centersList = data.centerData;
              });
            }

            scope.addMemberData = function () {
                var uiValidationErrors = [];
                if (!validationService.checkDPI(scope.membersForm.dpi)) {
                    uiValidationErrors.push({
                        message: `${scope.membersForm.dpi} DPI provided is invalid`
                    });
                } else {
                    for (var i = 0; i < scope.formData.members.length; i++ ){
                        if (scope.formData.members[i].dpi === scope.membersForm.dpi){
                             uiValidationErrors.push({message: `${scope.membersForm.dpi} DPI ya está tomada!`});
                             this.uiValidationErrors = uiValidationErrors;
                             return;
                        }
                    }
                    scope.membersForm['locale'] = scope.optlang.code;
                    scope.membersForm['dateFormat'] = scope.df;
                    scope.formData.members.push(scope.membersForm);
                    scope.membersForm = {
                       puente: "YES"
                    };
                    scope.memberDetailsForm.$setUntouched();
                    scope.memberDetailsForm.$setPristine();

                }
                this.uiValidationErrors = uiValidationErrors;
            }

           scope.removeMember = function (index) {
                scope.formData.members.splice(index,1);
           };

           scope.updatePresident = function (index) {
               let members = scope.formData.members;
               scope.presidentSelected = false;
               for (var i = 0; i < members.length; i++ ){
                   const isGroupPresident = scope.formData.members[i].groupPresident;
                   if (i === Number(index) && isGroupPresident){
                       scope.formData.members[i].groupPresident = true;
                       scope.presidentSelected = true;
                   }else{
                       scope.formData.members[i].groupPresident = false;
                   }
               }
           };

            scope.getGroupsByCenterId = function (centerId) {
                scope.groupsList = [];

                resourceFactory.centerResource.get({centerId: centerId,associations: 'groupMembers'}, function (data) {
                    scope.groupsList = data.groupMembers;
                });
            }

            scope.getGroupMembers = function (groupId) {

                resourceFactory.groupResource.get({groupId: groupId, associations: 'clientMembers'}, function (data) {
                    scope.group = data;
                    if(data.clientMembers){
                        scope.isGroupMembersAvailable = (data.clientMembers.length>0);
                        scope.membersList = data.clientMembers;
                        scope.groupData = data;

                        if (scope.groupData.meetingStartTime) {
                            scope.groupData.meetingStartTime = dateFilter(scope.groupData.meetingStartTime, scope.tf);
                        }
                        if (scope.groupData.meetingEndTime) {
                            scope.groupData.meetingEndTime = dateFilter(scope.groupData.meetingEndTime, scope.tf);
                        }
                    }
                    scope.isClosedGroup = data.status.value == 'Closed';
                    scope.staffData.staffId = data.staffId;
                });
            }

            scope.prequalifyGroup = function (){
                console.log("submitting form data")
                scope.formData.locale = scope.optlang.code;
                scope.formData.individual = false;
                scope.formData.dateFormat = scope.df;
                if (scope.membersList.length > 0){
                    let newMemberData = [];
                    for (var i = 0; i < scope.membersList.length; i++) {
                        let memberData = {};
                        memberData.clientId = scope.membersList[i].id ;
                        memberData.name = scope.membersList[i].displayName ;
                        memberData.dpi = scope.membersList[i].dpiNumber ;
                        if(scope.membersList[i].dateOfBirth){
                            memberData.dateOfBirth = dateFilter(new Date(scope.membersList[i].dateOfBirth),scope.df);
                        }
                        memberData.amount = scope.membersList[i].requestedAmount ;
                        memberData.locale = scope.optlang.code;
                        memberData.dateFormat = scope.df;
                        scope.formData.members.push(memberData)
                    }
                }

                resourceFactory.prequalificationResource.prequalifyExistingGroup({groupId: scope.formData.groupId,anotherResource:'prequalifyGroup'},this.formData, function (data) {
                    location.path('prequalification/' + data.resourceId + '/viewdetails' + '/' + routeParams.groupingType);
                });
            }

            scope.requestPrequalification = function () {
                console.log("submitting form data");
                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;
                this.formData.individual = false;
                if(scope.groupingType === 'individual'){
                    this.formData.individual = true;
                }
                scope.errorMessage = undefined;
                var groupMembers = scope.formData.members;
                if(groupMembers){
                    for (var i = 0; i < groupMembers.length; i++) {
                        if(groupMembers[i].dateOfBirth) {
                            groupMembers[i].dateFormat = scope.df;
                            groupMembers[i].locale = scope.optlang.code;
                            groupMembers[i].dob = dateFilter(new Date(groupMembers[i].dateOfBirth), scope.df);
                            delete groupMembers[i].dateOfBirth;
                        }
                    }
                }
                var request =  {...this.formData};
                request.members = groupMembers;
                resourceFactory.prequalificationResource.save(request, function (data) {
                    location.path('prequalification/' + data.resourceId + '/viewdetails' + '/' + routeParams.groupingType);
                });
            }

            scope.generatePrequalificationNumber = function (){
                var agencyId = this.formData.agencyId
                var groupId = this.formData.groupId
                return "PRECAL-"+agencyId+"-"+groupId.toString().padStart(4,"0")
            }

            scope.resolveTime = function (time) {
                let hour = time[0];
                let minute = time[1];
                let seconds = time[2];
                return hour.toString().padStart(2,"0")+':'+minute.toString().padStart(2,"0")+':'+seconds.toString().padStart(2,"0");
            }

        }
    });

    mifosX.ng.application.controller('NewGroupPrequalificatoinController', ['$scope', '$routeParams', '$route', 'dateFilter', '$location', 'ResourceFactory', 'ValidationService', '$http', '$uibModal', 'API_VERSION', '$timeout', '$rootScope', 'Upload', mifosX.controllers.NewGroupPrequalificatoinController]).run(function ($log) {
        $log.info("NewGroupPrequalificatoinController initialized");
    });
}(mifosX.controllers || {}));
