(function (module) {
    mifosX.controllers = _.extend(module, {
        EditLoanAccAppController: function (scope, routeParams, resourceFactory, location, dateFilter, uiConfigService) {

            scope.previewRepayment = false;
            scope.formData = {};
            scope.chargeFormData = {}; //For charges
            scope.collateralFormData = {}; //For collaterals
            scope.collaterals = [];
            scope.restrictDate = new Date();
            scope.date = {};
            scope.rateFlag = false;
            scope.showAdditionalInfo = false;
            scope.currentLoans = [];
            scope.currentLoanData = {}

            resourceFactory.loanResource.get({
                loanId: routeParams.id,
                template: true,
                associations: 'charges,collateral,meeting,multiDisburseDetails,additionalDetails',
                staffInSelectedOfficeOnly: true
            }, function (data) {
                scope.loanaccountinfo = data;
                if (data.groupLoanAdditionalData) {
                    scope.formData.dateRequested=new Date(data.timeline.submittedOnDate) || new Date();
                    scope.formData.dateOfBirth=data.groupLoanAdditionalData.dateOfBirth? new Date(data.groupLoanAdditionalData.dateOfBirth) : new Date();
                    scope.formData.loanCycleCompleted=data.groupLoanAdditionalData.loanCycleCompleted;
                    scope.formData.earlyCancellationReason=data.groupLoanAdditionalData.earlyCancellationReason;
                    scope.formData.sourceOfFunds=data.groupLoanAdditionalData.sourceOfFunds;
                    scope.formData.clientLoanRequestNumber=data.contractNo;
                    scope.formData.position=data.groupLoanAdditionalData.position;
                    scope.formData.facilitator=data.groupLoanAdditionalData.facilitatorId;
                    scope.formData.fullName=data.groupLoanAdditionalData.fullName;
                    scope.formData.maidenName=data.groupLoanAdditionalData.maidenName;
                    scope.formData.maritalStatus=data.groupLoanAdditionalData.maritalStatus;
                    scope.formData.educationLevel=data.groupLoanAdditionalData.educationLevel;
                    scope.formData.schoolingYears=data.groupLoanAdditionalData.schoolingYears;
                    scope.formData.nationality=data.groupLoanAdditionalData.nationality;
                    scope.formData.language=data.groupLoanAdditionalData.language;
                    scope.formData.noOfChildren=data.groupLoanAdditionalData.noOfChildren;
                    scope.formData.dpi=data.groupLoanAdditionalData.dpi;
                    scope.formData.nit=data.groupLoanAdditionalData.nit;
                    scope.formData.jobType=data.groupLoanAdditionalData.jobType;
                    scope.formData.occupancyClassification=data.groupLoanAdditionalData.occupancyClassification;
                    let onBehalfOf = data.groupLoanAdditionalData.onBehalfOf;
                    scope.formData.onBehalfOf= onBehalfOf;
                    scope.formData.actsOwnBehalf=onBehalfOf.length>0?'NO':'YES';
                    let politicalPosition = data.groupLoanAdditionalData.politicalPosition;
                    scope.formData.politicalPosition=politicalPosition;
                    scope.formData.politicallyExposed=politicalPosition.length>0?'YES':'NO';
                    scope.formData.politicalOffice=data.groupLoanAdditionalData.politicalOffice;
                    scope.formData.housingType=data.groupLoanAdditionalData.housingType;
                    scope.formData.rentFee=data.groupLoanAdditionalData.rentFee;
                    scope.formData.mortgageFee=data.groupLoanAdditionalData.mortgageFee;
                    scope.formData.address=data.groupLoanAdditionalData.address;
                    scope.formData.populatedPlace=data.groupLoanAdditionalData.populatedPlace;
                    scope.formData.referencePoint=data.groupLoanAdditionalData.referencePoint;
                    scope.formData.phoneNumber=data.groupLoanAdditionalData.phoneNumber;
                    scope.formData.relativeNumber=data.groupLoanAdditionalData.relativeNumber;
                    scope.formData.yearsInCommunity=data.groupLoanAdditionalData.yearsInCommunity;
                    scope.formData.monthlyIncome=data.groupLoanAdditionalData.monthlyIncome;
                    scope.formData.otherIncome=data.groupLoanAdditionalData.otherIncome;
                    scope.formData.familyExpenses=data.groupLoanAdditionalData.familyExpenses;
                    scope.formData.currentLoans=data.groupLoanAdditionalData.currentLoans;
                    scope.formData.totalExternalLoanAmount=data.groupLoanAdditionalData.totalExternalLoanAmount;
                    scope.formData.totalInstallments=data.groupLoanAdditionalData.totalInstallments;
                    scope.formData.clientType=data.groupLoanAdditionalData.clientType;
                    scope.formData.houseHoldGoods=data.groupLoanAdditionalData.houseHoldGoods;
                    scope.formData.businessActivities=data.groupLoanAdditionalData.businessActivities;
                    scope.formData.businessLocation=data.groupLoanAdditionalData.businessLocation;
                    scope.formData.businessExperience=data.groupLoanAdditionalData.businessExperience;
                    scope.formData.salesValue=data.groupLoanAdditionalData.salesValue;
                    scope.formData.businessPurchases=data.groupLoanAdditionalData.businessPurchases;
                    scope.formData.clientProfit=data.groupLoanAdditionalData.clientProfit;
                    scope.formData.inventories=data.groupLoanAdditionalData.inventories;
                    scope.formData.visitBusiness=data.groupLoanAdditionalData.visitBusiness;
                    scope.formData.familySupport=data.groupLoanAdditionalData.familySupport;
                    scope.formData.businessEvolution=data.groupLoanAdditionalData.businessEvolution;
                    scope.formData.numberOfApprovals=data.groupLoanAdditionalData.numberOfApprovals;
                    scope.formData.recommenderName=data.groupLoanAdditionalData.recommenderName;
                    scope.formData.monthlyPaymentCapacity=data.groupLoanAdditionalData.monthlyPaymentCapacity;
                    scope.formData.loanPurpose=data.groupLoanAdditionalData.loanPurpose;
                    scope.formData.currentCreditValue=data.groupLoanAdditionalData.currentCreditValue;
                    scope.formData.requestedValue=data.groupLoanAdditionalData.requestedValue;
                    scope.formData.groupAuthorizedValue=data.groupLoanAdditionalData.groupAuthorizedValue;
                    scope.formData.facilitatorProposedValue=data.groupLoanAdditionalData.facilitatorProposedValue;
                    scope.formData.proposedFee=data.groupLoanAdditionalData.proposedFee;
                    scope.formData.agencyAuthorizedAmount=data.groupLoanAdditionalData.agencyAuthorizedAmount;
                    scope.formData.authorizedFee=data.groupLoanAdditionalData.authorizedFee;
                    scope.formData.paymentCapacity=data.groupLoanAdditionalData.paymentCapacity;
                    if (data.groupLoanAdditionalData.extraLoansData && data.groupLoanAdditionalData.extraLoansData.length > 0) {
                        scope.populateExtraLoans(data.groupLoanAdditionalData.extraLoansData)
                        scope.formData.currentLoans = 'YES';
                    } else {
                        scope.formData.currentLoans = 'NO';
                    }
                }
                if (scope.loanaccountinfo.loanAdditionalData) {
                    scope.formData.loanAdditionalData = scope.loanaccountinfo.loanAdditionalData;
                    if (scope.formData.loanAdditionalData) {
                        for (var propertyName in scope.formData.loanAdditionalData) {
                            if (scope.formData.loanAdditionalData.hasOwnProperty(propertyName)) {
                                if (scope.isAdditionalDateProperty(propertyName)) {
                                    var propertyValue = scope.formData.loanAdditionalData[propertyName];
                                    scope.formData.loanAdditionalData[propertyName] = new Date(propertyValue);
                                    if (propertyName === 'dateOpened') {
                                        scope.formData.loanAdditionalData[propertyName] = new Date(propertyValue.slice(0,3));
                                    }
                                }
                            }
                        }
                    }
                    scope.formData.caseId = scope.formData.loanAdditionalData.caseId;
                }

                if (data.linkedCupo) {
                    scope.formData.cupoId = data.linkedCupo.id;
                }

                resourceFactory.loanResource.get({
                    resourceType: 'template',
                    templateType: 'collateral',
                    productId: data.loanProductId,
                    fields: 'id,loanCollateralOptions'
                }, function (data) {
                    scope.collateralOptions = data.loanCollateralOptions || [];
                });

                if (scope.prequalificationType == 'GROUP') {
                    scope.groupId = data.group.id;
                    scope.groupName = data.group.name;
                    scope.formData.groupId = scope.groupId;
                    if (scope.groupId) {
                        resourceFactory.groupResource.get({
                            groupId: scope.groupId,
                            associations: 'all'
                        }, function (data) {
                            scope.prequalificationOptions = data.prequalificationGroups;
                        });
                    }
                }

                if (data.clientId) {
                    scope.clientId = data.clientId;
                    scope.clientName = data.clientName;
                    scope.formData.clientId = scope.clientId;
                    resourceFactory.clientResource.get({clientId: scope.clientId}, function (clientData) {
                        scope.clientData = clientData;
                        scope.formData.dpi = clientData.dpiNumber;
                        scope.prequalificationOptions = clientData.clientPrequalifications;
                        if (scope.loanaccountinfo.prequalificationData && scope.loanaccountinfo.prequalificationData.id) {
                            scope.formData.prequalificationId = scope.loanaccountinfo.prequalificationData.id;
                            resourceFactory.prequalificationResource.get({groupId: scope.formData.prequalificationId}, function (prequalificationData) {
                                if (prequalificationData.prequalificationType) {
                                    scope.prequalificationType = prequalificationData.prequalificationType.value;
                                }
                            });

                            var matchingExists = false
                            for (var i = 0; i < scope.prequalificationOptions.length; i++) {
                                if (scope.prequalificationOptions[i].id == scope.formData.prequalificationId) {
                                    matchingExists = true;
                                }
                            }
                            if (!matchingExists) {
                                scope.prequalificationOptions.push(scope.loanaccountinfo.prequalificationData);
                            }
                        }
                    });
                }

                if (scope.clientId && scope.groupId) {
                    scope.templateType = 'jlg';
                } else if (scope.groupId) {
                    scope.templateType = 'group';
                } else if (scope.clientId) {
                    scope.templateType = 'individual';
                }

                scope.formData.loanOfficerId = data.loanOfficerId;
                scope.formData.loanPurposeId = data.loanPurposeId;
                scope.formData.externalId = data.externalId;

                //update collaterals
                resourceFactory.clientcollateralTemplateResource.getAllCollaterals({clientId: scope.clientId}, function (data) {
                    scope.collateralsData = data;
                    if (scope.loanaccountinfo.collateral) {
                        for (var i in scope.loanaccountinfo.collateral) {
                            scope.collateralsData = scope.collateralsData.filter((x) => x.collateralId !== scope.loanaccountinfo.collateral[i].clientCollateralId);
                        }
                    }
                });


                scope.previewClientLoanAccInfo();
                scope.ratesEnabled = scope.loanaccountinfo.isRatesEnabled;

            });

            scope.countIndex = function (index) {
                return Number(index)+1;
            }

            scope.populateExtraLoans = function (extraLoansData) {
                for (let i=0; i<extraLoansData.length; i++) {
                    scope.currentLoans.push({
                        institutionName:extraLoansData[i].institutionName,
                        institutionType:extraLoansData[i].institutionType,
                        totalLoanBalance:extraLoansData[i].balance,
                        charges:extraLoansData[i].fees,
                        totalLoanAmount:extraLoansData[i].loanAmount,
                        loanStatus:extraLoansData[i].loanStatus
                    });
                }
                scope.formData.externalLoans = scope.currentLoans;
                scope.calculateTotals();
            }

            scope.prequalificationChange = function (prequalificationId) {
                resourceFactory.prequalificationResource.get({groupId: prequalificationId}, function (data) {
                    var loanProductId = data.productId;
                    if (data.prequalificationType) {
                        scope.prequalificationType = data.prequalificationType.value;
                    }
                    if (scope.clientId) {
                        var groupMembers = data.groupMembers;
                        if (groupMembers && groupMembers.length > 0) {
                            for (var i = 0; i < groupMembers.length; i++) {
                                if (groupMembers[i].dpi == scope.clientData.dpiNumber) {
                                    scope.totalApprovedAmount = groupMembers[i].approvedAmount ? groupMembers[i].approvedAmount : groupMembers[i].requestedAmount;
                                }
                            }
                        }
                    } else {
                        scope.totalApprovedAmount = data.totalApprovedAmount ? data.totalApprovedAmount : data.totalApprovedAmount;
                    }
                    scope.loanProductChange(loanProductId);
                });
            }

            scope.loanProductChange = function (loanProductId) {

                var inparams = {resourceType: 'template', productId: loanProductId, templateType: scope.templateType};
                if (scope.clientId) {
                    inparams.clientId = scope.clientId;
                }
                if (scope.groupId) {
                    inparams.groupId = scope.groupId;
                }

                inparams.staffInSelectedOfficeOnly = true;

                resourceFactory.loanResource.get({
                    resourceType: 'template',
                    templateType: 'collateral',
                    productId: loanProductId,
                    fields: 'id,loanCollateralOptions'
                }, function (data) {
                    scope.collateralOptions = data.loanCollateralOptions || [];
                });
            }

            scope.collateralAddedDataArray = [];

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
                scope.classificationOptions = data.classificationOptions || [];
                scope.jobTypeOptions = data.jobTypeOptions || [];
                scope.educationLevelOptions = data.educationLevelOptions || [];
                scope.maritalStatusOptions = data.maritalStatusOptions || [];
                scope.groupPositionOptions = data.groupPositionOptions || [];
                scope.sourceOfFundsOptions = data.sourceOfFundsOptions || [];
                scope.cancellationReasonOptions = data.cancellationReasonOptions || [];
                scope.facilitatorOptions = data.facilitatorOptions || [];
                scope.documentTypeOptions = data.documentTypeOptions || [];
                scope.economicSectorOptions = data.economicSectorOptions || [];
            });

            scope.previewClientLoanAccInfo = function () {
                scope.previewRepayment = false;
                for (var i in scope.loanaccountinfo.charges) {
                    if (scope.loanaccountinfo.charges[i].dueDate) {
                        if (scope.loanaccountinfo.charges[i].chargeTimeType.value == "Disbursement" ||
                            scope.loanaccountinfo.charges[i].chargeTimeType.value == "Tranche Disbursement") {
                            scope.loanaccountinfo.charges[i].dueDate = null;
                        } else {
                            scope.loanaccountinfo.charges[i].dueDate = new Date(scope.loanaccountinfo.charges[i].dueDate);
                        }

                    }
                }


                scope.charges = scope.loanaccountinfo.charges || [];
                scope.formData.disbursementData = scope.loanaccountinfo.disbursementDetails || [];
                if (scope.formData.disbursementData.length > 0) {
                    for (var i in scope.formData.disbursementData) {
                        scope.formData.disbursementData[i].expectedDisbursementDate = new Date(scope.formData.disbursementData[i].expectedDisbursementDate);
                    }
                }

                if (scope.loanaccountinfo.timeline.submittedOnDate) {
                    scope.formData.submittedOnDate = new Date(scope.loanaccountinfo.timeline.submittedOnDate);
                }
                if (scope.loanaccountinfo.timeline.expectedDisbursementDate) {
                    scope.formData.expectedDisbursementDate = new Date(scope.loanaccountinfo.timeline.expectedDisbursementDate);
                }
                if (scope.loanaccountinfo.interestChargedFromDate) {
                    scope.formData.interestChargedFromDate = new Date(scope.loanaccountinfo.interestChargedFromDate);
                }
                if (scope.loanaccountinfo.expectedFirstRepaymentOnDate) {
                    scope.formData.repaymentsStartingFromDate = new Date(scope.loanaccountinfo.expectedFirstRepaymentOnDate);
                }
                scope.multiDisburseLoan = scope.loanaccountinfo.multiDisburseLoan;
                scope.formData.productId = scope.loanaccountinfo.loanProductId;
                scope.formData.fundId = scope.loanaccountinfo.fundId;
                scope.formData.principal = scope.totalApprovedAmount ? scope.totalApprovedAmount : scope.loanaccountinfo.principal;
                scope.formData.loanTermFrequency = scope.loanaccountinfo.termFrequency;
                scope.formData.loanTermFrequencyType = scope.loanaccountinfo.termPeriodFrequencyType.id;
                scope.formData.numberOfRepayments = scope.loanaccountinfo.numberOfRepayments;
                scope.formData.repaymentEvery = scope.loanaccountinfo.repaymentEvery;
                scope.formData.repaymentFrequencyType = scope.loanaccountinfo.repaymentFrequencyType.id;
                if (scope.loanaccountinfo.repaymentFrequencyNthDayType != null) {
                    scope.formData.repaymentFrequencyNthDayType = scope.loanaccountinfo.repaymentFrequencyNthDayType.id;
                }
                if (scope.loanaccountinfo.repaymentFrequencyDayOfWeekType != null) {
                    scope.formData.repaymentFrequencyDayOfWeekType = scope.loanaccountinfo.repaymentFrequencyDayOfWeekType.id
                }
                scope.formData.interestRatePerPeriod = scope.loanaccountinfo.interestRatePerPeriod;
                scope.formData.interestRateFrequencyType = scope.loanaccountinfo.interestRateFrequencyType.id;
                scope.formData.amortizationType = scope.loanaccountinfo.amortizationType.id;
                scope.formData.fixedPrincipalPercentagePerInstallment = scope.loanaccountinfo.fixedPrincipalPercentagePerInstallment;
                scope.formData.interestType = scope.loanaccountinfo.interestType.id;
                scope.formData.isEqualAmortization = scope.loanaccountinfo.isEqualAmortization;
                scope.formData.interestCalculationPeriodType = scope.loanaccountinfo.interestCalculationPeriodType.id;
                scope.formData.allowPartialPeriodInterestCalcualtion = scope.loanaccountinfo.allowPartialPeriodInterestCalcualtion;
                scope.formData.inArrearsTolerance = scope.loanaccountinfo.inArrearsTolerance;
                scope.formData.graceOnPrincipalPayment = scope.loanaccountinfo.graceOnPrincipalPayment;
                scope.formData.graceOnInterestPayment = scope.loanaccountinfo.graceOnInterestPayment;
                scope.formData.graceOnArrearsAgeing = scope.loanaccountinfo.graceOnArrearsAgeing;
                scope.formData.transactionProcessingStrategyId = scope.loanaccountinfo.transactionProcessingStrategyId;
                scope.formData.graceOnInterestCharged = scope.loanaccountinfo.graceOnInterestCharged;
                scope.formData.syncDisbursementWithMeeting = scope.loanaccountinfo.syncDisbursementWithMeeting;
                scope.formData.fixedEmiAmount = scope.loanaccountinfo.fixedEmiAmount;
                scope.formData.maxOutstandingLoanBalance = scope.loanaccountinfo.maxOutstandingLoanBalance;
                scope.formData.createStandingInstructionAtDisbursement = scope.loanaccountinfo.createStandingInstructionAtDisbursement;
                scope.formData.isTopup = scope.loanaccountinfo.isTopup;
                scope.formData.loanIdToClose = scope.loanaccountinfo.closureLoanId;

                if (scope.loanaccountinfo.meeting) {
                    scope.formData.syncRepaymentsWithMeeting = true;
                }

                if (scope.loanaccountinfo.linkedAccount) {
                    scope.formData.linkAccountId = scope.loanaccountinfo.linkedAccount.id;
                }
                if (scope.loanaccountinfo.isInterestRecalculationEnabled && scope.loanaccountinfo.interestRecalculationData.recalculationRestFrequencyDate) {
                    scope.date.recalculationRestFrequencyDate = new Date(scope.loanaccountinfo.interestRecalculationData.recalculationRestFrequencyDate);
                }
                if (scope.loanaccountinfo.isInterestRecalculationEnabled && scope.loanaccountinfo.interestRecalculationData.recalculationCompoundingFrequencyDate) {
                    scope.date.recalculationCompoundingFrequencyDate = new Date(scope.loanaccountinfo.interestRecalculationData.recalculationCompoundingFrequencyDate);
                }
                scope.formData.interestRateDifferential = scope.loanaccountinfo.interestRateDifferential;
                scope.formData.isFloatingInterestRate = scope.loanaccountinfo.isFloatingInterestRate;
                //Load Rates information
                scope.formData.rates = scope.loanaccountinfo.rates;
                scope.firstChange = false;
                scope.rateOptions = scope.loanaccountinfo.product.rates.filter(function (rate) {
                    var exist = false;
                    scope.formData.rates.forEach(function (addedRate) {
                        if (rate.id === addedRate.id) {
                            exist = true;
                        }
                    });
                    return !exist;
                });
                if (scope.formData.rates && scope.formData.rates.length > 0) {
                    scope.rateFlag = true;
                } else {
                    scope.rateFlag = false;
                }

                if (scope.clientId && scope.formData.caseId) {
                    scope.searchText = scope.formData.caseId;
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
                return exist;
            };

            scope.calculateRates = function () {
                var total = 0;
                scope.formData.rates.forEach(function (rate) {
                    total += rate.percentage;
                });
                if (total === 0) {
                    scope.rateFlag = false;
                    total = undefined;
                }
                scope.formData.interestRatePerPeriod = total;


            };

            scope.deleteRate = function (index) {
                scope.rateOptions.push(scope.formData.rates[index]);
                scope.formData.rates.splice(index, 1);
                scope.calculateRates();
            };

            scope.addCharge = function () {
                if (scope.chargeFormData.chargeId) {
                    resourceFactory.chargeResource.get({
                        chargeId: this.chargeFormData.chargeId,
                        template: 'true'
                    }, function (data) {
                        data.chargeId = data.id;
                        data.id = null;
                        data.amountOrPercentage = data.amount;
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

            scope.previewRepayments = function () {
                // Make sure charges and collaterals are empty before initializing.
                delete scope.formData.charges;
                delete scope.formData.collateral;

                if (scope.charges.length > 0) {
                    scope.formData.charges = [];
                    for (var i in scope.charges) {
                        scope.formData.charges.push({
                            chargeId: scope.charges[i].chargeId,
                            amount: scope.charges[i].amountOrPercentage,
                            dueDate: dateFilter(scope.charges[i].dueDate, scope.df)
                        });
                    }
                }

                if (scope.formData.disbursementData.length > 0) {
                    for (var i in scope.formData.disbursementData) {
                        scope.formData.disbursementData[i].expectedDisbursementDate = dateFilter(scope.formData.disbursementData[i].expectedDisbursementDate, scope.df);
                    }
                }

                if (this.formData.syncRepaymentsWithMeeting) {
                    if (scope.loanaccountinfo.calendarOptions) {
                        this.formData.calendarId = scope.loanaccountinfo.calendarOptions[0].id;
                    }
                    scope.syncRepaymentsWithMeeting = this.formData.syncRepaymentsWithMeeting;
                }
                delete this.formData.syncRepaymentsWithMeeting;
                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;
                this.formData.loanType = scope.templateType;
                this.formData.expectedDisbursementDate = dateFilter(this.formData.expectedDisbursementDate, scope.df);
                this.formData.submittedOnDate = dateFilter(this.formData.submittedOnDate, scope.df);
                this.formData.interestChargedFromDate = dateFilter(this.formData.interestChargedFromDate, scope.df);
                this.formData.repaymentsStartingFromDate = dateFilter(this.formData.repaymentsStartingFromDate, scope.df);
                if (!scope.loanaccountinfo.isLoanProductLinkedToFloatingRate) {
                    delete this.formData.interestRateDifferential;
                    delete this.formData.isFloatingInterestRate;
                }
                resourceFactory.loanResource.save({command: 'calculateLoanSchedule'}, this.formData, function (data) {
                    scope.repaymentscheduleinfo = data;
                    scope.previewRepayment = true;
                    scope.formData.syncRepaymentsWithMeeting = scope.syncRepaymentsWithMeeting;
                });

            }


            uiConfigService.appendConfigToScope(scope);


            scope.submit = function () {
                // Make sure charges and collaterals are empty before initializing.
                delete scope.formData.charges;
                delete scope.formData.collateral;

                if (scope.formData.disbursementData.length > 0) {
                    for (var i in scope.formData.disbursementData) {
                        scope.formData.disbursementData[i].expectedDisbursementDate = dateFilter(scope.formData.disbursementData[i].expectedDisbursementDate, scope.df);
                    }
                }

                scope.formData.charges = [];
                if (scope.charges.length > 0) {
                    for (var i in scope.charges) {
                        scope.formData.charges.push({
                            id: scope.charges[i].id,
                            chargeId: scope.charges[i].chargeId,
                            amount: scope.charges[i].amountOrPercentage,
                            dueDate: dateFilter(scope.charges[i].dueDate, scope.df)
                        });
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
                    if (scope.loanaccountinfo.collateral) {
                        for (var i in scope.loanaccountinfo.collateral) {
                            scope.collateralsData = scope.collateralsData.filter((x) => x.collateralId !== scope.loanaccountinfo.collateral[i].clientCollateralId);
                            scope.formData.collateral.push({
                                clientCollateralId: scope.loanaccountinfo.collateral[i].clientCollateralId,
                                id: scope.loanaccountinfo.collateral[i].id,
                                quantity: scope.loanaccountinfo.collateral[i].quantity
                            });
                        }
                    }
                }

                if (this.formData.syncRepaymentsWithMeeting) {
                    if (scope.loanaccountinfo.calendarOptions) {
                        this.formData.calendarId = scope.loanaccountinfo.calendarOptions[0].id;
                    }
                }
                delete this.formData.syncRepaymentsWithMeeting;
                delete this.formData.interestRateFrequencyType;
                if (!scope.loanaccountinfo.isLoanProductLinkedToFloatingRate) {
                    delete this.formData.interestRateDifferential;
                    delete this.formData.isFloatingInterestRate;
                }
                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;
                this.formData.loanType = scope.templateType;
                this.formData.expectedDisbursementDate = dateFilter(this.formData.expectedDisbursementDate, scope.df);
                this.formData.submittedOnDate = dateFilter(this.formData.submittedOnDate, scope.df);
                this.formData.dateRequested = dateFilter(this.formData.dateRequested, scope.df);
                this.formData.dateOfBirth = dateFilter(this.formData.dateOfBirth, scope.df);
                this.formData.interestChargedFromDate = dateFilter(this.formData.interestChargedFromDate, scope.df);
                this.formData.repaymentsStartingFromDate = dateFilter(this.formData.repaymentsStartingFromDate, scope.df);
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

                if (this.formData.loanAdditionalData) {
                    this.formData.loanAdditionalData.caseId = this.formData.caseId;
                    for (var propertyName in this.formData.loanAdditionalData) {
                        if (this.formData.loanAdditionalData.hasOwnProperty(propertyName)) {
                            if (scope.isAdditionalDateProperty(propertyName)) {
                                var propertyValue = scope.formData.loanAdditionalData[propertyName];
                                scope.formData.loanAdditionalData[propertyName] = dateFilter(propertyValue, scope.df);
                            }
                        }
                    }
                }
                resourceFactory.loanResource.put({loanId: routeParams.id}, this.formData, function (data) {
                    location.path('/viewloanaccount/' + data.loanId);
                });
            };

            scope.isAdditionalDateProperty = function (propertyName) {
                var dateFields = ["fechaInicio", "fecha_inicio_negocio", "cFechaNacimiento", "fechaPrimeraReunion", "dateOpened", "fechaSolicitud", "fecha_solicitud", "fechaFin", "fecha_estacionalidad", "fecha_inico_operaciones", "fecha_integraciones", "fecha_inventario", "fecha_visita"];
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



            scope.searchByCaseId = function () {
                var caseId = this.searchText;
                if (scope.clientId && caseId) {
                    delete scope.formData.loanAdditionalData;
                    resourceFactory.individualPrequalificationResource.loanAdditionalData({
                        productId: scope.formData.productId,
                        clientId: scope.clientId,
                        caseId: caseId,
                        locale: scope.optlang.code
                    }, function (data) {
                        scope.formData.loanAdditionalData = data;
                        scope.formData.caseId = caseId;
                        if (scope.formData.loanAdditionalData) {
                            for (var propertyName in scope.formData.loanAdditionalData) {
                                if (scope.formData.loanAdditionalData.hasOwnProperty(propertyName)) {
                                    if (scope.isAdditionalDateProperty(propertyName)) {
                                        var propertyValue = scope.formData.loanAdditionalData[propertyName];
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
                    scope.classificationOptions = data.classificationOptions || [];
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

            scope.calculateTotals = function () {
                scope.formData.totalExternalLoanAmount = 0;
                scope.formData.totalInstallments = 0;
                angular.forEach(scope.currentLoans, function (currentLoan, index) {
                    scope.formData.totalExternalLoanAmount += Number(currentLoan.totalLoanBalance?Number(currentLoan.totalLoanBalance):0);
                    scope.formData.totalInstallments += Number(currentLoan.charges?Number(currentLoan.charges):0);
                });
            }

            scope.removeLoan = function (index) {
                console.log("going to remove loan at index: " + index);
                if (scope.currentLoans.length <= 1) {
                    scope.currentLoans = []
                } else {
                    scope.currentLoans.splice((Number(index)), 1)
                }

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
                scope.formData.totalIncome = 0;
                let monthlyIncome = Number(scope.formData.monthlyIncome ? scope.formData.monthlyIncome : 0);
                let otherIncome = Number(scope.formData.otherIncome ? scope.formData.otherIncome : 0);
                let businessProfit = Number(scope.formData.businessProfit ? scope.formData.businessProfit : 0);
                let clientProfit = Number(scope.formData.clientProfit ? scope.formData.clientProfit : 0);
                scope.formData.totalIncome = (monthlyIncome + otherIncome + (businessProfit < clientProfit ? businessProfit : clientProfit));
                return scope.formData.totalIncome;
            }

            scope.$watch('formData.rentMortgageFee', function(){
                scope.calculateTotalExpenditure();
            });

            scope.$watch('formData.familyExpenses', function(){
                scope.calculateTotalExpenditure();
            });

            scope.$watch('formData.totalInstallments', function(){
                scope.calculateTotalExpenditure();
            });

            scope.calculateTotalExpenditure = function () {
                scope.formData.totalExpenditures = 0;
                let rentMortgageFee = Number(scope.formData.rentMortgageFee ? scope.formData.rentMortgageFee : 0);
                let familyExpenses = Number(scope.formData.familyExpenses ? scope.formData.familyExpenses : 0);
                let totalInstallments = Number(scope.formData.totalInstallments ? scope.formData.totalInstallments : 0);
                scope.formData.totalExpenditures = (rentMortgageFee + familyExpenses + totalInstallments);

                return scope.formData.totalExpenditures;
            }

            scope.$watch('formData.totalIncome', function(){
                scope.calculateAvailableMonthly();
            });

            scope.$watch('formData.totalExpenditures', function(){
                scope.calculateAvailableMonthly();
            });

            scope.calculateAvailableMonthly = function () {
                scope.formData.availableMonthly = 0;
                let totalIncome = Number(scope.formData.totalIncome ? scope.formData.totalIncome : 0);
                let totalExpenditures = Number(scope.formData.totalExpenditures ? scope.formData.totalExpenditures : 0);
                scope.formData.availableMonthly = (totalIncome - totalExpenditures);

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
                scope.formData.paymentCapacity = 0;
                let monthlyPaymentCapacity = Number(scope.formData.monthlyPaymentCapacity ? scope.formData.monthlyPaymentCapacity : 0);
                let availableMonthly = Number(scope.formData.availableMonthly ? scope.formData.availableMonthly : 0);
                let proposedFee = Number(scope.formData.proposedFee ? scope.formData.proposedFee : 0);
                let minimumCapacity = monthlyPaymentCapacity < availableMonthly ? monthlyPaymentCapacity : availableMonthly;
                scope.formData.paymentCapacity = (proposedFee / minimumCapacity).toFixed(1);
                return scope.formData.paymentCapacity;
            }

            scope.$watch('formData.facilitatorProposedValue', function(){
                scope.calculateFacValue();
            });

            scope.$watch('formData.inventories', function(){
                scope.calculateFacValue();
            });

            scope.calculateFacValue = function () {
                scope.formData.facValue = 0;
                let facilitatorProposedValue = Number(scope.formData.facilitatorProposedValue ? scope.formData.facilitatorProposedValue : 0);
                let inventories = Number(scope.formData.inventories ? scope.formData.inventories : 0);
                scope.formData.facValue = (facilitatorProposedValue / inventories).toFixed(1);
                return scope.formData.facValue;
            }

            scope.$watch('formData.totalInstallments', function(){
                scope.calculateDebtLevel();
            });

            scope.$watch('formData.availableMonthly', function(){
                scope.calculateDebtLevel();
            });

            scope.calculateDebtLevel = function () {
                scope.formData.debtLevel = 0;
                let totalInstallments = Number(scope.formData.totalInstallments ? scope.formData.totalInstallments : 0);
                let availableMonthly = Number(scope.formData.availableMonthly ? scope.formData.availableMonthly : 0);
                scope.formData.debtLevel = (totalInstallments / availableMonthly).toFixed(1);
                return scope.formData.debtLevel;
            }

            scope.$watch('formData.salesValue', function(){
                scope.calculateBusinessProfit(scope.formData.salesValue, scope.formData.businessPurchases)
            });

            scope.$watch('formData.businessPurchases', function(){
                scope.calculateBusinessProfit(scope.formData.salesValue, scope.formData.businessPurchases)
            });

            scope.calculateBusinessProfit = function (sales, purchases) {
                scope.formData.businessProfit = 0;
                scope.formData.businessProfit = Number(sales ? sales : 0) - Number(purchases ? purchases : 0);
                return scope.formData.businessProfit;
            }

            scope.cancel = function () {
                location.path('/viewloanaccount/' + routeParams.id);
            }
        }
    });
    mifosX.ng.application.controller('EditLoanAccAppController', ['$scope', '$routeParams', 'ResourceFactory', '$location', 'dateFilter', 'UIConfigService', mifosX.controllers.EditLoanAccAppController]).run(function ($log) {
        $log.info("EditLoanAccAppController initialized");
    });
}(mifosX.controllers || {}));
