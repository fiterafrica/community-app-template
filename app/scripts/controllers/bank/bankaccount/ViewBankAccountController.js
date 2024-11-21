(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewBankAccountController: function (scope, routeParams, route, location, resourceFactory, http, $uibModal, API_VERSION, $timeout, $rootScope, Upload) {
            scope.bankAccountData = {};

            scope.formData={};

            resourceFactory.bankAccountResource.get({bankAccountId: routeParams.bankAccountId}, function (data) {
                scope.bankAccountData = data;
            });

            scope.deleteBankAccount = function (bankAccountId) {

                resourceFactory.bankAccountResource.delete({bankAccountId: bankAccountId}, function (data) {
                    //scope.bankAccountData = data;
                    location.path('chequebankaccounts');
                });
            }

        }
    });

    mifosX.ng.application.controller('ViewBankAccountController', ['$scope', '$routeParams', '$route', '$location', 'ResourceFactory', '$http', '$uibModal', 'API_VERSION', '$timeout', '$rootScope', 'Upload', mifosX.controllers.ViewBankAccountController]).run(function ($log) {
        $log.info("ViewBankAccountController initialized");
    });
}(mifosX.controllers || {}));
