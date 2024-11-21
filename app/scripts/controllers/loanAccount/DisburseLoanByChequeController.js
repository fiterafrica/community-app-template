(function (module) {
    mifosX.controllers = _.extend(module, {

        DisburseLoanByChequeController: function (scope, routeParams, route, location, resourceFactory, http, $uibModal, API_VERSION, $rootScope, dateFilter) {
            scope.isCollapsed = false;
            scope.isChequeAssigned = false;
            scope.allLoansSelected = false;
            scope.approvedLoanAccounts = [];
            scope.selectedLoanAccounts= [];
            scope.availableCheques= [];
            scope.formData = {};
            scope.uiValidationErrors = [];
            scope.bankAccountOptions = [];
            resourceFactory.loanTemplateResource.get({templateType: 'cheque'}, function (data) {
                scope.agencyOptions = data.agencyOptions;
                scope.centerOptions = data.centerOptions;
                scope.allGroupOptions = data.groupOptions;
                scope.groupOptions = data.groupOptions;
                scope.facilitatorOptions = data.facilitatorOptions;
                scope.disbursementMethodOptions = data.disbursementMethodOptions;
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

            scope.searchApprovedLoanAccounts = function () {
                   this.formData.limit = 2147483647;
                   this.formData.sqlSearch = 'l.loan_status_id IN (200)';
                   this.formData.locale =  scope.optlang.code;
                   this.formData.dateFormat = scope.df;
                   if(this.formData.approvalEndDate){
                       this.formData.approvalEndDate = dateFilter(this.formData.approvalEndDate,  scope.df);
                   }
                   if(this.formData.approvalStartDate){
                      this.formData.approvalStartDate = dateFilter(this.formData.approvalStartDate,  scope.df);
                   }
                   if(this.formData.disbursementStartDate){
                      this.formData.disbursementStartDate = dateFilter(this.formData.disbursementStartDate,  scope.df);
                   }
                   if(this.formData.disbursementEndDate){
                      this.formData.disbursementEndDate = dateFilter(this.formData.disbursementEndDate,  scope.df);
                   }
                   resourceFactory.loanResource.getAllLoans(this.formData, function (data) {
                        scope.approvedLoanAccounts = data.pageItems;
                   });
            }

            scope.search = function () {
                 scope.searchApprovedLoanAccounts();
                 scope.fetchAvailableCheques();
                 scope.isCollapsed = true;
                 scope.allLoansSelected = false;
                 scope.uiValidationErrors = [];
            }

             scope.calculateDiffWithZeroDefault = function(value1, value2){
                  if(value1 && value2){
                    return (value1 - value2) < 0 ? 0 : (value1 - value2);
                  }else {
                     return 0;
                  }
              }

            scope.calculateDepositAmount = function(requiredGuarantee, actualGuarantee){
                if(requiredGuarantee !== undefined && actualGuarantee !== undefined){
                    if(requiredGuarantee === 0){
                        // No Guarantee Required
                        return 0;
                    }else if(requiredGuarantee < actualGuarantee){
                        // Actual Client Account Balance is greater than Required Guarantee so no need to deposit
                        return 0;
                    }else {
                        // Required Guanratee is Greater than available account balance
                        return Math.abs(requiredGuarantee - actualGuarantee);
                    }
                }else {
                   return 0;
                }
            }

            scope.fetchAvailableCheques = function () {
                resourceFactory.searchChequeResource.get({
                    orderBy: 'chequeNo',
                    sortOrder: 'ASC',
                    agencyId: scope.formData.checkAgencyId,
                    status: 1
                }, function (data) {
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

            scope.assignChequesFromBankAccount = function(bankAccId){
                var selectedLoanAccounts = [];
                for(var i = 0; i < scope.approvedLoanAccounts.length; i++){
                     delete scope.approvedLoanAccounts[i].chequeData;
                     if(scope.approvedLoanAccounts[i].isSelected){
                        selectedLoanAccounts.push(scope.approvedLoanAccounts[i]);
                     }
                }

                var availableBankCheques = [];
                for(var i = 0; i < scope.availableCheques.length; i++){
                     if(scope.availableCheques[i].bankAccId === bankAccId){
                        availableBankCheques.push(scope.availableCheques[i]);
                     }
                }

                scope.uiValidationErrors = [];
                if(selectedLoanAccounts.length < 1){
                  scope.uiValidationErrors.push({
                        message: 'error.message.select.at.least.one.cheque'
                   });
                } else if (selectedLoanAccounts.length > availableBankCheques.length){
                  scope.uiValidationErrors.push({
                      message: 'error.message.insufficient.amount.of.cheques'
                   });
                } else {
                    let mappedChequeIndex = 0;
                    for (var i = 0; i < scope.approvedLoanAccounts.length; i++ ){
                       if(scope.approvedLoanAccounts[i].isSelected){
                           scope.availableCheques[i].isAssigned = true;
                           scope.approvedLoanAccounts[i].chequeData = availableBankCheques[mappedChequeIndex];
                           var chequeData = scope.approvedLoanAccounts[i].chequeData;
                           var chequeName = chequeData.chequeNo + ' |' +  chequeData .batchNo + '| ' +  chequeData .bankAccNo +  '| ' +  chequeData.bankName + '| ' + chequeData.agencyName;
                           scope.approvedLoanAccounts[i].chequeData.chequeName = chequeName;
                           mappedChequeIndex++;
                       }
                    }
                    scope.uiValidationErrors = [];
                    scope.isChequeAssigned = true;
               }
            }

          scope.isAssignBtnDisabled = function (){
                var selectedLoanAccounts = [];
                for(var i = 0; i < scope.approvedLoanAccounts.length; i++){
                     if(scope.approvedLoanAccounts[i].isSelected){
                        selectedLoanAccounts.push(scope.approvedLoanAccounts[i]);
                     }
                }
                return selectedLoanAccounts.length < 1;
          }

           scope.selectAllLoans = function(){
                for (var i = 0; i < scope.approvedLoanAccounts.length; i++ ){
                     scope.approvedLoanAccounts[i].isSelected = scope.allLoansSelected;
                }
            }

            function groupBy(items, key) {
                  const map = new Map();
                  items.forEach((item) => {
                    const keyValue = item[key];
                    const currArr = map.has(keyValue) ? map.get(keyValue) : [];
                    currArr.push(item);
                    map.set(keyValue, currArr);
                  });
                  return map;
            }

            var AssignLoanChequesController = function ($scope, $uibModalInstance) {
                $scope.bankAccountOptions = scope.bankAccountOptions;
                if (Array.isArray($scope.bankAccountOptions) &&  $scope.bankAccountOptions.length) {
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

            scope.assignLoanCheques = function () {
                 $uibModal.open({
                    templateUrl: 'assignLoanCheques.html',
                    controller: AssignLoanChequesController
                });
            };

            scope.disburseByCheques = function(){
                var selectedLoanAccounts = [];
                for(var i = 0; i < scope.approvedLoanAccounts.length; i++){
                     if(scope.approvedLoanAccounts[i].isSelected){
                        var requiredGuaranteeAmount = scope.approvedLoanAccounts[i].requiredGuaranteeAmount;
                        var actualGuaranteeAmount = scope.approvedLoanAccounts[i].actualGuaranteeAmount;
                         var selectedLoanAccount = {
                            loanId: scope.approvedLoanAccounts[i].id,
                            chequeId: scope.approvedLoanAccounts[i].chequeData.id,
                            description: scope.approvedLoanAccounts[i].description,
                            actualGuaranteeAmount: scope.approvedLoanAccounts[i].actualGuaranteeAmount,
                            requiredGuaranteeAmount: scope.approvedLoanAccounts[i].requiredGuaranteeAmount,
                            depositGuaranteeAmount: scope.calculateDepositAmount(scope.approvedLoanAccounts[i].requiredGuaranteeAmount, scope.approvedLoanAccounts[i].actualGuaranteeAmount),
                            depositGuaranteeNo: scope.approvedLoanAccounts[i].depositGuaranteeNo,
                            locale: scope.optlang.code
                         }
                        selectedLoanAccounts.push(selectedLoanAccount);
                     }
                }
               resourceFactory.loanResource.save({command: 'disbursebycheques'}, selectedLoanAccounts, function (data) {
                     route.reload();
                });
            }
        }
    });

    mifosX.ng.application.controller('DisburseLoanByChequeController', ['$scope', '$routeParams', '$route', '$location', 'ResourceFactory', '$http', '$uibModal', 'API_VERSION', '$rootScope', 'dateFilter', mifosX.controllers.DisburseLoanByChequeController]).run(function ($log) {
        $log.info("DisburseLoanByChequeController initialized");
    });
}(mifosX.controllers || {}));
