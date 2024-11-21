(function (module) {
    mifosX.controllers = _.extend(module, {
        PrequalificationDetailsController: function (scope, routeParams, route, dateFilter, location, resourceFactory, http, $uibModal, API_VERSION, $timeout, $rootScope, Upload) {

            scope.groupData = {};
            scope.isEdit = false;
            scope.formData = {};
            scope.groupId = routeParams.groupId;
            scope.groupMembers = [];
            scope.prequalificationDocuments = [];
            scope.viewPolicyCheckResults = false;
            scope.groupingType = routeParams.groupingType;
            scope.previousPageUrl = "#/prequalificationsmenu";
            if (routeParams.groupingType === 'group'){
                scope.previousPageUrl = "#/prequalificationGroups/group/list";
            }

            if (routeParams.groupingType === 'individual'){
                scope.previousPageUrl = "#/prequalificationGroups/individual/list";
            }
            scope.hasRedValidations = false;

            resourceFactory.prequalificationResource.get({groupId: routeParams.groupId}, function (data) {
                scope.groupData = data;
                // Show the results if the status is HARD_POLICY_CHECKED (700) and subsequence
                if(data.status.id >= 700){
                   scope.viewPolicyCheckResults = true;
                }
                scope.groupMembers = data.groupMembers;
                if (scope.groupingType === 'individual'){
                    let countRedValidations = 0;
                    for(const i in scope.groupMembers){
                        if(scope.groupMembers[i].redValidationCount > 0 || scope.groupMembers[i].activeBlacklistCount > 0){
                            countRedValidations++;
                        }
                    }
                    if(countRedValidations > 0){
                        scope.hasRedValidations = true;
                    }
                } else if (scope.groupingType === 'group'){
                    let countRedValidations = data.redValidationCount || 0;
                    for(const i in scope.groupMembers){
                        if(scope.groupMembers[i].redValidationCount > 0 || scope.groupMembers[i].activeBlacklistCount > 0){
                            countRedValidations++;
                        }
                    }
                    if(countRedValidations > 0){
                        scope.hasRedValidations = true;
                    }
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
                if (routeParams.groupingType === 'individual'){
                    scope.groupData.groupName = scope.groupData.prequalificationNumber;
                }
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

                    if (routeParams.groupingType === 'group'){
                        location.path('/prequalificationGroups/group/list');
                    }

                    if (routeParams.groupingType === 'individual'){
                        location.path('/prequalificationGroups/individual/list');
                    }
                });
            };

            scope.resolveMemberStatus = function (statusId) {
                if (statusId === 'ACTIVE') {
                    return 'text-danger';
                }else {
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

            scope.requestForUpdates = function () {
                $uibModal.open({
                    templateUrl: 'requestForUpdatesView.html',
                    controller: RequestUpdatesCtrl
                });
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

            scope.showSupportDocumentUploadPage = function () {
                var allowedStatuses = [400, 200];
                if (scope.groupData.status) {
                    return allowedStatuses.includes(scope.groupData.status.id)
                }
                return false;
            };

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
            };

            scope.viewBuroResult = function (memberId) {
                scope.buroCheckResult = {};
                if(scope.groupMembers && scope.groupMembers.length > 0){
                    for (let i = 0; i < scope.groupMembers.length; i++){
                        if(scope.groupMembers[i].id === memberId){
                            scope.buroCheckResult = scope.groupMembers[i].buroData;
                        }
                    }
                }
                $uibModal.open({
                    templateUrl: 'viewBuroResult.html',
                    controller: ViewBuroResultCtrl
                });
            };

            scope.processAnalysisRequest = function (status, inMessage) {
                scope.analysisStatus = status;
                scope.confirmationMessage = inMessage
                $uibModal.open({
                    templateUrl: 'confirmationModal.html',
                    controller: ConfirmationModalCtrl
                });
            }

            var RequestUpdatesCtrl = function ($scope, $uibModalInstance) {
                $scope.updateData = {};

                $scope.submit = function () {
                    resourceFactory.prequalificationChecklistResource.requestUpdates({prequalificationId: routeParams.groupId}, {comments:$scope.updateData.comments}, function (data) {
                        $uibModalInstance.dismiss('cancel');
                        route.reload();
                    });
                };

                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            };

            var ViewBuroResultCtrl = function ($scope, $uibModalInstance) {
                var result = Object.assign({}, scope.buroCheckResult);
                $scope.buroCheckResult = result;
                if(result.fecha){
                    $scope.buroCheckResult.fecha = new Date(... result.fecha);
                }
                $scope.cancel = function () {
                    $uibModalInstance.close();
                };
            };

            var ViewMemberHardPolicyCtrl = function ($scope, $uibModalInstance) {
                $scope.memberResults = scope.memberHardPolicyResults;

                $scope.checkValidationColor = function (colorName) {
                    if(colorName){
                        if('RED' === colorName.toUpperCase()){
                            return 'text-danger';
                        }

                        if('YELLOW' === colorName.toUpperCase()){
                            return 'text-warning';
                        }

                        if('GREEN' === colorName.toUpperCase()){
                            return 'text-success';
                        }

                        if('GREEN' === colorName.toUpperCase()){
                            return 'text-success';
                        }

                        if('ORANGE' === colorName.toUpperCase()){
                            return 'text-warning';
                        }
                    }
                    return '';
                }

                $scope.colorLabel = function (colorName) {
                    console.log("going to validate color: "+colorName)
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
                    resourceFactory.prequalificationChecklistResource.processAnalysis(
                        {prequalificationId: routeParams.groupId, command: scope.analysisStatus},
                        {action: scope.analysisStatus,comments:scope.formData.comments},
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

            scope.updateRequestedAmount = function (member) {

                var data = {
                    "requestedAmount": member.requestedAmount,
                    "comments": member.comments,
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
                        route.reload();
                        scope.groupMembers[index].isEdit = false;
                    }
                });
            }

            scope.editRequestedAmount = function (index) {
                scope.groupMembers[index].isEditRequested = true;
            }


            scope.routeToClientView = function (clientId) {
                location.path('/viewclient/' + clientId);
            };
        }
    });

    mifosX.ng.application.controller('PrequalificationDetailsController', ['$scope', '$routeParams', '$route', 'dateFilter', '$location', 'ResourceFactory', '$http', '$uibModal', 'API_VERSION', '$timeout', '$rootScope', 'Upload', mifosX.controllers.PrequalificationDetailsController]).run(function ($log) {
        $log.info("PrequalificationDetailsController initialized");
    });
}(mifosX.controllers || {}));
