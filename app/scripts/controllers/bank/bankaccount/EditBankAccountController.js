(function (module) {
    mifosX.controllers = _.extend(module, {
        EditBankAccountController: function (scope, routeParams, route, location, resourceFactory, http, $uibModal, API_VERSION, $timeout, $rootScope, Upload) {

            scope.formData={};
            scope.agencyOptions= [];
            scope.bankOptions= [];
            scope.glAccountOptions= [];

            console.log(routeParams.bankAccountId);
            resourceFactory.bankAccountResource.get({bankAccountId: routeParams.bankAccountId}, function (data) {

                scope.edit = data;
                scope.formData = {
                    accountNumber: data.accountNumber,
                    bankId: data.bank.id,
                    agencyId: data.agency.id,
                    glAccountId: data.glAccount.id,
                    description: data.description
                };
            });

            resourceFactory.bankAccountTemplateResource.get(function (data) {
                scope.agencyOptions = data.agencyOptions;
                scope.bankOptions = data.bankOptions;
                scope.glAccountOptions = data.glAccountOptions;
            });

            scope.submit=function (){

                resourceFactory.bankAccountResource.update({bankAccountId: routeParams.bankAccountId}, this.formData, function (data) {
                    location.path('chequebankaccounts' );
                    //location.path('/banks/' + data.resourceId + "/viewdetails");
                });
            }


        }
    });

    mifosX.ng.application.controller('EditBankAccountController', ['$scope', '$routeParams', '$route', '$location', 'ResourceFactory', '$http', '$uibModal', 'API_VERSION', '$timeout', '$rootScope', 'Upload', mifosX.controllers.EditBankAccountController]).run(function ($log) {
        $log.info("EditBankAccountController initialized");
    });
}(mifosX.controllers || {}));
