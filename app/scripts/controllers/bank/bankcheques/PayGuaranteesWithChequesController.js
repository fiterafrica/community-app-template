(function (module) {
    mifosX.controllers = _.extend(module, {

        PayGuaranteesWithChequesController: function (scope, routeParams, route, location, resourceFactory, http, $uibModal, API_VERSION, $rootScope, dateFilter) {
            scope.isChequeAssigned = false;
            scope.isAllGuaranteeSelected = false;
            scope.guaranteeDataList = [];
            scope.availableCheques= [];
            scope.formData = {};
            scope.uiValidationErrors = [];
            scope.bankAccountOptions = [];

            scope.searchByCaseId = function () {
                   var params = {
                       caseId: this.searchText,
                       locale: scope.optlang.code
                   };
                   resourceFactory.chequeGuaranteeResource.getAllGuarantees(params, function (data) {
                        scope.guaranteeDataList = data;
                   });
            }

            scope.search = function () {
                 scope.searchByCaseId();
                 scope.fetchAvailableCheques();
                 scope.isChequeAssigned = false;
                 scope.isAllGuaranteeSelected = false;
            }

            scope.fetchAvailableCheques = function () {
                resourceFactory.searchChequeResource.get({
                    orderBy: 'chequeNo',
                    sortOrder: 'ASC',
                    agencyId: scope.formData.agencyId,
                    status: 1
                }, data => {
                        scope.totalAvailableCheques = data.totalFilteredRecords;
                        scope.availableCheques = data.pageItems;
                        var bankAccMap = groupBy(scope.availableCheques, 'bankAccId');
                        for (var [key, value] of  bankAccMap.entries()) {
                            var chequeData = value[0];
                            var accountName = chequeData.bankAccNo + ' (' + chequeData.bankName + ')' + ' - ' + chequeData.agencyName + ' (' + value.length + ' Cheques)';
                            scope.bankAccountOptions.push({bankAccId: chequeData.bankAccId, accountName: accountName });
                        }
                   });
            }
            const groupBy = (items, key) => {
                const map = new Map();
                items.forEach((item) => {
                    const keyValue = item[key];
                    const currArr = map.has(keyValue) ? map.get(keyValue) : [];
                    currArr.push(item);
                    map.set(keyValue, currArr);
                });
                return map;
            };

            scope.assignGuaranteeCheques = function () {
                $uibModal.open({
                    templateUrl: 'assignGuaranteeCheques.html',
                    controller: AssignGuaranteeChequesController
                });
            };

            var AssignGuaranteeChequesController = function ($scope, $uibModalInstance) {
                $scope.bankAccountOptions = scope.bankAccountOptions;
                if (Array.isArray($scope.bankAccountOptions) && $scope.bankAccountOptions.length) {
                    $scope.bankAccId =  $scope.bankAccountOptions[0].bankAccId;
                }
                $scope.assign = function () {
                    scope.assignChequesFromBankAccount( $scope.bankAccId);
                    $uibModalInstance.close('delete');
                };
                $scope.cancel = function () {
                    $uibModalInstance.close('cancel');
                };
            };

            scope.assignChequesFromBankAccount = function(bankAccId){
                var selectedGuaranteeDataList = [];
                for(var i = 0; i < scope.guaranteeDataList.length; i++){
                     delete scope.guaranteeDataList[i].chequeData;
                     if(scope.guaranteeDataList[i].isSelected){
                        selectedGuaranteeDataList.push(scope.guaranteeDataList[i]);
                     }
                }
                var availableBankCheques = [];
                for(var i = 0; i < scope.availableCheques.length; i++){
                    if(scope.availableCheques[i].bankAccId === bankAccId){
                        availableBankCheques.push(scope.availableCheques[i]);
                    }
                }
                scope.uiValidationErrors = [];
                if(selectedGuaranteeDataList.length < 1){
                  scope.uiValidationErrors.push({
                        message: 'error.message.select.at.least.one.guarantee'
                   });
                } else if (selectedGuaranteeDataList.length > availableBankCheques.length){
                      scope.uiValidationErrors.push({
                          message: 'error.message.insufficient.amount.of.cheques'
                       });
                } else {
                    let mappedChequeIndex = 0;
                    for (var i = 0; i < scope.guaranteeDataList.length; i++ ){
                       if(scope.guaranteeDataList[i].isSelected){
                           scope.guaranteeDataList[i].chequeData = availableBankCheques[mappedChequeIndex];
                           var chequeName = scope.guaranteeDataList[i].chequeData.chequeNo + ' |' +  scope.guaranteeDataList[i].chequeData .batchNo + '| ' +  scope.guaranteeDataList[i].chequeData .bankAccNo +  '| ' +  scope.guaranteeDataList[i].chequeData.bankName;
                           var accountName = scope.guaranteeDataList[i].chequeData.bankAccNo + ' - ' + scope.guaranteeDataList[i].chequeData.agencyName;
                           scope.guaranteeDataList[i].chequeData.chequeName = chequeName;
                           scope.guaranteeDataList[i].chequeData.accountName = accountName;
                           mappedChequeIndex++;
                       }
                    }
                    scope.uiValidationErrors = [];
                    scope.isChequeAssigned = true;
               }
            }

          scope.isAssignBtnDisabled = function (){
                var selectedGuaranteeDataList = [];
                for(var i = 0; i < scope.guaranteeDataList.length; i++){
                     if(scope.guaranteeDataList[i].isSelected){
                        selectedGuaranteeDataList.push(scope.guaranteeDataList[i]);
                     }
                }
                return selectedGuaranteeDataList.length < 1;

          }

           scope.selectAllGuarantees = function(){
                for (var i = 0; i < scope.guaranteeDataList.length; i++ ){
                     scope.guaranteeDataList[i].isSelected = scope.isAllGuaranteeSelected;
                }
            }

            scope.payGuaranteesByCheques = function(){
                var selectedGuaranteeDataList = [];
                for(var i = 0; i < scope.guaranteeDataList.length; i++){
                     if(scope.guaranteeDataList[i].isSelected){
                         var selectedGuarantee = {
                            guaranteeId: scope.guaranteeDataList[i].id,
                            clientNo: scope.guaranteeDataList[i].clientNo,
                            caseId: scope.guaranteeDataList[i].caseId,
                            chequeId: scope.guaranteeDataList[i].chequeData.id,
                            guaranteeAmount: scope.guaranteeDataList[i].requestedAmount,
                            guaranteeName: scope.guaranteeDataList[i].clientName,
                         }
                        selectedGuaranteeDataList.push(selectedGuarantee);
                     }
                }
                var request = {
                   locale: scope.optlang.code,
                   guarantees: selectedGuaranteeDataList
                }
                resourceFactory.chequeBatchResource.payGuarantees({ commandParam: 'payguaranteesbycheques'}, request, function (data) {
                     route.reload();
                });
            }
        }
    });

    mifosX.ng.application.controller('PayGuaranteesWithChequesController', ['$scope', '$routeParams', '$route', '$location', 'ResourceFactory', '$http', '$uibModal', 'API_VERSION', '$rootScope', 'dateFilter', mifosX.controllers.PayGuaranteesWithChequesController]).run(function ($log) {
        $log.info("PayGuaranteesWithChequesController initialized");
    });
}(mifosX.controllers || {}));
