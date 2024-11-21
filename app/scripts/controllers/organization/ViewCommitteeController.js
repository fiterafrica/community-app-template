(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewCommitteeController: function (scope, routeParams, route, location, resourceFactory, $uibModal) {

            resourceFactory.committeeResource.get({committeeId: routeParams.id}, function (data) {
                scope.committee = data;
            });

            scope.deletecommittee = function () {
                $uibModal.open({
                    templateUrl: 'deletecommittee.html',
                    controller: CommitteeDeleteCtrl
                });
            };

            var CommitteeDeleteCtrl = function ($scope, $uibModalInstance) {
                $scope.delete = function () {
                    resourceFactory.committeeResource.delete({committeeId: routeParams.id}, {}, function (data) {
                        $uibModalInstance.close('delete');
                        location.path('/committees');
                    });
                };
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            };


        }
    });
    mifosX.ng.application.controller('ViewCommitteeController', ['$scope', '$routeParams', '$route', '$location', 'ResourceFactory', '$uibModal', mifosX.controllers.ViewCommitteeController]).run(function ($log) {
        $log.info("ViewCommitteeController initialized");
    });
}(mifosX.controllers || {}));