(function (module) {
    mifosX.controllers = _.extend(module, {
        TransferCenterGroupController: function (scope, resourceFactory, route, location, routeParams, $uibModal, dateFilter) {
            scope.centersAvailability = [];
            scope.tf = "HH:mm";
            let portfolioId = routeParams.portfolioId
            let portfolioCenterId = routeParams.portfolioCenterId;
            let centerGroupId = routeParams.centerGroupId;
            scope.centerData = {};

            resourceFactory.centerGroupResource.get({portfolioCenterId: portfolioCenterId, centerGroupId:centerGroupId}, function (data) {
                scope.centerGroup = data;

                var date = new Date();
                if (data.meetingStartTime) {
                    scope.centerGroup.meetingStartTime = new Date(date.getFullYear(), date.getMonth(), date.getDay(), data.meetingStartTime[0], data.meetingStartTime[1], 0);
                }

                if (data.meetingEndTime) {
                    scope.centerGroup.meetingEndTime = new Date(date.getFullYear(), date.getMonth(), date.getDay(), data.meetingEndTime[0], data.meetingEndTime[1], 0);
                }
            });

            resourceFactory.portfolioAllCentersAvailabilityResource.get({portfolioId: portfolioId}, function (data) {
                let date = new Date();
                for (var i = 0; i < data.length; i++) {
                    let centerId = data[i].portfolioCenterId;
                    let centerName = data[i].portfolioCenterName;
                    let centerTimes = data[i].availableMeetingTimes;

                    if (portfolioCenterId != centerId) {
                        // iterate over available meetings times
                        for (var j = 0; j < centerTimes.length; j++) {
                            let meetingTimes = centerTimes[j];
                            let availableMeetingStartTime = new Date(date.getFullYear(), date.getMonth(), date.getDay(), meetingTimes.meetingStartTime[0], meetingTimes.meetingStartTime[1], 0);
                            let availableMeetingEndTime = new Date(date.getFullYear(), date.getMonth(), date.getDay(), meetingTimes.meetingEndTime[0], meetingTimes.meetingEndTime[1], 0);
                            scope.centersAvailability.push({portfolioCenterId: centerId, portfolioCenterName: centerName, meetingStartTime:  availableMeetingStartTime, meetingEndTime: availableMeetingEndTime})
                        }
                    }
                }
            });

            scope.transferGroup = function (portfolioCenterId, meetingStartTime, meetingEndTime) {
                scope.centerData.newPortfolioCenterId = portfolioCenterId;
                scope.centerData.meetingStartTime = meetingStartTime;
                scope.centerData.meetingEndTime = meetingEndTime;

                $uibModal.open({
                    templateUrl: 'transferGroupToCenter.html',
                    controller: TransferGroupCtrl
                });
            }

            var TransferGroupCtrl = function ($scope, $uibModalInstance) {
                $scope.transfer = function () {

                    if (scope.centerData.meetingStartTime) {
                        scope.centerData.meetingStartTime = dateFilter(scope.centerData.meetingStartTime, scope.tf);
                    }
                    if (scope.centerData.meetingEndTime) {
                        scope.centerData.meetingEndTime = dateFilter(scope.centerData.meetingEndTime, scope.tf);
                    }

                    resourceFactory.transferCenterGroupResource.transfer({'portfolioCenterId':portfolioCenterId, 'centerGroupId': centerGroupId}, scope.centerData, function (data) {
                        $uibModalInstance.close('transfer');
                        location.path('/viewcentergroups/' + portfolioId + "/" + portfolioCenterId);
                    });
                };
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            };

            scope.submit = function () {
                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;
                this.formData.newPortfolioCenterId = scope.newPortfolioCenterId;

                resourceFactory.transferCenterGroupResource.transfer({'portfolioCenterId':portfolioCenterId, 'centerGroupId': centerGroupId}, this.formData, function (data) {
                    location.path('/viewcentergroups/' + portfolioId + "/" + portfolioCenterId);
                });
            };
        }
    });
    mifosX.ng.application.controller('TransferCenterGroupController', ['$scope', 'ResourceFactory', '$route', '$location', '$routeParams', '$uibModal', 'dateFilter', mifosX.controllers.TransferCenterGroupController]).run(function ($log) {
        $log.info("TransferCenterGroupController initialized");
    });
}(mifosX.controllers || {}));
