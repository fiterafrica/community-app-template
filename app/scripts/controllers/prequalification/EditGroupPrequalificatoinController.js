(function (module) {
    mifosX.controllers = _.extend(module, {
        EditGroupPrequalificatoinController: function (scope, routeParams, route, dateFilter, location, resourceFactory, validationService, http, $uibModal, API_VERSION, $timeout, $rootScope, Upload) {

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
            scope.membersForm = {
                workWithPuente: "YES"
            };
            scope.memberDetailsForm;
            scope.groupData;
            scope.membersList = [];
            scope.tf = "HH:mm";
            scope.groupingType=routeParams.groupingType;
            scope.presidentSelected =false;

            if (routeParams.groupingType === 'group'){
                scope.previousPageUrl = "#/prequalificationGroups/group/list";
            }

            if (routeParams.groupingType === 'individual'){
                scope.previousPageUrl = "#/prequalificationGroups/individual/new";
            }

            resourceFactory.prequalificationResource.get({groupId: routeParams.groupId}, function (data) {
                console.log("Make call for prequalification");
                //scope.offices = data.allowedParents;
                scope.id = data.id;
                if (data.openingDate) {
                    var editDate = dateFilter(data.openingDate, scope.df);
                    scope.first.date = new Date(editDate);
                }

                if(data.groupMembers){
                    data.groupMembers.forEach(member => {
                        if (member.dob) {
                            var dobDate = dateFilter(member.dob, scope.df);
                            member.dateOfBirth = new Date(dobDate);
                        }
                        if(member.groupPresident){
                            scope.presidentSelected = true;
                        }

                        if (Number(member.requestedAmount) != Number(member.originalAmount)) {
                            member.canUpdate = false;
                        }else{
                            member.canUpdate = true;
                        }
                    });
                }
                scope.formData =
                {
                    agencyId: data.agencyId,
                    productId: data.productId,
                    centerId: data.centerId,
                    facilitator: data.facilitatorId,
                    groupName: data.groupName,
                    prequalificationNumber: data.prequalificationNumber,
                    prequalilficationTimespan: data.prequalilficationTimespan,
                    members: data.groupMembers

                }
            });

            resourceFactory.prequalificationTemplateResource.get({groupingType:routeParams.groupingType},function (data) {
                scope.agenciesList = data.agencies;
                scope.centersList = data.centerData;
                scope.productsList = data.loanProducts;
                scope.facilitators = data.facilitators;
            });

            scope.$watch('formData.agencyId',function(){
                scope.onAgencyChange();
            });

            scope.onAgencyChange = function(){
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
                    scope.membersForm['locale'] = scope.optlang.code;
                    scope.membersForm['dateFormat'] = scope.df;
                    scope.formData.members.push(scope.membersForm);
                    scope.membersForm = {
                       workWithPuente: "YES"
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
                            memberData.dob = dateFilter(new Date(scope.membersList[i].dateOfBirth),scope.df);
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
                console.log("submitting form data")
                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;
                this.formData.individual = false;

                if(scope.groupingType === 'individual'){
                    this.formData.individual = true;
                }

                console.log(this.formData);

                resourceFactory.prequalificationResource.save(this.formData, function (data) {
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

            scope.updatePreQualification = function () {
                console.log("submitting form data for update");
                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;
                this.formData.individual = false;
                if(scope.groupingType === 'individual'){
                    this.formData.individual = true;
                }
                let eMembers = this.formData.members;
                let memberArray = [];
                if(eMembers){
                    for(var i = 0; i < eMembers.length; i++){
                        var m = {
                            locale : scope.optlang.code,
                            dateFormat : scope.df,
                            name : eMembers[i].name,
                            dpi : eMembers[i].dpi,
                            dob : eMembers[i].dateOfBirth ? dateFilter(eMembers[i].dateOfBirth,  scope.df) : eMembers[i].dateOfBirth,
                            requestedAmount : eMembers[i].requestedAmount,
                            puente : eMembers[i].workWithPuente,
                            groupPresident : eMembers[i].groupPresident,
                            id : eMembers[i].id
                        }
                        memberArray.push(m);
                    }
                }
                var request = {...this.formData};
                request.members = memberArray;
                resourceFactory.prequalificationResource.update({groupId: routeParams.groupId}, request, function (data) {
                    location.path('prequalification/' + data.resourceId + '/viewdetails' + '/' + routeParams.groupingType);
                });
            }

        }
    });

    mifosX.ng.application.controller('EditGroupPrequalificatoinController', ['$scope', '$routeParams', '$route', 'dateFilter', '$location', 'ResourceFactory', 'ValidationService', '$http', '$uibModal', 'API_VERSION', '$timeout', '$rootScope', 'Upload', mifosX.controllers.EditGroupPrequalificatoinController]).run(function ($log) {
        $log.info("EditGroupPrequalificatoinController initialized");
    });
}(mifosX.controllers || {}));
