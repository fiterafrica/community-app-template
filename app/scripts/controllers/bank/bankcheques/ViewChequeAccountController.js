(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewChequeAccountController: function (scope, routeParams, route, location, resourceFactory, http, $uibModal, API_VERSION, $timeout, $rootScope, Upload) {
            resourceFactory.bankAccountResource.get({bankAccountId: routeParams.accountId}, function (data) {
                scope.bankAccountData = data;
                var accountName = scope.bankAccountData.accountNumber + ' - ' + scope.bankAccountData.agency.name;
                scope.accountName = accountName;
            });
            scope.routeTo = function (batchId) {
                 location.path('/viewchequebatch/' + batchId);
            };
           scope.deleteBankAccount = function (bankAccountId) {
                resourceFactory.bankAccountResource.delete({bankAccountId: bankAccountId}, function (data) {
                    location.path('chequebankaccounts');
                });
            }
        }
    });

    mifosX.ng.application.controller('ViewChequeAccountController', ['$scope', '$routeParams', '$route', '$location', 'ResourceFactory', '$http', '$uibModal', 'API_VERSION', '$timeout', '$rootScope', 'Upload', mifosX.controllers.ViewChequeAccountController]).run(function ($log) {
        $log.info("ViewChequeAccountController initialized");
    });
}(mifosX.controllers || {}));
