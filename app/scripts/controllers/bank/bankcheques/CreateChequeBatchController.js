(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateChequeBatchController: function (scope, routeParams, route, location, resourceFactory, http, $uibModal, API_VERSION, $timeout, $rootScope, Upload) {
            scope.formData = {};
            scope.bankAccId = routeParams.accountId;
            resourceFactory.bankAccountResource.get({bankAccountId: routeParams.accountId}, function (data) {
                scope.bankAccountData = data;
                var accountName = scope.bankAccountData.accountNumber + ' - ' + scope.bankAccountData.agency.name;
                scope.accountName = accountName;
                scope.formData.accountName = scope.accountName;
                scope.formData.agencyId = data.agency.id;
                scope.formData.bankAccId = scope.bankAccountData.id;
            });

           resourceFactory.chequeBatchTemplateResource.get({bankAccId: routeParams.accountId}, function (data) {
                scope.formData.from = data.from;
           });
           scope.submit = function (){
            resourceFactory.chequeBatchResource.createBatch(this.formData, function (data) {
                location.path('/viewchequeaccount/' + scope.bankAccId);
                });
           }
        }
    });

    mifosX.ng.application.controller('CreateChequeBatchController', ['$scope', '$routeParams', '$route', '$location', 'ResourceFactory', '$http', '$uibModal', 'API_VERSION', '$timeout', '$rootScope', 'Upload', mifosX.controllers.CreateChequeBatchController]).run(function ($log) {
        $log.info("CreateChequeBatchController initialized");
    });
}(mifosX.controllers || {}));
