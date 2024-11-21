(function (module) {
    mifosX.controllers = _.extend(module, {
        NewLoanAccAppController: function (scope, routeParams, resourceFactory, location,$uibModal, dateFilter, uiConfigService, WizardHandler, translate, API_VERSION, Upload, $rootScope) {
            scope.previewRepayment = false;
            scope.clientId = routeParams.clientId;
            scope.groupId = routeParams.groupId;
            scope.restrictDate = new Date();
            scope.formData = {};
            scope.loandetails = {};
            scope.chargeFormData = {}; //For charges
            scope.collateralFormData = {}; //For collaterals
            scope.inparams = {resourceType: 'template', activeOnly: 'true'};
            scope.date = {};
            scope.formDat = {};
            scope.datatables = [];
            scope.noOfTabs = 1;
            scope.step = '-';
            scope.formData.datatables = [];
            scope.formDat.datatables = [];
            scope.tf = "HH:mm";
            scope.loanApp = "LoanApp";
            scope.customSteps = [];
            scope.tempDataTables = [];
            scope.disabled = true;
            scope.translate = translate;
            scope.rateFlag = false;
            scope.collateralAddedDataArray = [];
            scope.currentLoans = [];
            scope.collateralsData = {};
            scope.addedCollateral = {};
            scope.currentLoanData = {};
            scope.currentLoanDocs = {}
            scope.loanDocuments = [];
            scope.product;
            scope.clientHousingType;
            scope.formData.totalExternalLoanAmount =0;
            scope.formData.totalInstallments =0
            scope.institutionTypeOptions = [
                {id:1,code:"MICROFINANCE",description:"Micro Finance"}
            ];
            scope.loanStatusOptions = [
                {id:1,code:"ACTIVE",description:"ACTIVE"}
            ];

            scope.date.first = new Date();
            scope.date.fifth = new Date();

            if (scope.clientId) {
                scope.inparams.clientId = routeParams.clientId;
                scope.formData.clientId = routeParams.clientId;
            }


            if (scope.groupId) {
                scope.inparams.groupId = scope.groupId;
                scope.formData.groupId = scope.groupId;
            }

            if (scope.clientId && scope.groupId) {
                scope.inparams.templateType = 'jlg';
            } else if (scope.groupId) {
                scope.inparams.templateType = 'group';
            } else if (scope.clientId) {
                scope.inparams.templateType = 'individual';
            }

            scope.inparams.staffInSelectedOfficeOnly = true;
            scope.currencyType;

            scope.validateAgeLimit = function (productId) {

                if (scope.clientId) {
                    resourceFactory.loanAgeLimitResource.validateAge({clientId: routeParams.clientId, productId: productId}, function (data) {
                        console.log("age limit response: "+ data.value)
                        if (data.value === 'WARNING') {
                            $uibModal.open({
                                templateUrl: 'ageLimitWarning.html',
                                controller: AgeLimitCtrl,
                            });
                        } else if (data.value === 'BLOCK') {
                            $uibModal.open({
                                templateUrl: 'ageLimitBlock.html',
                                controller: AgeLimitCtrl,
                            });
                            scope.cancel();
                        }
                    });
                }
            }

            var AgeLimitCtrl = function ($scope, $uibModalInstance) {
                $scope.loanProduct = scope.product;

                $scope.continue = function () {
                    $uibModalInstance.dismiss('cancel');
                };

                $scope.doNothing = function (){
                    if (scope.groupId) {
                        location.path('/viewgroup/' + scope.groupId);
                    } else if (scope.clientId) {
                        location.path('/viewclient/' + scope.clientId);
                    }
                    $uibModalInstance.dismiss('cancel');
                }

                $scope.cancel = function () {
                    if (scope.groupId) {
                        location.path('/viewgroup/' + scope.groupId);
                    } else if (scope.clientId) {
                        location.path('/viewclient/' + scope.clientId);
                    }
                    $uibModalInstance.dismiss('cancel');
                };
            }

            resourceFactory.loanResource.get(scope.inparams, function (data) {
                scope.products = data.productOptions;
                scope.ratesEnabled = data.isRatesEnabled;

                if (data.clientName) {
                    scope.clientName = data.clientName;
                }
                if (data.group) {
                    scope.groupName = data.group.name;
                }
            });

            if(scope.groupId){
                resourceFactory.groupResource.get({groupId: scope.groupId, associations: 'all'}, function (data) {
                    scope.prequalificationOptions = data.prequalificationGroups;
                });
            }

            if(scope.clientId){
              resourceFactory.clientResource.get({clientId: scope.clientId}, function (data) {
                 scope.prequalificationOptions = data.clientPrequalifications;
                 scope.clientData = data;

                 scope.formData.fullName = data.displayName;
                 scope.formData.maidenName = data.detailData.maidenName;
                 scope.formData.nationality = data.detailData.nationality;
                 scope.formData.language = data.detailData.languages;
                 scope.formData.occupancyClassification = Number(data.detailData.economicSector);
                  let clientContactInformation = data.clientContactInformation;
                  if (clientContactInformation){
                     scope.clientHousingType = clientContactInformation.housingType;
                     scope.formData.yearsInCommunity = Number(clientContactInformation.communityYears);
                 }
                 scope.date.sixth = new Date(data.dateOfBirth);
                 scope.formData.phoneNumber = data.mobileNo;
                 scope.formData.dpi = data.dpiNumber;
                 scope.formData.nit = data.nit;
                 scope.formData.jobType = data.jobType;
                 scope.formData.educationLevel = data.educationLevel;
                 scope.formData.maritalStatus = data.maritalStatus;
              });
            }

            scope.prequalificationChange = function (prequalificationId){
                resourceFactory.prequalificationResource.get({groupId: prequalificationId}, function (data) {
                    var loanProductId = data.productId;
                    scope.groupId = data.linkedGroupId
                    if(data.prequalificationType){
                        scope.prequalificationType = data.prequalificationType.value;
                    }
                    if(scope.clientId){
                        var groupMembers = data.groupMembers;
                        if(groupMembers.length > 0){
                            for(var i = 0; i < groupMembers.length; i++){
                                if(groupMembers[i].dpi === scope.clientData.dpiNumber){
                                   scope.totalApprovedAmount = groupMembers[i].requestedAmount;
                                }
                            }
                        }
                    } else {
                       scope.totalApprovedAmount = data.totalApprovedAmount ? data.totalApprovedAmount : data.totalApprovedAmount;
                    }
                    scope.loanProductChange(loanProductId);
                });
            }
           scope.resolveFrequencyDayOfWeek = function (meetingDay){
               if(meetingDay == 'Lunes'){
                    scope.disableDaySelect = true;
                    return 1;
                }if(meetingDay == 'Martes'){
                   scope.disableDaySelect = true;
                   return 2;
                }if(meetingDay == 'Miércoles'){
                   scope.disableDaySelect = true;
                   return 3;
                }if(meetingDay == 'Jueves'){
                   scope.disableDaySelect = true;
                   return 4;
                }
            } ;

            scope.loanProductChange = function (loanProductId) {
                // _.isUndefined(scope.datatables) ? scope.tempDataTables = [] : scope.tempDataTables = scope.datatables;
                // WizardHandler.wizard().removeSteps(1, scope.tempDataTables.length);
                scope.inparams.productId = loanProductId;
                scope.inparams.groupId = scope.groupId;
                resourceFactory.clientcollateralTemplateResource.getAllCollaterals({
                    clientId: routeParams.clientId,
                    prodId: loanProductId
                }, function (data) {
                    scope.collateralsData = data;
                    scope.collateralsData = scope.collateralsData.filter((collateral) => collateral.quantity != 0);
                });
                // scope.datatables = [];
                resourceFactory.loanResource.get(scope.inparams, function (data) {
                    scope.loanaccountinfo = data;
                    scope.product = data.product;
                    scope.validateAgeLimit(loanProductId);
                    scope.previewClientLoanAccInfo();
                    scope.fetchAdditinalDataTemplate();
                    if (data.product.ownerTypeOption.value ==='Group'){
                        if (data.group){
                            scope.formData.repaymentFrequencyDayOfWeekType = scope.resolveFrequencyDayOfWeek(data.group.meetingDayName)
                            if (data.group.meetingFrequencyRange){
                                scope.disableFrequencySelect = true;
                                scope.formData.repaymentFrequencyNthDayType = data.group.meetingFrequencyRange
                            }
                        }
                    }
                    scope.loandetails.interestValue = scope.loanaccountinfo.interestType.code;
                    scope.loandetails.amortizationValue = scope.loanaccountinfo.amortizationType.code;
                    scope.loandetails.interestCalculationPeriodValue = scope.loanaccountinfo.interestCalculationPeriodType.code;
                    scope.loandetails.transactionProcessingStrategyValue = scope.formValue(scope.loanaccountinfo.transactionProcessingStrategyOptions, scope.formData.transactionProcessingStrategyId, 'id', 'code');
                    scope.datatables = data.datatables;
                    scope.handleDatatables(scope.datatables);
                    scope.disabled = false;
                });

                resourceFactory.loanResource.get({
                    resourceType: 'template',
                    templateType: 'collateral',
                    productId: loanProductId,
                    fields: 'id,loanCollateralOptions'
                }, function (data) {
                    scope.collateralOptions = data.loanCollateralOptions || [];
                });

            }

            scope.goNext = function (form) {
                WizardHandler.wizard().checkValid(form);
            }

            scope.fetchAdditinalDataTemplate = function () {
                resourceFactory.loanResource.get({
                    resourceType: 'template',
                    templateType: 'groupAdditionals'
                }, function (data) {
                    scope.loanCycleCompletedOptions = data.loanCycleCompletedOptions || [];
                    scope.loanPurposeOptions = data.loanPurposeOptions || [];
                    scope.businessEvolutionOptions = data.businessEvolutionOptions || [];
                    scope.yesnoOptions = data.yesnoOptions || [];
                    scope.businessExperienceOptions = data.businessExperienceOptions || [];
                    scope.businessLocationOptions = data.businessLocationOptions || [];
                    scope.clientTypeOptions = data.clientTypeOptions || [];
                    scope.loanStatusOptions = data.loanStatusOptions || [];
                    scope.institutionTypeOptions = data.institutionTypeOptions || [];
                    scope.housingTypeOptions = data.housingTypeOptions || [];
                    if (data.housingTypeOptions && scope.clientHousingType){
                        console.log("going to set housing type: "+ scope.clientHousingType)
                        scope.housingTypeOptions.filter((housingType) => {
                            if (housingType.description === scope.clientHousingType){
                                scope.formData.housingType = housingType.id;
                            }
                        });

                    }
                    scope.classificationOptions = data.classificationOptions || [];
                    scope.economicSectorOptions = data.economicSectorOptions || [];
                    scope.jobTypeOptions = data.jobTypeOptions || [];
                    scope.educationLevelOptions = data.educationLevelOptions || [];
                    scope.maritalStatusOptions = data.maritalStatusOptions || [];
                    scope.groupPositionOptions = data.groupPositionOptions || [];
                    scope.sourceOfFundsOptions = data.sourceOfFundsOptions || [];
                    scope.cancellationReasonOptions = data.cancellationReasonOptions || [];
                    scope.facilitatorOptions = data.facilitatorOptions || [];
                    scope.documentTypeOptions = data.documentTypeOptions || [];
                });
            }

            scope.addCurrentLoansDetails = function () {
                scope.currentLoans.push(scope.currentLoanData);
                scope.currentLoanData = {}

                scope.formData.externalLoans = scope.currentLoans;
                scope.calculateTotals();
            }

            scope.addLoanDocuments = function () {
                scope.loanDocuments.push(scope.currentLoanDocs);
                scope.currentLoanDocs = {}
            }

            scope.onFileSelect = function (files) {
                scope.currentLoanDocs.file = files[0];
            };

            scope.removeDoc = function (files) {
                scope.currentLoanDocs.file = files[0];
                scope.loanDocuments.splice(Number(index), 1)
            };

            scope.calculateTotals = function (){
                scope.formData.totalExternalLoanAmount = 0;
                scope.formData.totalInstallments = 0;
                angular.forEach(scope.currentLoans, function (currentLoan, index) {
                    scope.formData.totalExternalLoanAmount += Number(currentLoan.totalLoanBalance?Number(currentLoan.totalLoanBalance):0);
                    scope.formData.totalInstallments += Number(currentLoan.charges?Number(currentLoan.charges):0);
                });
            }

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

            scope.updateColumnHeaders = function (columnHeaderData) {
                var colName = columnHeaderData[0].columnName;
                if (colName == 'id') {
                    columnHeaderData.splice(0, 1);
                }

                colName = columnHeaderData[0].columnName;
                if (colName == 'client_id' || colName == 'office_id' || colName == 'group_id' || colName == 'center_id' || colName == 'loan_id' || colName == 'savings_account_id') {
                    columnHeaderData.splice(0, 1);
                }
            };
            //Wizard is creating new scope on every step. So resetting the variable here
            scope.resetPreviewFlag = function () {
                scope.previewRepayment = !scope.previewRepayment;
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
                scope.formData.principal = scope.totalApprovedAmount ? scope.totalApprovedAmount : scope.loanaccountinfo.principal;
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
                scope.loandetails.interestValue = scope.loanaccountinfo.interestType.code;
                scope.formData.interestCalculationPeriodType = scope.loanaccountinfo.interestCalculationPeriodType.id;
                scope.loandetails.interestCalculationPeriodValue = scope.loanaccountinfo.interestCalculationPeriodType.code;
                scope.formData.allowPartialPeriodInterestCalcualtion = scope.loanaccountinfo.allowPartialPeriodInterestCalcualtion;
                scope.formData.inArrearsTolerance = scope.loanaccountinfo.inArrearsTolerance;
                scope.formData.graceOnPrincipalPayment = scope.loanaccountinfo.graceOnPrincipalPayment;
                scope.formData.graceOnInterestPayment = scope.loanaccountinfo.graceOnInterestPayment;
                scope.formData.graceOnArrearsAgeing = scope.loanaccountinfo.graceOnArrearsAgeing;
                scope.formData.transactionProcessingStrategyId = scope.loanaccountinfo.transactionProcessingStrategyId;
                scope.loandetails.transactionProcessingStrategyValue = scope.formValue(scope.loanaccountinfo.transactionProcessingStrategyOptions, scope.formData.transactionProcessingStrategyId, 'id', 'code');
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
                scope.loandetails.productName = scope.formValue(scope.products, scope.formData.productId, 'id', 'name');
                scope.formData.rates = scope.loanaccountinfo.product.rates;
                if (scope.formData.rates && scope.formData.rates.length > 0) {
                    scope.rateFlag = true;
                }
                scope.rateOptions = [];
                if(scope.clientId && scope.formData.caseId){
                    scope.searchText = scope.formData.caseId;
                    scope.searchByCaseId();
                }
            };

            //Rate
            scope.rateSelected = function (currentRate) {

                if (currentRate && !scope.checkIfRateAlreadyExist(currentRate)) {
                    scope.rateFlag = true;
                    scope.formData.rates.push(currentRate);
                    scope.rateOptions.splice(scope.rateOptions.indexOf(currentRate), 1);
                    scope.currentRate = '';
                    currentRate = '';
                    scope.calculateRates();
                }
            };

            scope.checkIfRateAlreadyExist = function (currentRate) {
                var exist = false;
                scope.formData.rates.forEach(function (rate) {
                    if (rate.id === currentRate.id) {
                        exist = true;
                    }
                });

                return exist
            };

            scope.calculateRates = function () {
                var total = 0;
                scope.formData.rates.forEach(function (rate) {
                    total += rate.percentage;
                });
                if (total === 0) {
                    total = undefined;
                    scope.rateFlag = false;
                }
                scope.formData.interestRatePerPeriod = total;


            };

            scope.deleteRate = function (index) {
                scope.rateOptions.push(scope.formData.rates[index]);
                scope.formData.rates.splice(index, 1);
                scope.calculateRates();
            };

            scope.$watch('formData', function (newVal) {
                scope.loandetails = angular.extend(scope.loandetails, newVal);
            }, true);

            scope.formValue = function (array, model, findattr, retAttr) {
                findattr = findattr ? findattr : 'id';
                retAttr = retAttr ? retAttr : 'value';
                console.log(findattr, retAttr, model);
                return _.find(array, function (obj) {
                    return obj[findattr] === model;
                })[retAttr];
            };

            scope.addCharge = function () {
                if (scope.chargeFormData.chargeId) {
                    resourceFactory.chargeResource.get({
                        chargeId: this.chargeFormData.chargeId,
                        template: 'true'
                    }, function (data) {
                        data.chargeId = data.id;
                        scope.charges.push(data);
                        scope.chargeFormData.chargeId = undefined;
                    });
                }
            }

            scope.deleteCharge = function (index) {
                scope.charges.splice(index, 1);
            }


            scope.addTranches = function () {
                scope.formData.disbursementData.push({});
            };
            scope.deleteTranches = function (index) {
                scope.formData.disbursementData.splice(index, 1);
            }

            scope.syncRepaymentsWithMeetingchange = function () {
                if (!scope.formData.syncRepaymentsWithMeeting) {
                    scope.formData.syncDisbursementWithMeeting = false;
                }
            };

            scope.syncDisbursementWithMeetingchange = function () {
                if (scope.formData.syncDisbursementWithMeeting) {
                    scope.formData.syncRepaymentsWithMeeting = true;
                }
            };

            scope.addCollateral = function () {
                scope.collateralAddedDataArray.push(scope.collateralsData.filter((collateral) => scope.collateralFormData.collateralId == collateral.collateralId)[0]);
                scope.collateralsData = scope.collateralsData.filter((collateral) => scope.collateralFormData.collateralId != collateral.collateralId);
                scope.collaterals.push({
                    collateralId: scope.collateralFormData.collateralId,
                    quantity: scope.collateralFormData.quantity,
                    total: scope.collateralFormData.total,
                    totalCollateral: scope.collateralFormData.totalCollateral
                });
            };

            scope.updateValues = function () {
                scope.collateralObject = scope.collateralsData.filter((collateral) => collateral.collateralId == scope.collateralFormData.collateralId)[0];
                scope.collateralFormData.total = scope.collateralFormData.quantity * scope.collateralObject.basePrice;
                scope.collateralFormData.totalCollateral = scope.collateralFormData.total * scope.collateralObject.pctToBase / 100.0;
            }

            scope.deleteCollateral = function (index) {
                scope.collateralId = scope.collaterals[index].collateralId;
                scope.collateralObject = scope.collateralAddedDataArray.filter((collateral) => collateral.collateralId == scope.collateralId)[0];
                scope.collateralsData.push(scope.collateralObject);
                scope.collaterals.splice(index, 1);
            };

            scope.previewRepayments = function () {
                // Make sure charges and collaterals are empty before initializing.
                delete scope.formData.charges;
                delete scope.formData.collateral;
                if (_.isUndefined(scope.formData.datatables) || (!_.isUndefined(scope.formData.datatables) && scope.formData.datatables.length == 0)) {
                    delete scope.formData.datatables;
                }

                var reqFirstDate = dateFilter(scope.date.first, scope.df);
                var reqSecondDate = dateFilter(scope.date.second, scope.df);
                var reqThirdDate = dateFilter(scope.date.third, scope.df);
                var reqFourthDate = dateFilter(scope.date.fourth, scope.df);
                var reqFifthDate = dateFilter(scope.date.fifth, scope.df);
                var reqSixthDate = dateFilter(scope.date.sixth, scope.df);
                if (scope.charges.length > 0) {
                    scope.formData.charges = [];
                    for (var i in scope.charges) {
                        scope.formData.charges.push({
                            chargeId: scope.charges[i].chargeId,
                            amount: scope.charges[i].amount,
                            dueDate: dateFilter(scope.charges[i].dueDate, scope.df)
                        });
                    }
                }

                if (scope.formData.disbursementData.length > 0) {
                    for (var i in scope.formData.disbursementData) {
                        scope.formData.disbursementData[i].expectedDisbursementDate = dateFilter(scope.formData.disbursementData[i].expectedDisbursementDate, scope.df);
                    }
                }

                if (scope.collaterals.length > 0) {
                    scope.formData.collateral = [];
                    for (var i in scope.collaterals) {
                        scope.formData.collateral.push({
                            type: scope.collaterals[i].type,
                            value: scope.collaterals[i].value,
                            description: scope.collaterals[i].description
                        });
                    }
                    ;
                }

                if (this.formData.syncRepaymentsWithMeeting) {
                    this.formData.calendarId = scope.loanaccountinfo.calendarOptions[0].id;
                    scope.syncRepaymentsWithMeeting = this.formData.syncRepaymentsWithMeeting;
                }
                delete this.formData.syncRepaymentsWithMeeting;

                this.formData.interestChargedFromDate = reqThirdDate;
                this.formData.repaymentsStartingFromDate = reqFourthDate;
                if (reqFifthDate){
                    this.formData.dateRequested = reqFifthDate;
                }
                if (reqSixthDate){
                    this.formData.dateOfBirth = reqSixthDate;
                }
                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;
                this.formData.loanType = scope.inparams.templateType;
                this.formData.expectedDisbursementDate = reqSecondDate;
                this.formData.submittedOnDate = reqFirstDate;
                if (this.formData.interestCalculationPeriodType == 0) {
                    this.formData.allowPartialPeriodInterestCalcualtion = false;
                }
                resourceFactory.loanResource.save({command: 'calculateLoanSchedule'}, this.formData, function (data) {
                    scope.repaymentscheduleinfo = data;
                    scope.previewRepayment = true;
                    scope.formData.syncRepaymentsWithMeeting = scope.syncRepaymentsWithMeeting;
                });

            }

            uiConfigService.appendConfigToScope(scope);

            //return input type
            scope.fieldType = function (type) {
                var fieldType = "";
                if (type) {
                    if (type == 'CODELOOKUP' || type == 'CODEVALUE') {
                        fieldType = 'SELECT';
                    } else if (type == 'DATE') {
                        fieldType = 'DATE';
                    } else if (type == 'DATETIME') {
                        fieldType = 'DATETIME';
                    } else if (type == 'BOOLEAN') {
                        fieldType = 'BOOLEAN';
                    } else {
                        fieldType = 'TEXT';
                    }
                }
                return fieldType;
            };

            scope.submit = function () {
                // if (WizardHandler.wizard().getCurrentStep() != scope.noOfTabs) {
                //     WizardHandler.wizard().next();
                //     return;
                // }
                // Make sure charges and collaterals are empty before initializing.
                delete scope.formData.charges;
                delete scope.formData.collateral;
                var reqFirstDate = dateFilter(scope.date.first, scope.df);
                var reqSecondDate = dateFilter(scope.date.second, scope.df);
                var reqThirdDate = dateFilter(scope.date.third, scope.df);
                var reqFourthDate = dateFilter(scope.date.fourth, scope.df);
                var reqFifthDate = dateFilter(scope.date.fifth, scope.df);
                var reqSixthDate = dateFilter(scope.date.sixth, scope.df);

                if (scope.charges.length > 0) {
                    scope.formData.charges = [];
                    for (var i in scope.charges) {
                        scope.formData.charges.push({
                            chargeId: scope.charges[i].chargeId,
                            amount: scope.charges[i].amount,
                            dueDate: dateFilter(scope.charges[i].dueDate, scope.df)
                        });
                    }
                }

                if (scope.formData.disbursementData.length > 0) {
                    for (var i in scope.formData.disbursementData) {
                        scope.formData.disbursementData[i].expectedDisbursementDate = dateFilter(scope.formData.disbursementData[i].expectedDisbursementDate, scope.df);
                    }
                }
                if (scope.collaterals.length > 0) {
                    scope.formData.collateral = [];
                    for (var i in scope.collaterals) {
                        scope.formData.collateral.push({
                            clientCollateralId: scope.collaterals[i].collateralId,
                            quantity: scope.collaterals[i].quantity * 1.0
                        });
                    }
                }

                if(this.formData.loanAdditionalData){
                    this.formData.loanAdditionalData.caseId = this.formData.caseId;
                    for (var propertyName in this.formData.loanAdditionalData) {
                        if (this.formData.loanAdditionalData.hasOwnProperty(propertyName)) {
                            if(scope.isAdditionalDateProperty(propertyName)){
                                var propertyValue =  scope.formData.loanAdditionalData[propertyName];
                                scope.formData.loanAdditionalData[propertyName] = dateFilter(propertyValue, scope.df);
                            }
                        }
                    }
                }

                if (this.formData.syncRepaymentsWithMeeting) {
                    this.formData.calendarId = scope.loanaccountinfo.calendarOptions[0].id;
                }
                if(this.formData.loanAdditionalData){
                    this.formData.loanAdditionalData.caseId = this.formData.caseId;
                }
                delete this.formData.syncRepaymentsWithMeeting;
                this.formData.interestChargedFromDate = reqThirdDate;
                this.formData.repaymentsStartingFromDate = reqFourthDate;
                this.formData.dateRequested = reqFifthDate;
                this.formData.dateOfBirth = reqSixthDate;
                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;
                this.formData.loanType = scope.inparams.templateType;
                this.formData.expectedDisbursementDate = reqSecondDate;
                this.formData.submittedOnDate = reqFirstDate;
                this.formData.createStandingInstructionAtDisbursement = scope.formData.createStandingInstructionAtDisbursement;
                if (scope.date.recalculationRestFrequencyDate) {
                    var restFrequencyDate = dateFilter(scope.date.recalculationRestFrequencyDate, scope.df);
                    scope.formData.recalculationRestFrequencyDate = restFrequencyDate;
                }
                if (scope.date.recalculationCompoundingFrequencyDate) {
                    var restFrequencyDate = dateFilter(scope.date.recalculationCompoundingFrequencyDate, scope.df);
                    scope.formData.recalculationCompoundingFrequencyDate = restFrequencyDate;
                }
                if (this.formData.interestCalculationPeriodType == 0) {
                    this.formData.allowPartialPeriodInterestCalcualtion = false;
                }
                if (!_.isUndefined(scope.datatables) && scope.datatables.length > 0) {
                    angular.forEach(scope.datatables, function (datatable, index) {
                        scope.columnHeaders = datatable.columnHeaderData;
                        angular.forEach(scope.columnHeaders, function (colHeader, i) {
                            scope.dateFormat = scope.df + " " + scope.tf
                            if (scope.columnHeaders[i].columnDisplayType == 'DATE') {
                                if (!_.isUndefined(scope.formDat.datatables[index].data[scope.columnHeaders[i].columnName])) {
                                    scope.formData.datatables[index].data[scope.columnHeaders[i].columnName] = dateFilter(scope.formDat.datatables[index].data[scope.columnHeaders[i].columnName],
                                        scope.dateFormat);
                                    scope.formData.datatables[index].data.dateFormat = scope.dateFormat;
                                }
                            } else if (scope.columnHeaders[i].columnDisplayType == 'DATETIME') {
                                if (!_.isUndefined(scope.formDat.datatables[index].data[scope.columnHeaders[i].columnName].date) && !_.isUndefined(scope.formDat.datatables[index].data[scope.columnHeaders[i].columnName].time)) {
                                    scope.formData.datatables[index].data[scope.columnHeaders[i].columnName] = dateFilter(scope.formDat.datatables[index].data[scope.columnHeaders[i].columnName].date, scope.df)
                                        + " " + dateFilter(scope.formDat.datatables[index].data[scope.columnHeaders[i].columnName].time, scope.tf);
                                    scope.formData.datatables[index].data.dateFormat = scope.dateFormat;
                                }
                            }
                        });
                    });
                } else {
                    delete scope.formData.datatables;
                }
                resourceFactory.loanResource.save(this.formData, function (data) {
                    if(data.loanId){
                        scope.uploadDocuments(data.loanId)
                    }
                });
            };

            scope.uploadDocuments = function (loanId){
                for (let i=0; i<scope.loanDocuments.length; i++){
                    let loanDocument = scope.loanDocuments[i];
                    Upload.upload({
                        url: $rootScope.hostUrl + API_VERSION + '/loans/' + loanId + '/documents',
                        data: { name : loanDocument.name, description : loanDocument.description, documentType : loanDocument.documentType, file: loanDocument.file},
                    }).then(function (data) {
                        if (!scope.$$phase) {
                            scope.$apply();
                        }
                    });
                }
                location.path('/viewloanaccount/' + loanId);
            }

           scope.searchByCaseId = function () {
               var caseId = this.searchText;
               if(scope.clientId && caseId){
                    delete scope.formData.loanAdditionalData;
                    resourceFactory.individualPrequalificationResource.loanAdditionalData({productId: scope.formData.productId, clientId: scope.clientId, caseId: caseId, locale: scope.optlang.code}, function(data){
                        scope.formData.loanAdditionalData = data;
                        scope.formData.caseId = caseId;
                        if(scope.formData.loanAdditionalData){
                            for (var propertyName in scope.formData.loanAdditionalData) {
                                if (scope.formData.loanAdditionalData.hasOwnProperty(propertyName)) {
                                    if(scope.isAdditionalDateProperty(propertyName)){
                                        var propertyValue =  scope.formData.loanAdditionalData[propertyName];
                                        scope.formData.loanAdditionalData[propertyName] = new Date(propertyValue);
                                        if (propertyName === 'dateOpened') {
                                            scope.formData.loanAdditionalData[propertyName] = new Date(propertyValue.slice(0,3));
                                        }
                                    }
                                }
                            }
                        }
                    });
                }
           }

           scope.isAdditionalDateProperty = function(propertyName){
               var dateFields = ["fechaInicio", "cFechaNacimiento", "fechaPrimeraReunion", "dateOpened", "fechaSolicitud", "fecha_solicitud", "fechaFin", "fecha_estacionalidad", "fecha_inico_operaciones", "fecha_integraciones", "fecha_inventario", "fecha_nacimiento_solicitante", "fecha_nacimiento_solicitante", "fecha_visita","fecha_inicio_negocio"];
                return dateFields.includes(propertyName);
           }
           scope.isDecimalProperty = function(propertyName){
               var decimalFields = ["activoCorriente","activoNocorriente","alimentacion","alquilerCliente","alquilerGasto",
                   "alquilerLocal","bienesInmuebles","bienesInmueblesFamiliares","capacidadPago","comunalVigente",
                   "costoUnitario","costoVenta","cuantoPagar","cuentasPorPagar","cuota","cuotaOtros","cuotaPuente",
                   "cuotasPendientesBc","educacion","efectivo","endeudamientoActual","endeudamientoFuturo","flujoDisponible",
                   "gastosFamiliares","gastosNegocio","herramientas","impuestos","ingresoFamiliar","inventarios","inversionTotal",
                   "menajeDelHogar","mobiliarioYequipo","montoSolicitado","pasivoCorriente","pasivoNoCorriente","pensiones",
                   "prestamoPuente","propuestaFacilitador","relacionGastos","rentabilidadNeta","rotacionInventario","salarioCliente",
                   "salarios","serviciosBasicos","serviciosGasto","serviciosMedicos","tarjetas","totalActivo","totalIngresos",
                   "totalIngresosFamiliares","totalPasivo","transporteGasto","transporteNegocio","utilidadBruta","utilidadNeta",
                   "valorGarantia","vehiculos","vestimenta","ventas","cuentasPorCobrar","hipotecas","montoAutorizado",
                   "capitalDdeTrabajo","montoOtrosIngresos","relacionOtrosIngresos","detalle_compras","detalle_otros_ingresos",
                   "detalle_recuperacion_cuentas","detalle_ventas","efectivo_uso_familia","efectivo_uso_negocio","otros_activos_familia",
                   "otros_activos_negocio","tasa","total_costo_ventas","total_cuentas_por_cobrar","total_cuota_mensual","total_deuda",
                   "total_efectivo","total_gastos_negocio","total_gastos_vivienda","total_inmueble_familia","total_inmueble_negocio",
                   "total_inmuebles","total_inventario","total_maquinaria","total_menaje_de_hogar","total_mobiliario_equipo","total_otros_activos",
                   "total_precio_ventas","total_recibido","total_vehiculos"
               ];
                return decimalFields.includes(propertyName);
           }

            scope.cancel = function () {
                if (scope.groupId) {
                    location.path('/viewgroup/' + scope.groupId);
                } else if (scope.clientId) {
                    location.path('/viewclient/' + scope.clientId);
                }
            }

            scope.countIndex = function (index) {
                return Number(index)+1;
            }

            scope.removeLoan = function (index) {
                scope.currentLoans.splice(Number(index), 1)
                scope.calculateTotals()
            }

            scope.$watch('formData.monthlyIncome', function(){
                scope.calculateTotalIncome();
            });

            scope.$watch('formData.otherIncome', function(){
                scope.calculateTotalIncome();
            });
            scope.$watch('formData.businessProfit', function(){
                scope.calculateTotalIncome();
            });
            scope.$watch('formData.clientProfit', function(){
                scope.calculateTotalIncome();
            });

            scope.calculateTotalIncome = function () {
                scope.formData.totalIncome=0;
                let monthlyIncome = Number(scope.formData.monthlyIncome?scope.formData.monthlyIncome:0);
                let otherIncome = Number(scope.formData.otherIncome?scope.formData.otherIncome:0);
                let businessProfit = Number(scope.formData.businessProfit?scope.formData.businessProfit:0);
                let clientProfit = Number(scope.formData.clientProfit?scope.formData.clientProfit:0);
                scope.formData.totalIncome=(monthlyIncome + otherIncome + (businessProfit< clientProfit?businessProfit:clientProfit));

                return scope.formData.totalIncome;
            }

            scope.$watch('formData.rentFee', function(){
                scope.calculateTotalExpenditure();
            });
            scope.$watch('formData.mortgageFee', function(){
                scope.calculateTotalExpenditure();
            });

            scope.$watch('formData.familyExpenses', function(){
                scope.calculateTotalExpenditure();
            });

            scope.$watch('formData.totalInstallments', function(){
                scope.calculateTotalExpenditure();
            });

            scope.calculateTotalExpenditure = function () {
                scope.formData.totalExpenditures=0;
                let rentFee = Number(scope.formData.rentFee?scope.formData.rentFee:0);
                let mortgageFee = Number(scope.formData.mortgageFee?scope.formData.mortgageFee:0);
                let familyExpenses = Number(scope.formData.familyExpenses?scope.formData.familyExpenses:0);
                let totalInstallments = Number(scope.formData.totalInstallments?scope.formData.totalInstallments:0);
                scope.formData.totalExpenditures=(rentFee + mortgageFee + familyExpenses + totalInstallments);

                return scope.formData.totalExpenditures;
            }

            scope.$watch('formData.totalIncome', function(){
                scope.calculateAvailableMonthly();
            });

            scope.$watch('formData.totalExpenditures', function(){
                scope.calculateAvailableMonthly();
            });

            scope.calculateAvailableMonthly = function () {
                scope.formData.availableMonthly=0;
                let totalIncome = Number(scope.formData.totalIncome?scope.formData.totalIncome:0);
                let totalExpenditures = Number(scope.formData.totalExpenditures?scope.formData.totalExpenditures:0);
                scope.formData.availableMonthly=(totalIncome-totalExpenditures);

                return scope.formData.availableMonthly;
            }

            scope.$watch('formData.monthlyPaymentCapacity', function(){
                scope.calculatePaymentCapacity();
            });
            scope.$watch('formData.availableMonthly', function(){
                scope.calculatePaymentCapacity();
            });

            scope.$watch('formData.proposedFee', function(){
                scope.calculatePaymentCapacity();
            });

            scope.calculatePaymentCapacity = function () {
                scope.formData.paymentCapacity=0;
                let monthlyPaymentCapacity = Number(scope.formData.monthlyPaymentCapacity?scope.formData.monthlyPaymentCapacity:0);
                let availableMonthly = Number(scope.formData.availableMonthly?scope.formData.availableMonthly:0);
                let proposedFee = Number(scope.formData.proposedFee?scope.formData.proposedFee:0);
                let minimumCapacity = monthlyPaymentCapacity < availableMonthly ? monthlyPaymentCapacity : availableMonthly;
                scope.formData.paymentCapacity=(proposedFee/ minimumCapacity).toFixed(1);

                return scope.formData.paymentCapacity;
            }

            scope.$watch('formData.facilitatorProposedValue', function(){
                scope.calculateFacValue();
            });

            scope.$watch('formData.inventories', function(){
                scope.calculateFacValue();
            });

            scope.calculateFacValue = function () {
                scope.formData.facValue=0;
                let facilitatorProposedValue = Number(scope.formData.facilitatorProposedValue?scope.formData.facilitatorProposedValue:0);
                let inventories = Number(scope.formData.inventories?scope.formData.inventories:0);
                scope.formData.facValue=(facilitatorProposedValue/ inventories).toFixed(1);

                return scope.formData.facValue;
            }

            scope.$watch('formData.totalInstallments', function(){
                scope.calculateDebtLevel();
            });

            scope.$watch('formData.availableMonthly', function(){
                scope.calculateDebtLevel();
            });

            scope.calculateDebtLevel = function () {
                scope.formData.debtLevel=0;
                let totalInstallments = Number(scope.formData.totalInstallments?scope.formData.totalInstallments:0);
                let availableMonthly = Number(scope.formData.availableMonthly?scope.formData.availableMonthly:0);
                scope.formData.debtLevel=(totalInstallments/ availableMonthly).toFixed(1);

                return scope.formData.debtLevel;
            }

            scope.$watch('formData.salesValue', function(){
                scope.calculateBusinessProfit(scope.formData.salesValue, scope.formData.businessPurchases)
            });

            scope.$watch('formData.businessPurchases', function(){
                scope.calculateBusinessProfit(scope.formData.salesValue, scope.formData.businessPurchases)
            });

            scope.calculateBusinessProfit = function (sales, purchases) {
                scope.formData.businessProfit=0;
                scope.formData.businessProfit=Number(sales?sales:0) - Number(purchases?purchases:0);
                return scope.formData.businessProfit;
            }
        }
    });
    mifosX.ng.application.controller('NewLoanAccAppController', ['$scope', '$routeParams', 'ResourceFactory', '$location','$uibModal', 'dateFilter', 'UIConfigService', 'WizardHandler', '$translate',  'API_VERSION',  'Upload',  '$rootScope', mifosX.controllers.NewLoanAccAppController]).run(function ($log) {
        $log.info("NewLoanAccAppController initialized");
    });
}(mifosX.controllers || {}));
