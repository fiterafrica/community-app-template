(function (module) {
    mifosX.controllers = _.extend(module, {
        AuthorizeChequesIssuanceController: function (scope, routeParams, route, location, resourceFactory, http, $uibModal, API_VERSION, $timeout, $rootScope, Upload) {

             scope.bankAccountOptions = [];
             resourceFactory.chequeBatchTemplateResource.get({}, function (data) {
                 scope.statusOptions = data.statusOptions;
                 scope.agencyOptions = data.agencyOptions;
                 scope.facilitatorOptions = data.facilitatorOptions;
                 scope.centerOptions = data.centerOptions;
                 scope.allGroupOptions = data.groupOptions;
                 scope.groupOptions = data.groupOptions;
                 scope.allCenterGroupOptions = data.groupOptions;
             });

             resourceFactory.bankAccountResource.getAllBankAccounts({}, function (data) {
                 scope.totalBankAccounts = data.totalFilteredRecords;
                 scope.bankAccountOptions = data.pageItems;
                 for (var i = 0; i < scope.bankAccountOptions.length; i++ ){
                     var accountName = scope.bankAccountOptions[i].accountNumber + ' - ' + scope.bankAccountOptions[i].agency.name;
                     scope.bankAccountOptions[i].accountName = accountName;
                 }

             });

            scope.filterGroups = function () {
                if (this.formData.centerId){
                    scope.groupOptions = [];
                    for (var i in scope.allGroupOptions) {
                        if (scope.allGroupOptions[i].centerId == scope.formData.centerId) {
                            scope.groupOptions.push(scope.allGroupOptions[i]);
                        }
                    }
                }else {
                    scope.groupOptions = scope.allGroupOptions;
                }

            }
            scope.cheques = [];
            scope.formData = {};
            scope.chequesPerPage = 100;
            scope.formData.status = 6;
            scope.isAllChequesSelected = false;
            scope.isCollapsed = false;
            scope.getResultsPage = function (pageNumber) {
               resourceFactory.searchChequeResource.get({
                    offset: ((pageNumber - 1) * scope.chequesPerPage),
                    limit: scope.chequesPerPage,
                    orderBy: 'chequeNo',
                    sortOrder: 'ASC',
                    bankAccNo: scope.formData.bankAccNo,
                    chequeNo: scope.formData.chequeNo,
                    agencyId: scope.formData.agencyId,
                    status: scope.formData.status,
                    to: scope.formData.to,
                    from: scope.formData.from,
                    centerId: scope.formData.centerId,
                    groupId: scope.formData.groupId,
                    facilitatorId: scope.formData.facilitatorId
                }, function (data) {
                    scope.totalCheques = data.totalFilteredRecords;
                    scope.cheques = data.pageItems;
                    scope.isAllChequesSelected = false;
               });
            }

            scope.search = function () {
                 scope.getResultsPage(1);
                 scope.isCollapsed = true;
            }

            scope.selectAllCheques = function(){
                for (var i = 0; i < scope.cheques.length; i++ ){
                     scope.cheques[i].isSelected = scope.isAllChequesSelected;
                }
            }

            scope.isAuthorizeBtnDisabled = function(){
              var ret = true;
              for (var i = 0; i < scope.cheques.length; i++ ){
                   if(scope.cheques[i].isSelected){
                      ret = false;
                      break;
                   }
               }
               return ret;
            }

            scope.submit = function (){
                  var selectedCheques = [];
                   for(var i = 0; i < scope.cheques.length; i++){
                        if(scope.cheques[i].isSelected){
                            var selectedCheque = {
                               chequeId: scope.cheques[i].id
                            }
                           selectedCheques.push(selectedCheque);
                        }
                   }
                  resourceFactory.chequeBatchResource.authorizeIssuance({ commandParam: 'authorizeissuance'}, selectedCheques, function (data) {
                     route.reload();
                  });
            }

           scope.$watch('formData.bankAccId',function(){
            delete scope.formData.agencyName;
            delete  scope.formData.bankName;
            for (var i = 0; i < scope.bankAccountOptions.length; i++ ){
                if(scope.bankAccountOptions[i].id === scope.formData.bankAccId){
                    scope.formData.agencyName = scope.bankAccountOptions[i].agency.name;
                    scope.formData.bankName = scope.bankAccountOptions[i].bank.name;
                }
             }
           });

           scope.$watch('formData.centerId',function(){
               var selectedCenterGroupOptions = [];
               if(scope.formData.centerId){
                   var centerGroupOptions = [];
                   for (var i = 0; i < scope.groupOptions.length; i++ ){
                        selectedCenterGroupOptions.push(scope.groupOptions[i]);
                    }
                   scope.groupOptions = selectedCenterGroupOptions;
               } else {
                   scope.groupOptions = scope.allCenterGroupOptions;
               }
          });

        }
    });

    mifosX.ng.application.controller('AuthorizeChequesIssuanceController', ['$scope', '$routeParams', '$route', '$location', 'ResourceFactory', '$http', '$uibModal', 'API_VERSION', '$timeout', '$rootScope', 'Upload', mifosX.controllers.AuthorizeChequesIssuanceController]).run(function ($log) {
        $log.info("AuthorizeChequesIssuanceController initialized");
    });
}(mifosX.controllers || {}));
