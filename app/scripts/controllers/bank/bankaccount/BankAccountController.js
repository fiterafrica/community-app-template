(function (module) {
    mifosX.controllers = _.extend(module, {
        BankAccountController: function (scope, routeParams, route, location, resourceFactory, http, $uibModal, API_VERSION, $timeout, $rootScope, Upload) {
            scope.bankAccountlist = [];
            scope.showInactive = false;
            scope.totalBankAccounts;

            scope.formData = {};
            scope.searchText;
            scope.bankAccountsPerPage = 25;

            scope.getResultsPage = function (pageNumber) {
                var items = resourceFactory.bankAccountResource.getAllBankAccounts({
                    offset: ((pageNumber - 1) * scope.bankAccountsPerPage),
                    limit: scope.bankAccountsPerPage,
                    searchText: scope.searchText,
                    accountNumber: scope.searchText,
                    bankName: scope.searchText,
                    bankCode: scope.searchText
                }, function (data) {
                    scope.totalBankAccounts = data.totalFilteredRecords;
                    scope.bankAccountlist = data.pageItems;
                });
            }

            scope.getResultsPage(1);
            
            scope.routeTo = function (path) {
                location.path(path);
            }

            scope.getActiveInactive = function () {
                scope.showInactive = !scope.showInactive;
                scope.getResultsPage(1);
            }

        }

    });

    mifosX.ng.application.controller('BankAccountController', ['$scope', '$routeParams', '$route', '$location', 'ResourceFactory', '$http', '$uibModal', 'API_VERSION', '$timeout', '$rootScope', 'Upload', mifosX.controllers.BankAccountController]).run(function ($log) {
        $log.info("BankAccountController initialized");
    });
}(mifosX.controllers || {}));
