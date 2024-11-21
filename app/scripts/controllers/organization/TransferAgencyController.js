(function (module) {
    mifosX.controllers = _.extend(module, {
        TransferAgencyController: function (scope, resourceFactory, route, location, routeParams, $uibModal, dateFilter) {
            scope.regionsAvailability = [];
            scope.agencyData = {};
            scope.tf = "HH:mm";
            let agencyId = routeParams.id;
            let currentParentId = 0;

            resourceFactory.agencyResource.get({agencyId: routeParams.id}, function (data) {
                scope.agency = data;
                if(data.parentId) {
                    currentParentId = data.parentId;
                }

                let requestParams = {orderBy: 'description', sortOrder: 'ASC'};
                resourceFactory.officeChildrenByUserResource.get(requestParams, function (data) {
                    // list of offices related to regions available to transfer the agency
                    for (var i = 0; i < data.length; i++) {
                        let id = data[i].id;
                        let name = data[i].name;
                        if (currentParentId != id) {
                            scope.regionsAvailability.push({parentId: id, parentName: name})
                        }
                    }
                });
            });

            scope.transferAgency = function (parentId) {
                scope.agencyData.newRegionId = parentId;

                $uibModal.open({
                    templateUrl: 'transferAgency.html',
                    controller: TransferAgency
                });
            }

            var TransferAgency = function ($scope, $uibModalInstance) {
                $scope.transfer = function () {

                    resourceFactory.transferAgencyResource.transfer({'agencyId':agencyId}, scope.agencyData, function (data) {
                        $uibModalInstance.close('transfer');
                        location.path('/agencies/');
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
    mifosX.ng.application.controller('TransferAgencyController', ['$scope', 'ResourceFactory', '$route', '$location', '$routeParams', '$uibModal', 'dateFilter', mifosX.controllers.TransferAgencyController]).run(function ($log) {
        $log.info("TransferAgencyController initialized");
    });
}(mifosX.controllers || {}));
