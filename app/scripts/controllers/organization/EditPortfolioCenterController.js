(function (module) {
    mifosX.controllers = _.extend(module, {
        EditPortfolioCenterController: function (scope, routeParams, resourceFactory, location, dateFilter) {
            scope.formData = {};
            scope.cityOptions = [];
            scope.stateOptions = [];
            scope.parentOfficesOptions = [];
            scope.typeOptions = [];
            scope.statusOptions = [];
            scope.meetingDayOptions = [];
            scope.tf = "HH:mm";
            scope.portfolioId = routeParams.portfolioId;

            let portfolioId = routeParams.portfolioId;
            let portfolioCenterId = routeParams.portfolioCenterId;

            resourceFactory.portfolioCenterTemplateResource.get({portfolioId:portfolioId}, function (data) {
                scope.parentOfficesOptions = data.parentOfficesOptions;
                scope.responsibleUserOptions = data.responsibleUserOptions;
                scope.cityOptions = data.cityOptions;
                scope.stateOptions = data.stateOptions;
                scope.typeOptions = data.typeOptions;
                scope.statusOptions = data.statusOptions;
                scope.meetingDayOptions = data.meetingDayOptions;
            });

            resourceFactory.portfolioCenterResource.get({portfolioId:portfolioId, portfolioCenterId: portfolioCenterId}, function (data) {
                scope.formData = data;
                scope.formData.cityId = data.city.id;
                scope.formData.stateId = data.state.id;
                scope.formData.centerTypeId = data.type.id;
                scope.formData.statusId = data.status.id;

                if (data.createdDate) {
                    let editDate = dateFilter(data.createdDate, scope.df);
                    scope.formData.createdDate = new Date(editDate);
                }

                if (data.meetingStartTime) {
                    var date = new Date();
                    var meetingStartSplitted = data.meetingStartTime.split(":", 2);
                    scope.formData.meetingStartTime = new Date(date.getFullYear(), date.getMonth(), date.getDay(), meetingStartSplitted[0], meetingStartSplitted[1], 0);
                }

                if (data.meetingEndTime) {
                    var date = new Date();
                    var meetingEndSplitted = data.meetingEndTime.split(":", 2);
                    scope.formData.meetingEndTime = new Date(date.getFullYear(), date.getMonth(), date.getDay(), meetingEndSplitted[0], meetingEndSplitted[1], 0);
                }
            });

            scope.submit = function () {
                // remove extra fields from form data
                delete this.formData.parentName;
                delete this.formData.city;
                delete this.formData.state;
                delete this.formData.status;
                delete this.formData.type;
                delete this.formData.responsibleUserName;
                delete this.formData.meetingDayName;
                delete this.formData.groups;

                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;

                if (scope.formData.meetingStartTime) {
                    this.formData.meetingStartTime = dateFilter(scope.formData.meetingStartTime, scope.tf);
                }
                if (scope.formData.meetingEndTime) {
                    this.formData.meetingEndTime = dateFilter(scope.formData.meetingEndTime, scope.tf);
                }

                 resourceFactory.portfolioCenterResource.update({'portfolioId':portfolioId, 'portfolioCenterId': portfolioCenterId}, this.formData, function (data) {
                    location.path('/viewportfolio/' + portfolioId);
                });
            };
        }
    });
    mifosX.ng.application.controller('EditPortfolioCenterController', ['$scope', '$routeParams', 'ResourceFactory', '$location', 'dateFilter', mifosX.controllers.EditPortfolioCenterController]).run(function ($log) {
        $log.info("EditPortfolioCenterController initialized");
    });
}(mifosX.controllers || {}));
