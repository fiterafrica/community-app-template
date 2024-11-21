(function (module) {
    mifosX.controllers = _.extend(module, {
        EditAgencyController: function (scope, routeParams, resourceFactory, location, dateFilter) {
            scope.formData = {};
            scope.currencyOptions = [];
            scope.cityOptions = [];
            scope.stateOptions = [];
            scope.countryOptions = [];
            scope.agencyEntityCodesOptions = [];
            scope.agencyTypeOptions = [];
            scope.parentOfficesOptions = [];
            scope.labourDayOptions = [];
            scope.financialMonthOptions = [];
            scope.responsibleUserOptions = [];
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
                scope.responsibleUserOptions = data.responsibleUserOptions;
            });

            resourceFactory.agencyResource.get({agencyId: routeParams.id}, function (data) {
                scope.formData = data;
                scope.formData.cityId = data.city.id;
                scope.formData.stateId = data.state.id;
                scope.formData.countryId = data.country.id;
                scope.formData.entityCode = data.entityCode.id;
                scope.formData.agencyType = data.agencyType.id;
                scope.formData.currencyCode = data.currency.code;
                scope.formData.labourDayFrom = data.labourDayFrom.id;
                scope.formData.labourDayTo = data.labourDayTo.id;
                scope.formData.financialYearFrom = data.financialYearFrom.id;
                scope.formData.financialYearTo = data.financialYearTo.id;
                scope.formData.nonBusinessDay1 = data.nonBusinessDay1.id;
                scope.formData.nonBusinessDay2 = data.nonBusinessDay2.id;
                scope.formData.halfBusinessDay1 = data.halfBusinessDay1.id;
                scope.formData.halfBusinessDay2 = data.halfBusinessDay2.id;
                scope.formData.parentId = data.parentId;
                if (data.openHourMorning) {
                    var date = new Date();
                    scope.formData.openHourMorning = new Date(date.getFullYear(), date.getMonth(), date.getDay(), data.openHourMorning[0], data.openHourMorning[1], 0);
                }

                if (data.openHourAfternoon) {
                    var date = new Date();
                    scope.formData.openHourAfternoon = new Date(date.getFullYear(), date.getMonth(), date.getDay(), data.openHourAfternoon[0], data.openHourAfternoon[1], 0);
                }
            });

            scope.submit = function () {
                // remove extra fields from form data
                delete this.formData.parentName;
                delete this.formData.city;
                delete this.formData.state;
                delete this.formData.country;
                delete this.formData.currency;
                delete this.formData.responsibleUserName;

                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;

                if (scope.formData.openHourMorning) {
                    this.formData.openHourMorning = dateFilter(scope.formData.openHourMorning, scope.tf);
                }
                if (scope.formData.openHourAfternoon) {
                    this.formData.openHourAfternoon = dateFilter(scope.formData.openHourAfternoon, scope.tf);
                }
                 resourceFactory.agencyResource.update({'agencyId': routeParams.id}, this.formData, function (data) {
                    location.path('/viewagency/' + data.resourceId);
                });
            };
        }
    });
    mifosX.ng.application.controller('EditAgencyController', ['$scope', '$routeParams', 'ResourceFactory', '$location', 'dateFilter', mifosX.controllers.EditAgencyController]).run(function ($log) {
        $log.info("EditAgencyController initialized");
    });
}(mifosX.controllers || {}));
