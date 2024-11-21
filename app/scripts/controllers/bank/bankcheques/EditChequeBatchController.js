(function (module) {
    mifosX.controllers = _.extend(module, {
        EditChequeBatchController: function (scope, routeParams, route, location, resourceFactory, http, $uibModal, API_VERSION, $timeout, $rootScope, Upload) {
            scope.formData = {};
            scope.batchId = routeParams.batchId;
            resourceFactory.chequeBatchResource.get({batchId: scope.batchId}, function (data) {
                scope.batchData = data;
                scope.bankAccId = scope.batchData.bankAccId;
                scope.formData.batchId = scope.batchId;
                var accountName = scope.batchData.bankAccNo + ' - ' + scope.batchData.agencyName;
                scope.accountName = accountName;
                scope.formData.accountName = scope.accountName;
                scope.formData.agencyId = scope.batchData.agencyId;
                scope.formData.description = scope.batchData.description;
                scope.formData.to = scope.batchData.to;
                scope.formData.bankAccId = scope.batchData.bankAccId;
                resourceFactory.chequeBatchTemplateResource.get({bankAccId: scope.bankAccId}, function (data) {
                  scope.formData.from = data.from;
                });
            });
           scope.submit = function (){
            resourceFactory.chequeBatchResource.update(this.formData, function (data) {
                location.path('/viewchequebatch/' +  scope.batchId);
                });
           }
        }
    });

    mifosX.ng.application.controller('EditChequeBatchController', ['$scope', '$routeParams', '$route', '$location', 'ResourceFactory', '$http', '$uibModal', 'API_VERSION', '$timeout', '$rootScope', 'Upload', mifosX.controllers.EditChequeBatchController]).run(function ($log) {
        $log.info("EditChequeBatchController initialized");
    });
}(mifosX.controllers || {}));
