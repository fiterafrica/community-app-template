(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateAgencyController: function (scope, resourceFactory, location, dateFilter) {
            scope.agencies = [];
            scope.first = {};
            scope.tf = "HH:mm";

            let requestParams = {orderBy: 'description', sortOrder: 'ASC'};
            resourceFactory.agencyTemplateResource.get(requestParams, function (data) {
                scope.currencyOptions = data.currencyOptions;
                scope.cityOptions = data.cityOptions;
                scope.stateOptions = data.stateOptions;
                scope.countryOptions = data.countryOptions;
                scope.agencyEntityCodesOptions = data.agencyEntityCodesOptions;
                scope.agencyTypeOptions = data.agencyTypeOptions;
                scope.parentOfficesOptions = data.parentOfficesOptions;
                scope.labourDayOptions = data.labourDayOptions;
                scope.financialMonthOptions = data.financialMonthOptions;
                scope.financialMonthOptions = data.financialMonthOptions;
                scope.responsibleUserOptions = data.responsibleUserOptions;
                scope.formData = {
                    parentId: scope.parentOfficesOptions[0].id,
                    entityCode: scope.agencyEntityCodesOptions[0].id,
                    currencyCode: scope.currencyOptions[0].code,
                    agencyType: scope.agencyTypeOptions[0].id,
                    responsibleUserId: scope.responsibleUserOptions[0].id
                }
            });

            scope.submit = function () {
                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;

                if (scope.formData.openHourMorning) {
                    this.formData.openHourMorning = dateFilter(scope.formData.openHourMorning, scope.tf);
                }
                if (scope.formData.openHourAfternoon) {
                    this.formData.openHourAfternoon = dateFilter(scope.formData.openHourAfternoon, scope.tf);
                }

                resourceFactory.agencyResource.save(this.formData, function (data) {
                    location.path('/viewagency/' + data.resourceId);
                });
            };
        }
    });
    mifosX.ng.application.controller('CreateAgencyController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', mifosX.controllers.CreateAgencyController]).run(function ($log) {
        $log.info("CreateAgencyController initialized");
    });
}(mifosX.controllers || {}));
