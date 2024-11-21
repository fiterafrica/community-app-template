(function (module) {
    mifosX.controllers = _.extend(module, {
        RestructureCreditsController: function (scope, resourceFactory, routeParams, location, dateFilter,$uibModal) {
            scope.clientId = routeParams.clientId;
            scope.formData = {};
            scope.loandetails = {};
            scope.inparams = {resourceType: 'template', activeOnly: 'true',clientId:routeParams.clientId};
            scope.formData.clientId = routeParams.clientId;
            scope.chargeFormData = {}; //For charges
            scope.outstandingBalance=0;
            scope.restructureData;
            scope.product;

            resourceFactory.restructurecreditsResource.template({clientId:scope.clientId,anotherResource:'template'},function(data){

                scope.activeLoans = data.activeLoans;
                scope.clientData = data.clientData;
                scope.requestData = data.requestData;
                scope.loanProductData = data.loanProductData;
                if (data.requestData){
                    scope.retrieveLoanProductTemplate(data.requestData);
                }
            });
            scope.cancel = function () {
                location.path('/viewclient/' + scope.clientId);
            };
            scope.computeTotalBalance = function () {
                scope.outstandingBalance =0;
                for (let i=0; i<scope.activeLoans.length; i++) {
                    if (scope.activeLoans[i].selected){
                        scope.outstandingBalance = scope.outstandingBalance+ Number(scope.activeLoans[i].summary.principalOutstanding)
                    }
                }

            };

            scope.retrieveLoanProductTemplate = function (requestData) {
                scope.inparams.productId = requestData.productId;
                scope.formData.productId = requestData.productId;
                scope.inparams.templateType = 'individual';
                scope.formData.loanType = 'individual';

                scope.inparams.staffInSelectedOfficeOnly = true;

                resourceFactory.loanResource.get(scope.inparams, function (data) {
                    scope.loanaccountinfo = data;
                    scope.product = data.product;

                    scope.previewClientLoanAccInfo();
                    scope.loandetails.interestValue = scope.loanaccountinfo.interestType.value;
                    scope.loandetails.amortizationValue = scope.loanaccountinfo.amortizationType.value;
                    scope.loandetails.interestCalculationPeriodValue = scope.loanaccountinfo.interestCalculationPeriodType.value;
                    scope.loandetails.transactionProcessingStrategyValue = scope.formValue(scope.loanaccountinfo.transactionProcessingStrategyOptions, scope.formData.transactionProcessingStrategyId, 'id', 'name');
                    scope.datatables = data.datatables;
                    scope.handleDatatables(scope.datatables);
                    scope.disabled = false;
                });

                resourceFactory.loanResource.get({
                    resourceType: 'template',
                    templateType: 'collateral',
                    productId: requestData.productId,
                    clientId: scope.clientId,
                    fields: 'id,loanCollateralOptions'
                }, function (data) {
                    scope.collateralOptions = data.loanCollateralOptions || [];
                });
            };

            scope.formValue = function (array, model, findattr, retAttr) {
                findattr = findattr ? findattr : 'id';
                retAttr = retAttr ? retAttr : 'value';
                console.log("finding: "+findattr, retAttr, model);
                return _.find(array, function (obj) {
                    return obj[findattr] === model;
                })[retAttr];
            };

            scope.handleDatatables = function (datatables) {
                if (!_.isUndefined(datatables) && datatables.length > 0) {
                    scope.formData.datatables = [];
                    scope.formDat.datatables = [];
                    scope.noOfTabs = datatables.length + 1;
                    angular.forEach(datatables, function (datatable, index) {
                        scope.updateColumnHeaders(datatable.columnHeaderData);
                        angular.forEach(datatable.columnHeaderData, function (colHeader, i) {
                            if (_.isEmpty(scope.formDat.datatables[index])) {
                                scope.formDat.datatables[index] = {data: {}};
                            }

                            if (_.isEmpty(scope.formData.datatables[index])) {
                                scope.formData.datatables[index] = {
                                    registeredTableName: datatable.registeredTableName,
                                    data: {locale: scope.optlang.code}
                                };
                            }

                            if (datatable.columnHeaderData[i].columnDisplayType == 'DATETIME') {
                                scope.formDat.datatables[index].data[datatable.columnHeaderData[i].columnName] = {};
                            }
                        });
                    });
                }
            };



            scope.resolveDateTime = function (dateTime) {
                if (dateTime){
                    let year = dateTime[0]
                    let month = dateTime[1].toString().padStart(2,'0');
                    let date = dateTime[2].toString().padStart(2,'0');
                    let hour = dateTime[3].toString().padStart(2,'0');
                    let minute = dateTime[4].toString().padStart(2,'0');
                    let seconds = dateTime[5].toString().padStart(2,'0');
                    return ""+ year +"-"+ month+"-"+ date+" "+ hour+":"+ minute+":"+ seconds;
                }
            };

            scope.submit = function () {
                console.log("selected loans: \n\n"+ JSON.stringify(scope.activeLoans))
                let selectedLoans = []
                for (let i=0; i<scope.activeLoans.length; i++){
                    if (scope.activeLoans[i].selected){
                        selectedLoans.push(scope.activeLoans[i].id)
                    }
                };

                var disbursementDate = dateFilter(scope.formData.disbursementDate, scope.dft);


                let formData = {
                    ...this.formData,
                    clientId:scope.clientId,
                    selectedLoanIds: selectedLoans,
                    disbursementDate: disbursementDate,
                    outstandingBalance: scope.outstandingBalance,
                    locale : scope.optlang.code,
                    dateFormat: scope.dft
                }

                resourceFactory.restructurecreditsResource.save({clientId:scope.clientId},formData,function(data){
                    location.path('/viewclient/' + scope.clientId);
                });


            };

            scope.processRequest = function (action) {
                scope.action = action;
                $uibModal.open({
                    templateUrl: 'processRequest.html',
                    controller: ProcessRequestCtrl
                });
            }

            var ProcessRequestCtrl = function ($scope, $uibModalInstance) {
                $scope.action = scope.action;
                scope.formData.principal = scope.requestData.totalLoanAmount;
                $scope.processRequest = function () {
                    let formData = {
                        requestId:scope.requestData.id,
                        transactionDate : dateFilter(new Date(), scope.df),
                        notes : scope.requestData.comments,
                        locale : scope.optlang.code,
                        dateFormat: scope.df,
                        loanData: scope.formData
                    };

                    console.log("final sending : "+ JSON.stringify(formData));

                    resourceFactory.restructurecreditsResource.save({clientId:scope.clientId, anotherresource: scope.action}, formData, function (data) {
                        $uibModalInstance.close('delete');
                        location.path('/viewclient/' + scope.clientId);
                    });
                };
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            };

            scope.previewClientLoanAccInfo = function () {
                scope.previewRepayment = false;
                scope.charges = scope.loanaccountinfo.charges || [];
                scope.formData.disbursementData = scope.loanaccountinfo.disbursementDetails || [];
                scope.collaterals = [];

                if (scope.loanaccountinfo.calendarOptions) {
                    scope.formData.syncRepaymentsWithMeeting = true;
                    scope.formData.syncDisbursementWithMeeting = true;
                }
                scope.multiDisburseLoan = scope.loanaccountinfo.multiDisburseLoan;
                scope.formData.productId = scope.loanaccountinfo.loanProductId;
                scope.formData.fundId = scope.loanaccountinfo.fundId;
                scope.formData.principal = scope.loanaccountinfo.principal;
                scope.formData.loanTermFrequency = scope.loanaccountinfo.termFrequency;
                scope.formData.loanTermFrequencyType = scope.loanaccountinfo.termPeriodFrequencyType.id;
                scope.loandetails.loanTermFrequencyValue = scope.loanaccountinfo.termPeriodFrequencyType.value;
                scope.formData.numberOfRepayments = scope.loanaccountinfo.numberOfRepayments;
                scope.formData.repaymentEvery = scope.loanaccountinfo.repaymentEvery;
                scope.formData.repaymentFrequencyType = scope.loanaccountinfo.repaymentFrequencyType.id;
                scope.loandetails.repaymentFrequencyValue = scope.loanaccountinfo.repaymentFrequencyType.value;
                scope.formData.interestRatePerPeriod = scope.loanaccountinfo.interestRatePerPeriod;
                scope.formData.amortizationType = scope.loanaccountinfo.amortizationType.id;
                scope.formData.fixedPrincipalPercentagePerInstallment = scope.loanaccountinfo.fixedPrincipalPercentagePerInstallment;
                scope.formData.isEqualAmortization = scope.loanaccountinfo.isEqualAmortization;
                scope.loandetails.amortizationValue = scope.loanaccountinfo.amortizationType.value;
                scope.formData.interestType = scope.loanaccountinfo.interestType.id;
                scope.loandetails.interestValue = scope.loanaccountinfo.interestType.value;
                scope.formData.interestCalculationPeriodType = scope.loanaccountinfo.interestCalculationPeriodType.id;
                scope.loandetails.interestCalculationPeriodValue = scope.loanaccountinfo.interestCalculationPeriodType.value;
                scope.formData.allowPartialPeriodInterestCalcualtion = scope.loanaccountinfo.allowPartialPeriodInterestCalcualtion;
                scope.formData.inArrearsTolerance = scope.loanaccountinfo.inArrearsTolerance;
                scope.formData.graceOnPrincipalPayment = scope.loanaccountinfo.graceOnPrincipalPayment;
                scope.formData.graceOnInterestPayment = scope.loanaccountinfo.graceOnInterestPayment;
                scope.formData.graceOnArrearsAgeing = scope.loanaccountinfo.graceOnArrearsAgeing;
                scope.formData.transactionProcessingStrategyId = scope.loanaccountinfo.transactionProcessingStrategyId;
                scope.loandetails.transactionProcessingStrategyValue = scope.formValue(scope.loanaccountinfo.transactionProcessingStrategyOptions, scope.formData.transactionProcessingStrategyId, 'id', 'name');
                scope.formData.graceOnInterestCharged = scope.loanaccountinfo.graceOnInterestCharged;
                scope.formData.fixedEmiAmount = scope.loanaccountinfo.fixedEmiAmount;
                scope.formData.maxOutstandingLoanBalance = scope.loanaccountinfo.maxOutstandingLoanBalance;

                if (scope.loanaccountinfo.isInterestRecalculationEnabled && scope.loanaccountinfo.interestRecalculationData.recalculationRestFrequencyDate) {
                    scope.date.recalculationRestFrequencyDate = new Date(scope.loanaccountinfo.interestRecalculationData.recalculationRestFrequencyDate);
                }
                if (scope.loanaccountinfo.isInterestRecalculationEnabled && scope.loanaccountinfo.interestRecalculationData.recalculationCompoundingFrequencyDate) {
                    scope.date.recalculationCompoundingFrequencyDate = new Date(scope.loanaccountinfo.interestRecalculationData.recalculationCompoundingFrequencyDate);
                }

                if (scope.loanaccountinfo.isLoanProductLinkedToFloatingRate) {
                    scope.formData.isFloatingInterestRate = false;
                }

                scope.loandetails = angular.copy(scope.formData);
                // console.log("prods: \n\n"+ JSON.stringify(scope.products));
                // scope.loandetails.productName = scope.formValue(scope.products, scope.formData.productId, 'id', 'name');
                scope.formData.rates = scope.loanaccountinfo.product.rates;
                if (scope.formData.rates && scope.formData.rates.length > 0) {
                    scope.rateFlag = true;
                }
                scope.rateOptions = [];

                console.log("form data to send: "+ JSON.stringify(scope.formData));
            };

        }
    });
    mifosX.ng.application.controller('RestructureCreditsController', ['$scope', 'ResourceFactory', '$routeParams', '$location', 'dateFilter','$uibModal', mifosX.controllers.RestructureCreditsController]).run(function ($log) {
        $log.info("RestructureCreditsController initialized");
    });
}(mifosX.controllers || {}));
