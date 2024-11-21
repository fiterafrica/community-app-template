(function (module) {
    mifosX.controllers = _.extend(module, {
        ExistingGroupPrequalificatoinController: function (scope, routeParams, route, dateFilter, location, resourceFactory, validationService, http, $uibModal, API_VERSION, $timeout, $rootScope, Upload) {

            scope.agenciesList = [];
            scope.portfoliosList = [];
            scope.centersList = [];
            scope.groupsList = [];
            scope.productsList = [];
            scope.facilitators = [];
            scope.isEditMember = false;
            scope.yesNo = [{value: "YES", name: "Yes"}, {value: "NO", name: "No"}];
            scope.restrictDate = new Date();
            scope.formData = {};
            // scope.formData.members = [];
            scope.membersForm = {
               workWithPuente: "YES"
            };
            scope.memberDetailsForm;
            scope.groupData;
            scope.membersList = [];
            scope.tf = "HH:mm";

            resourceFactory.prequalificationTemplateResource.get({groupId: routeParams.prequalificationId, groupingType: 'group'}, function (data) {
                if (data.agencies){
                    scope.agenciesList = data.agencies
                }
                if (data.centerData){
                scope.centersList = data.centerData
                }

                scope.productsList = data.loanProducts
                scope.facilitators = data.facilitators
                scope.formData.prequalilficationTimespan = Number(data.prequalilficationTimespan)
            });

            resourceFactory.prequalificationResource.get({groupId: routeParams.prequalificationId}, function (data) {
                const [ year, month, day, hour, minute, second ] = data.createdAt;
                const createdDate = new Date(`${year}-${month}-${day} ${hour}:${minute}:${second}`);
                scope.previousPrequalificationDate = dateFilter(createdDate, scope.df);
                if (data.openingDate) {
                    var editDate = dateFilter(data.openingDate, scope.df);
                    scope.first.date = new Date(editDate);
                }

                let membersList = [];
                if(data.groupMembers){
                    data.groupMembers.forEach(member => {
                        let memberDets = {}
                        if (member.dob) {
                            var dobDate = dateFilter(member.dob, scope.df);
                            memberDets.dob = dateFilter(new Date(dobDate), scope.df);
                        }
                        memberDets.puente = member.workWithPuente;
                        memberDets.amount = member.approvedAmount;
                        memberDets.name = member.name;
                        memberDets.groupPresident = member.groupPresident;
                        if (member.groupPresident){
                            scope.presidentSelected = true;
                        }
                        memberDets.dpi = member.dpi;
                        memberDets.locale = scope.optlang.code;
                        memberDets.dateFormat = scope.df;
                        membersList.push(memberDets);
                    });
                }

                scope.formData =
                    {
                        previousPrequalification: data.id,
                        agencyId: data.agencyId,
                        productId: data.productId,
                        centerId: data.centerId,
                        facilitator: data.facilitatorId,
                        groupName: data.groupName,
                        prequalilficationTimespan: data.prequalilficationTimespan,
                        members: membersList
                    }
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
                    var reqDate = dateFilter(scope.membersForm.dob, scope.df);
                    scope.membersForm.dob = reqDate;
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
                        memberData.groupPresident = scope.membersList[i].groupPresident ;
                        if(scope.membersList[i].dateOfBirth){
                            console.log(scope.membersList[i].dateOfBirth);
                            memberData.dob = dateFilter(new Date(scope.membersList[i].dateOfBirth),scope.df);
                        }
                        memberData.amount = scope.membersList[i].approvedAmount ;
                        memberData.locale = scope.optlang.code;
                        memberData.dateFormat = scope.df;
                        scope.formData.members.push(memberData)
                    }
                }


                resourceFactory.prequalificationResource.prequalifyExistingGroup({groupId: scope.formData.groupId,anotherResource:'prequalifyGroup'},this.formData, function (data) {
                    location.path('#/prequalificationGroups/group/list');
                });
            }

            scope.requestPrequalification = function () {
                console.log("submitting form data")
                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;
                this.formData.individual = false;

                // this.formData.members.forEach(function(member){
                //     member.locale = scope.optlang.code;
                //     member.dateFormat = scope.df;
                // })
                resourceFactory.prequalificationResource.save(this.formData, function (data) {
                    location.path('#/prequalificationGroups/group/list');
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

        }
    });

    mifosX.ng.application.controller('ExistingGroupPrequalificatoinController', ['$scope', '$routeParams', '$route', 'dateFilter', '$location', 'ResourceFactory', 'ValidationService', '$http', '$uibModal', 'API_VERSION', '$timeout', '$rootScope', 'Upload', mifosX.controllers.ExistingGroupPrequalificatoinController]).run(function ($log) {
        $log.info("ExistingGroupPrequalificatoinController initialized");
    });
}(mifosX.controllers || {}));
