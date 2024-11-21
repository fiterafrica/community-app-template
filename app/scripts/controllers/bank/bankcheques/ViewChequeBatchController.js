(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewChequeBatchController: function (scope, routeParams, route, location, resourceFactory, http, $uibModal, API_VERSION, $timeout, $rootScope, Upload) {
            scope.batchId = routeParams.batchId;
            resourceFactory.chequeBatchResource.get({batchId: routeParams.batchId}, function (data) {
                scope.batchData = data;
                var accountName = scope.batchData.bankAccNo + ' - ' + scope.batchData.agencyName;
                scope.accountName = accountName;
                scope.batchData.accountName = scope.accountName;
                scope.bankAccId = scope.batchData.bankAccId;
                resourceFactory.chequeBatchTemplateResource.get({bankAccId: scope.bankAccId}, function (data) {
                    scope.statusOptions = data.statusOptions;
                });
            });

            var DeleteChequeBatchController = function ($scope, $uibModalInstance) {
                $scope.delete = function () {
                    resourceFactory.chequeBatchResource.delete({batchId: scope.batchId }, function (data) {
                      $uibModalInstance.close('delete');
                      location.path('/viewchequeaccount/' + scope.bankAccId);
                    });
                };
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            };

            scope.deleteChequeBatch = function () {
                 $uibModal.open({
                    templateUrl: 'deleteChequeBatch.html',
                    controller: DeleteChequeBatchController
                });
            };

            scope.routeTo = function (chequeId){
                location.path('/viewdetails/' + scope.batchId + '/cheque/' + chequeId);
            };

            scope.cheques = [];
            scope.actualCheques = [];
            scope.formData = {};
            scope.searchResults = [];
            scope.chequesPerPage = 20;
            scope.getResultsPage = function (pageNumber) {
               resourceFactory.searchChequeResource.get({
                    offset: ((pageNumber - 1) * scope.chequesPerPage),
                    limit: scope.chequesPerPage,
                    paged: 'true',
                    orderBy: 'chequeNo',
                    sortOrder: 'ASC',
                    batchId: scope.batchId,
                    chequeNo: scope.formData.chequeNo,
                    status: scope.formData.status
                }, function (data) {
                    scope.totalCheques = data.totalFilteredRecords;
                    scope.cheques = data.pageItems;
               });
            }
            scope.getResultsPage(1);

            scope.search = function () {
                 scope.getResultsPage(1);
            }

        }
    });

    mifosX.ng.application.controller('ViewChequeBatchController', ['$scope', '$routeParams', '$route', '$location', 'ResourceFactory', '$http', '$uibModal', 'API_VERSION', '$timeout', '$rootScope', 'Upload', mifosX.controllers.ViewChequeBatchController]).run(function ($log) {
        $log.info("ViewChequeBatchController initialized");
    });
}(mifosX.controllers || {}));
