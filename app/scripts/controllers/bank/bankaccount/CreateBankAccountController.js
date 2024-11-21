(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateBankAccountController: function (scope, routeParams, route, location, resourceFactory, http, $uibModal, API_VERSION, $timeout, $rootScope, Upload) {

            scope.formData={};
            scope.agencyOptions= [];
            scope.bankOptions= [];
            scope.glAccountOptions= [];

            resourceFactory.bankAccountTemplateResource.get(function (data) {
                scope.agencyOptions = data.agencyOptions;
                scope.bankOptions = data.bankOptions;
                scope.glAccountOptions = data.glAccountOptions;
            });


            scope.submit=function (){

                resourceFactory.bankAccountResource.save(this.formData, function (data) {
                    location.path('chequebankaccounts' );
                    //location.path('/banks/' + data.resourceId + "/viewdetails");
                });
            }


        }
    });

    mifosX.ng.application.controller('CreateBankAccountController', ['$scope', '$routeParams', '$route', '$location', 'ResourceFactory', '$http', '$uibModal', 'API_VERSION', '$timeout', '$rootScope', 'Upload', mifosX.controllers.CreateBankAccountController]).run(function ($log) {
        $log.info("CreateBankAccountController initialized");
    });
}(mifosX.controllers || {}));
