(function (module) {
    mifosX.controllers = _.extend(module, {
        BankChequesController: function (scope, routeParams, route, location, resourceFactory, http, $uibModal, API_VERSION, $timeout, $rootScope, Upload) {

             resourceFactory.chequeBatchTemplateResource.get({}, function (data) {
                 scope.statusOptions = data.statusOptions;
                 scope.agencyOptions = data.agencyOptions;
             });

            scope.routeTo = function (chequeId, batchId){
                location.path('/viewdetails/' + chequeId  + '/cheque/' + batchId);
            };

            scope.cheques = [];
            scope.formData = {};
            scope.chequesPerPage = 100;
            scope.getResultsPage = function (pageNumber) {
               resourceFactory.searchChequeResource.get({
                    offset: ((pageNumber - 1) * scope.chequesPerPage),
                    limit: scope.chequesPerPage,
                    orderBy: 'chequeNo',
                    sortOrder: 'ASC',
                    bankAccNo: scope.formData.bankAccNo,
                    chequeNo: scope.formData.chequeNo,
                    agencyId: scope.formData.agencyId,
                    status: scope.formData.status
                }, function (data) {
                    scope.totalCheques = data.totalFilteredRecords;
                    scope.cheques = data.pageItems;
               });
            }

            scope.search = function () {
                 scope.getResultsPage(1);
            }

        }
    });

    mifosX.ng.application.controller('BankChequesController', ['$scope', '$routeParams', '$route', '$location', 'ResourceFactory', '$http', '$uibModal', 'API_VERSION', '$timeout', '$rootScope', 'Upload', mifosX.controllers.BankChequesController]).run(function ($log) {
        $log.info("BankChequesController initialized");
    });
}(mifosX.controllers || {}));
