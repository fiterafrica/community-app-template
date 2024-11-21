(function (module) {
    mifosX.controllers = _.extend(module, {
        EditClientController: function (scope, routeParams, resourceFactory, location, http, dateFilter, API_VERSION, Upload, $rootScope) {
            scope.offices = [];
            scope.date = {};
            scope.restrictDate = new Date();
            scope.savingproducts = [];
            scope.clientId = routeParams.id;
            scope.showSavingOptions = 'false';
            scope.opensavingsproduct = 'false';
            scope.showNonPersonOptions = false;
            scope.clientPersonId = 1;
            resourceFactory.clientResource.get({clientId: routeParams.id, template:'true', staffInSelectedOfficeOnly:true}, function (data) {
                scope.offices = data.officeOptions;
                scope.staffs = data.staffOptions;
                scope.savingproducts = data.savingProductOptions;
                scope.genderOptions = data.genderOptions;
                scope.clienttypeOptions = data.clientTypeOptions;
                scope.clientClassificationOptions = data.clientClassificationOptions;
                scope.clientNonPersonConstitutionOptions = data.clientNonPersonConstitutionOptions;
                scope.clientNonPersonMainBusinessLineOptions = data.clientNonPersonMainBusinessLineOptions;
                scope.clientLegalFormOptions = data.clientLegalFormOptions;
                scope.maritalStatusOptions = data.maritalStatusOptions;
                scope.jobTypeOptions = data.jobTypeOptions;
                scope.educationLevelOptions = data.educationLevelOptions;
                scope.officeId = data.officeId;
                scope.formData = {
                    firstname: data.firstname,
                    lastname: data.lastname,
                    middlename: data.middlename,
                    active: data.active,
                    accountNo: data.accountNo,
                    dpi: data.dpiNumber,
                    municipalDpi: data.municipalDpi,
                    departmentDpi: data.departmentDpi,
                    firstlastname: data.firstlastname,
                    secondlastname: data.secondlastname,
                    oldCustomerNumber: data.oldCustomerNumber,
                    staffId: data.staffId,
                    externalId: data.externalId,
                    isStaff:data.isStaff,
                    mobileNo: data.mobileNo,
                    savingsProductId: data.savingsProductId,
                    genderId: data.gender.id,
                    fullname: data.fullname,
                    maritalStatusId: data.maritalStatus,
                    jobType: data.jobType,
                    nit: data.nit,
                    educationLevelId: data.educationLevel,
                    clientNonPersonDetails : {
                        incorpNumber: data.clientNonPersonDetails.incorpNumber,
                        remarks: data.clientNonPersonDetails.remarks
                    }
                };
                scope.clientAreaOptions = data.clientAreaOptions;
                scope.publicServiceOptions = data.publicServiceOptions;
                scope.housingTypeOptions = data.housingTypeOptions;
                scope.departamentoOptions = data.departamentoOptions;
                scope.municipioOptions = data.municipioOptions;
                scope.formData.publicServices = [];
                scope.publicServiceChecks = {};
                scope.publicServiceTypes = [];
                scope.economicSectorOptions = data.economicSectorData;
                scope.economicActivities = data.economicActivityData;

                var detailData = data.detailData;
                if(detailData){
                    scope.formData = {...scope.formData, ...detailData};
                    if (detailData.economicSector) {
                        scope.formData.economicSector = Number(detailData.economicSector);
                        scope.updateActivities();
                        scope.formData.economicActivity = Number(detailData.economicActivity);
                    }
                }





                var contactInformation = data.clientContactInformation;
                if(contactInformation){
                    scope.formData.residenceYears = contactInformation.yearsOfResidence;
                    scope.formData.communityYears = contactInformation.communityYears;
                    scope.formData.village = contactInformation.village;
                    scope.formData.homeNumber = contactInformation.homePhone;
                    scope.formData.lightDeviceNumber = contactInformation.lightMeterNumber;
                    scope.formData.zone = contactInformation.zone;
                    scope.formData.square = contactInformation.square;
                    scope.formData.colony = contactInformation.colony;
                    scope.formData.streetNumber = contactInformation.streetNumber;
                    scope.formData.avenue = contactInformation.avenue;
                    scope.formData.street = contactInformation.street;
                    scope.formData.sector = contactInformation.sector;
                    scope.formData.batch = contactInformation.batch;
                    scope.formData.referenceData = contactInformation.referenceHousingData;
                    scope.publicServiceTypes = contactInformation.publicServiceTypes;
                    for(var i = 0; i < scope.clientAreaOptions.length; i++){
                        if(contactInformation.area === scope.clientAreaOptions[i].name){
                            scope.formData.clientArea = scope.clientAreaOptions[i].id
                            break;
                        }
                    }

                   for(var i = 0; i < scope.departamentoOptions.length; i++){
                        if(contactInformation.department === scope.departamentoOptions[i].name){
                            scope.formData.departmentId = scope.departamentoOptions[i].id
                            break;
                        }
                    }

                   for(var i = 0; i < scope.housingTypeOptions.length; i++){
                        if(contactInformation.housingType === scope.housingTypeOptions[i].name){
                            scope.formData.housingTypeId = scope.housingTypeOptions[i].id
                            break;
                        }
                    }

                   for(var i = 0; i < scope.municipioOptions.length; i++){
                        if(contactInformation.municipality === scope.municipioOptions[i].name){
                            scope.formData.municipalId = scope.municipioOptions[i].id
                            break;
                        }
                    }
                }
                for (var i = 0; i < scope.publicServiceOptions.length; i++) {
                    var serviceId = scope.publicServiceOptions[i].id;
                    var checked = false;
                    for (var j = 0; j < scope.publicServiceTypes.length; j++){
                            if(scope.publicServiceTypes[j].id === serviceId){
                                   checked = true;
                            }
                    }
                    scope.publicServiceChecks[serviceId] = checked;
                    scope.formData.publicServices.push({
                        id: scope.publicServiceOptions[i].id,
                        checked: checked
                    });
                }

                if(data.gender){
                    scope.formData.genderId = data.gender.id;
                }

                if(data.clientType){
                    scope.formData.clientTypeId = data.clientType.id;
                }

                if(data.clientClassification){
                    scope.formData.clientClassificationId = data.clientClassification.id;
                }

                if(data.legalForm){
                    scope.displayPersonOrNonPersonOptions(data.legalForm.id);
                    scope.formData.legalFormId = data.legalForm.id;
                }

                if(data.clientNonPersonDetails.constitution){
                    scope.formData.clientNonPersonDetails.constitutionId = data.clientNonPersonDetails.constitution.id;
                }

                if(data.clientNonPersonDetails.mainBusinessLine){
                    scope.formData.clientNonPersonDetails.mainBusinessLineId = data.clientNonPersonDetails.mainBusinessLine.id;
                }

                if (data.savingsProductId != null) {
                    scope.opensavingsproduct = 'true';
                    scope.showSavingOptions = 'true';
                } else if (data.savingProductOptions.length > 0) {
                    scope.showSavingOptions = 'true';
                }

                if (data.dateOfBirth) {
                    var dobDate = dateFilter(data.dateOfBirth, scope.df);
                    scope.date.dateOfBirth = new Date(dobDate);
                }

                if (data.clientNonPersonDetails.incorpValidityTillDate) {
                    var incorpValidityTillDate = dateFilter(data.clientNonPersonDetails.incorpValidityTillDate, scope.df);
                    scope.date.incorpValidityTillDate = new Date(incorpValidityTillDate);
                }

                var actDate = dateFilter(data.activationDate, scope.df);
                scope.date.activationDate = new Date(actDate);
                if (data.active) {
                    scope.choice = 1;
                    scope.showSavingOptions = 'false';
                    scope.opensavingsproduct = 'false';
                }

                if (data.timeline.submittedOnDate) {
                    var submittedOnDate = dateFilter(data.timeline.submittedOnDate, scope.df);
                    scope.date.submittedOnDate = new Date(submittedOnDate);
                }

            });

            scope.checkPublicService = function(serviceId){
                for (var i = 0; i < scope.formData.publicServices.length; i++) {
                    if(serviceId == scope.formData.publicServices[i].id){
                        scope.formData.publicServices[i].checked = scope.publicServiceChecks[serviceId];
                         break;
                    }
                 }
            }

            scope.displayPersonOrNonPersonOptions = function (legalFormId) {
                if(legalFormId == scope.clientPersonId || legalFormId == null) {
                    scope.showNonPersonOptions = false;
                }else {
                    scope.showNonPersonOptions = true;
                }
            };

            scope.updateActivities = function () {
                scope.formData.economicActivity = null;
                console.log("updateActivities: " + scope.formData.economicSector);
                scope.economicActivityOptions = scope.economicActivities.filter(function (economicActivity) {
                    return economicActivity.sectorId == scope.formData.economicSector;
                });
            };

            scope.submit = function () {
                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;
                if (scope.choice === 1) {
                    if (scope.date.activationDate) {
                        this.formData.activationDate = dateFilter(scope.date.activationDate, scope.df);
                    }
                }
                if(scope.date.dateOfBirth){
                    this.formData.dateOfBirth = dateFilter(scope.date.dateOfBirth,  scope.df);
                }

                if(scope.date.submittedOnDate){
                    this.formData.submittedOnDate = dateFilter(scope.date.submittedOnDate,  scope.df);
                }

                if(scope.date.incorpValidityTillDate){
                    this.formData.clientNonPersonDetails.locale = scope.optlang.code;
                    this.formData.clientNonPersonDetails.dateFormat = scope.df;
                    this.formData.clientNonPersonDetails.incorpValidityTillDate = dateFilter(scope.date.incorpValidityTillDate,  scope.df);
                }

                if(this.formData.legalFormId == scope.clientPersonId || this.formData.legalFormId == null) {
                    delete this.formData.fullname;
                }else {
                    delete this.formData.firstname;
                    delete this.formData.middlename;
                    delete this.formData.lastname;
                }

                console.log("dpi: "+ this.formData.dpi)
                resourceFactory.clientResource.update({'clientId': routeParams.id}, this.formData, function (data) {
                    location.path('/viewclient/' + routeParams.id);
                });
            };
        }
    });
    mifosX.ng.application.controller('EditClientController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$http', 'dateFilter', 'API_VERSION', 'Upload', '$rootScope', mifosX.controllers.EditClientController]).run(function ($log) {
        $log.info("EditClientController initialized");
    });
}(mifosX.controllers || {}));
