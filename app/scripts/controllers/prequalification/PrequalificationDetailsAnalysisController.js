(function (module) {
    mifosX.controllers = _.extend(module, {
        PrequalificationDetailsAnalysisController: function (scope, routeParams, route, dateFilter, location, resourceFactory, http, $uibModal, API_VERSION, $timeout, $rootScope, Upload) {

            scope.groupData = {};
            scope.formData = {};
            scope.groupId = routeParams.groupId;
            scope.groupMembers = [];
            scope.memberBuroEvidence = [];
            scope.bureauStatusOptions = [
                {label:'A', value:'A'},
                {label:'B', value:'B'},
                {label:'C', value:'C'},
                {label:'D', value:'D'},
            ];
            scope.prequalificationDocuments = [];
            scope.showValidatePolicies = routeParams.showValidatePolicies == 'true' ? true : false;
            scope.prequalificationType = routeParams.prequalificationType;
            scope.previousPageUrl = "#/prequalificationAnalysis/"+routeParams.prequalificationType;

            resourceFactory.prequalificationResource.get({groupId: routeParams.groupId}, function (data) {
                scope.groupData = data;
                scope.groupMembers = data.groupMembers;

                console.log("group data", JSON.stringify(scope.groupData));
                console.log("current session data", JSON.stringify(scope.currentSession));
                scope.formData.isAllMembersSelected = true;
                for (var i = 0; i < scope.groupMembers.length; i++ ){
                    scope.groupMembers[i].isSelected = scope.formData.isAllMembersSelected;
                }
            });

            resourceFactory.entityDocumentsResource.getAllDocuments({
                entity: 'prequalifications',
                entityId: routeParams.groupId
            }, function (data) {
                for (var l in data) {

                    var bldocs = {};
                    bldocs = API_VERSION + '/' + data[l].parentEntityType + '/' + data[l].parentEntityId + '/documents/' + data[l].id + '/attachment?tenantIdentifier=' + $rootScope.tenantIdentifier;
                    data[l].docUrl = bldocs;
                    if (data[l].fileName)
                        if (data[l].fileName.toLowerCase().indexOf('.jpg') != -1 || data[l].fileName.toLowerCase().indexOf('.jpeg') != -1 || data[l].fileName.toLowerCase().indexOf('.png') != -1)
                            data[l].fileIsImage = true;
                    if (data[l].type)
                        if (data[l].type.toLowerCase().indexOf('image') != -1)
                            data[l].fileIsImage = true;
                }
                scope.prequalificationDocuments = data;
            });

            scope.submit = function () {
                Upload.upload({
                    url: $rootScope.hostUrl + API_VERSION + '/prequalification/' + routeParams.groupId + '/comment',
                    data: {
                        name: scope.groupData.groupName,
                        description: scope.formData.description,
                        comment: scope.formData.comments,
                        file: scope.formData.file
                    },
                }).then(function (data) {
                    // to fix IE not refreshing the model
                    if (!scope.$$phase) {
                        scope.$apply();
                    }
                    location.path('/prequalificationGroups/new');
                });
            };

            scope.resolveMemberStatus = function (statusId) {
                if (statusId === 'ACTIVE') {
                    return 'text-danger';
                }else{
                    return 'text-success';
                }
            }

            scope.resolveBureaStatus = function (statusId) {
                if (statusId === 'BUREAU_AVAILABLE') {
                    return 'A';
                } else {
                    return 'NA';
                }
            }
            scope.policyCheckColor = function (member) {
                if (member.redValidationCount > 0) {
                    return 'text-danger';
                }else if(member.orangeValidationCount > 0||member.yellowValidationCount > 0){
                    return 'text-warning';
                }else{
                    return 'text-success'
                }
            }
            scope.policyCountColor = function (member) {
                let redValidationCount = member.redValidationCount||0;
                let orangeValidationCount = member.orangeValidationCount || 0;
                let yellowValidationCount = member.yellowValidationCount || 0;
                if (redValidationCount > 0) {
                    return Number(redValidationCount)+Number(orangeValidationCount)+Number(yellowValidationCount);
                }else if(Number(orangeValidationCount) > 0 || yellowValidationCount > 0){
                    return Number(orangeValidationCount)+Number(yellowValidationCount);
                }else{
                    return '0'
                }
            }
            scope.validateHardPolicy = function () {
                resourceFactory.prequalificationChecklistResource.validate({prequalificationId: routeParams.groupId}, {}, function (data) {
                    route.reload();
                });
            }


            scope.validateBeaural = function () {
                resourceFactory.prequalificationChecklistResource.bureauValidation({prequalificationId: routeParams.groupId}, {}, function (data) {
                    route.reload();
                });
            }

            scope.onFileSelect = function (files) {
                scope.formData.file = files[0];
            };

            scope.onEvidenceSelect = function (files,index) {
                scope.groupMembers[Number(index)].file = files[0]
            };
            scope.obSubmitEvidence = function () {
                for (let i=0; i<scope.groupMembers.length; i++){
                    let groupMember = scope.groupMembers[i];
                    if ((groupMember.agencyBureauStatus != groupMember.bureauCheckStatus.code) && groupMember.documentCount<=0 && !groupMember.file){
                        scope.error = true;
                        scope.errorMsg = "Proporcione un documento para el cliente Nombre "+groupMember.name+" - DPI "+groupMember.dpi+" " +
                            "a fin de justificar el cambio de Buro";
                        setTimeout(() => {
                            scope.error = false;
                            scope.errorMsg = null;
                        }, 2000);

                        return;
                    }
                }

                for (let i=0; i<scope.groupMembers.length; i++){
                    let groupMember = scope.groupMembers[i];
                    if (groupMember.file){
                        scope.uploadBuroDocument(groupMember)
                    }
                }

            };

            scope.uploadBuroDocument = function (member){
                Upload.upload({
                    url: $rootScope.hostUrl + API_VERSION + '/prequalification/members/' + routeParams.groupId ,
                    data: {
                        memberId: member.id,
                        dpi: member.name + ' - ('+member.dpi+')',
                        description: "Buro Documento",
                        file: member.file
                    },
                }).then(function (data) {
                    // to fix IE not refreshing the model
                    if (!scope.$$phase) {
                        scope.$apply();
                    }
                    location.path('/prequalificationsmenu');
                });
            }

            scope.showSupportDocumentUploadPage = function () {
                var allowedStatuses = [400, 200];
                if (scope.groupData.status) {
                    return allowedStatuses.includes(scope.groupData.status.id)
                }
                return false;
            }


            scope.viewHardPolicyValidation = function (memberId) {
                resourceFactory.prequalificationValidationResource.get({
                    prequalificationId: routeParams.groupId,
                    clientId: memberId
                }, function (data) {
                    scope.memberHardPolicyResults = data

                    $uibModal.open({
                        templateUrl: 'viewMemberHardPolicy.html',
                        controller: ViewMemberHardPolicyCtrl
                    });
                });
            }

            var ViewMemberHardPolicyCtrl = function ($scope, $uibModalInstance) {
                $scope.memberResults = scope.memberHardPolicyResults;

                $scope.checkValidationColor = function (colorName) {
                    if (colorName) {
                        if ('RED' === colorName.toUpperCase()) {
                            return 'text-danger';
                        }

                        if ('YELLOW' === colorName.toUpperCase()) {
                            return 'text-warning';
                        }

                        if ('GREEN' === colorName.toUpperCase()) {
                            return 'text-success';
                        }

                        if ('GREEN' === colorName.toUpperCase()) {
                            return 'text-success';
                        }

                        if ('ORANGE' === colorName.toUpperCase()) {
                            return 'text-warning';
                        }
                    }
                    return '';
                }

                $scope.colorLabel = function (colorName) {
                    if(colorName){
                        if('RED' === colorName.toUpperCase()){
                            return 'label.color.red';
                        }else if('YELLOW' === colorName.toUpperCase()){
                            return 'label.color.yellow';
                        }else if('GREEN' === colorName.toUpperCase()){
                            return 'label.color.green';
                        }else if('ORANGE' === colorName.toUpperCase()){
                            return 'label.color.orange';
                        }else{
                            return null;
                        }
                    }
                    return null;
                }

                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            };

            var ConfirmationModalCtrl = function ($scope, $uibModalInstance) {
                $scope.confirmationMessage = scope.confirmationMessage;
                $scope.confirm = function () {
                    var members = [];
                    var atLeastOneMemberSelected = false;
                    for (var i = 0; i < scope.groupMembers.length; i++ ){
                        var isSelected = scope.groupMembers[i].isSelected;
                        if(isSelected){
                           atLeastOneMemberSelected = true;
                        }
                        members.push({id: scope.groupMembers[i].id, isSelected: isSelected});
                    }
                    resourceFactory.prequalificationChecklistResource.processAnalysis(
                        {prequalificationId: routeParams.groupId, command: scope.analysisStatus},
                        {action: scope.analysisStatus,comments:scope.formData.comments, members: members},
                        function (data) {
                            scope.routeTo("/prequalificationsmenu");
                            $uibModalInstance.dismiss('okay');
                        });
                }
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            };


            scope.routeTo = function (path) {
                location.path(path);
            }

            scope.getDifference = function (num1, num2) {
                return Number(num1) - Number(num2);
            }

            scope.resolveTotalRequestedAmount = function () {
                let total = 0;
                for (let i = 0; i < scope.groupMembers.length; i++) {
                    total += Number(scope.groupMembers[i].requestedAmount);
                }
                return total;
            }
            scope.resolveTotalApprovedAmount = function () {
                let total = 0;
                for (let i = 0; i < scope.groupMembers.length; i++) {
                    total += Number(scope.groupMembers[i].approvedAmount);
                }
                return total;
            }

            scope.editAmount = function (index) {
                scope.groupMembers[index].isEdit = true;
            }

            scope.updateApprovedAmount = function (member) {
                var data = {
                    "approvedAmount": member.approvedAmount,
                    "requestedAmount": member.requestedAmount,
                    "comments": member.comments,
                    "agencyBureauStatus": member.agencyBureauStatus,
                    "id": member.id,
                    "name": member.name,
                    "dpi": member.dpi,
                    "locale": scope.optlang.code,
                };
                delete data.isEdit;
                resourceFactory.prequalificationResource.updateMember({
                    groupId: routeParams.groupId,
                    memberId: member.id
                }, data, function (data) {
                    if (data.resourceIdentifier) {
                        scope.routeTo("/prequalificationsmenu");
                        scope.groupMembers[index].isEdit = false;
                    }
                });
            }

            scope.assignToSelf = function () {
               scope.processAnalysisRequest('assigntoself','label.button.assigntoself')
            }

            scope.processAnalysisRequest = function (status, inMessage) {
                scope.analysisStatus = status;
                scope.confirmationMessage = inMessage
                $uibModal.open({
                    templateUrl: 'confirmationModal.html',
                    controller: ConfirmationModalCtrl
                });
            }

            scope.routeToClientView = function (clientId) {
                location.path('/viewclient/' + clientId);
            };

            scope.viewBuroResult = function (memberId) {
                scope.buroCheckResult = {};
                console.log("======GP ID===========\n\n")
                console.log(memberId)
                console.log("======GP MEMBERS===========\n\n")
                console.log(JSON.stringify(scope.groupMembers))
                if(scope.groupMembers && scope.groupMembers.length > 0){
                    for (let i = 0; i < scope.groupMembers.length; i++){
                        if(scope.groupMembers[i].id === memberId){
                            scope.buroCheckResult = scope.groupMembers[i].buroData;
                        }
                    }
                }

                $uibModal.open({
                    templateUrl: 'viewBuroResultAnalysis.html',
                    controller: viewBuroResultAnalysisCtrl
                });
            };

            var viewBuroResultAnalysisCtrl = function ($scope, $uibModalInstance) {
                var result = Object.assign({}, scope.buroCheckResult);
                $scope.buroCheckResult = result;
                if(result.fecha){
                    $scope.buroCheckResult.fecha = new Date(... result.fecha);
                }
                $scope.cancel = function () {
                    $uibModalInstance.close();
                };
            };


            scope.selectAllMembers = function(){
                for (var i = 0; i < scope.groupMembers.length; i++ ){
                     scope.groupMembers[i].isSelected = scope.formData.isAllMembersSelected;
                }
            }
        }
    });

    mifosX.ng.application.controller('PrequalificationDetailsAnalysisController', ['$scope', '$routeParams', '$route', 'dateFilter', '$location', 'ResourceFactory', '$http', '$uibModal', 'API_VERSION', '$timeout', '$rootScope', 'Upload', mifosX.controllers.PrequalificationDetailsAnalysisController]).run(function ($log) {
        $log.info("PrequalificationDetailsAnalysisController initialized");
    });
}(mifosX.controllers || {}));
