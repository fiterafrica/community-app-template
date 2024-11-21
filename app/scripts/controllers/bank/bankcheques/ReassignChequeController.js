(function (module) {
    mifosX.controllers = _.extend(module, {

        ReassignChequeController: function (scope, routeParams, route, location, resourceFactory, http, $uibModal, API_VERSION, $timeout, $rootScope, Upload) {
             scope.batchId = routeParams.batchId;
             scope.chequeId = routeParams.chequeId;
             scope.formData = {};
             resourceFactory.searchChequeResource.get({batchId: scope.batchId, orderBy: 'chequeNo', sortOrder: 'ASC'}, function (data) {
                 if (data.pageItems.length > 0 ) {
                    scope.chequeData = {}
                    scope.chequeOptions = [];
                    for (var i =0; i < data.pageItems.length; i++){
                          var cheque = data.pageItems[i];
                          if(cheque.id == scope.chequeId){
                            scope.chequeData = cheque;
                            var accountName = scope.chequeData.bankAccNo + ' - ' + scope.chequeData.agencyName;
                            scope.chequeData.accountName = accountName;
                            scope.formData.batchNo = scope.chequeData.batchNo;
                            scope.formData.accountName = accountName;
                            scope.formData.oldChequeNo = scope.chequeData.chequeNo;
                            scope.formData.oldChequeId = scope.chequeData.id;
                          } else {
                            if(cheque.status.id == 1){
                                scope.chequeOptions.push(cheque);
                            }
                          }
                    }
                 }
            });

             scope.submit = function (){
                   var request = {
                       oldChequeId: this.formData.oldChequeId,
                       chequeId: this.formData.chequeId
                   }
                  resourceFactory.chequeBatchResource.reassign({chequeId: scope.chequeId}, request, function (data) {
                    location.path('/viewchequebatch/' +  scope.batchId);
                });
             }
        }
    });

    mifosX.ng.application.controller('ReassignChequeController', ['$scope', '$routeParams', '$route', '$location', 'ResourceFactory', '$http', '$uibModal', 'API_VERSION', '$timeout', '$rootScope', 'Upload', mifosX.controllers.ReassignChequeController]).run(function ($log) {
        $log.info("ReassignChequeController initialized");
    });
}(mifosX.controllers || {}));
