(function (module) {
    mifosX.controllers = _.extend(module, {

        AuthorizeSingleChequeIssuanceController: function (scope, routeParams, route, location, resourceFactory, http, $uibModal, API_VERSION, $timeout, $rootScope, Upload) {
             scope.batchId = routeParams.batchId;
             scope.chequeId = routeParams.chequeId;
             scope.formData = {};
             resourceFactory.searchChequeResource.get({batchId: scope.batchId, chequeId: scope.chequeId}, function (data) {
                 if (data.pageItems.length > 0 ) {
                    scope.chequeData = data.pageItems[0];
                    var accountName = scope.chequeData.bankAccNo + ' - ' + scope.chequeData.agencyName;
                    scope.chequeData.accountName = accountName;
                    scope.formData.batchNo = scope.chequeData.batchNo;
                    scope.formData.accountName = accountName;
                    scope.formData.chequeNo = scope.chequeData.chequeNo;
                 }
            });

             scope.submit = function (){
                  var selectedCheques = [];
                  selectedCheques.push ({
                    chequeId: scope.chequeId,
                     description: scope.formData.description
                  });
                  resourceFactory.chequeBatchResource.authorizeIssuance({ commandParam: 'approveissuance', chequeId: scope.chequeId}, selectedCheques, function (data) {
                    location.path('/viewchequebatch/' +  scope.batchId);
                  });
             }
        }
    });

    mifosX.ng.application.controller('AuthorizeSingleChequeIssuanceController', ['$scope', '$routeParams', '$route', '$location', 'ResourceFactory', '$http', '$uibModal', 'API_VERSION', '$timeout', '$rootScope', 'Upload', mifosX.controllers.AuthorizeSingleChequeIssuanceController]).run(function ($log) {
        $log.info("AuthorizeSingleChequeIssuanceController initialized");
    });
}(mifosX.controllers || {}));
