(function (module) {
    mifosX.controllers = _.extend(module, {
        ChequeAccountsController: function (scope, routeParams, route, location, resourceFactory, http, $uibModal, API_VERSION, $timeout, $rootScope, Upload) {
            scope.bankAccountlist = [];
            scope.showInactive = false;
            scope.totalBankAccounts;
            scope.searchText;
            scope.getResultsPage = function () {
                var items = resourceFactory.bankAccountResource.getAllBankAccounts({
                    accountNumber: scope.searchText,
                }, function (data) {
                    scope.totalBankAccounts = data.totalFilteredRecords;
                    scope.bankAccountList = data.pageItems;
                });
            }
            scope.getResultsPage();
            scope.routeTo = function (bankId) {
                 location.path('/viewchequeaccount/' + bankId);
            };
        }
    });

    mifosX.ng.application.controller('ChequeAccountsController', ['$scope', '$routeParams', '$route', '$location', 'ResourceFactory', '$http', '$uibModal', 'API_VERSION', '$timeout', '$rootScope', 'Upload', mifosX.controllers.ChequeAccountsController]).run(function ($log) {
        $log.info("ChequeAccountsController initialized");
    });
}(mifosX.controllers || {}));
