(function (module) {
    mifosX.controllers = _.extend(module, {
        EditCenterGroupController: function (scope, routeParams, resourceFactory, location, dateFilter) {
            scope.formData = {};
            scope.parentOfficesOptions = [];
            scope.responsibleUserOptions = [];
            scope.statusOptions = [];
            scope.centerGroupLocations = [];
            scope.portfolioCenterOptions = [];
            scope.tf = "HH:mm";
            let portfolioId = routeParams.portfolioId
            let portfolioCenterId = routeParams.portfolioCenterId;
            let centerGroupId = routeParams.centerGroupId;

            resourceFactory.centerGroupTemplateResource.get({portfolioCenterId:portfolioCenterId}, function (data) {
                scope.parentOfficesOptions = data.parentOfficesOptions;
                scope.responsibleUserOptions = data.responsibleUserOptions;
                scope.statusOptions = data.statusOptions;
                scope.centerGroupLocations = data.centerGroupLocations;
            });

            resourceFactory.portfolioCenterByCurrentUserResource.get({portfolioId:portfolioId}, function (data) {
                scope.portfolioCenterOptions = data;
            });

            resourceFactory.centerGroupResource.get({portfolioCenterId: portfolioCenterId, centerGroupId:centerGroupId}, function (data) {
                scope.formData = data;
                scope.formData.statusId = data.status.id;
                scope.formData.grouplocation = data.grouplocation.id;
                scope.formData.portfolioId = parseInt(portfolioId);

                if (data.formationDate) {
                    let formationDate = dateFilter(data.formationDate, scope.df);
                    scope.formData.formationDate = new Date(formationDate);
                }

                var date = new Date();
                if (data.meetingStartTime) {
                    scope.formData.meetingStartTime = new Date(date.getFullYear(), date.getMonth(), date.getDay(), data.meetingStartTime[0], data.meetingStartTime[1], 0);
                }

                if (data.meetingEndTime) {
                    scope.formData.meetingEndTime = new Date(date.getFullYear(), date.getMonth(), date.getDay(), data.meetingEndTime[0], data.meetingEndTime[1], 0);
                }
            });

            scope.submit = function () {
                // remove extra fields from form data
                delete this.formData.parentName;
                delete this.formData.status;
                delete this.formData.portfolioCenterName;
                delete this.formData.responsibleUserName;
                delete this.formData.portfolioId;

                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;

                this.formData.formationDate = dateFilter(scope.formData.formationDate, scope.df);

                if (scope.formData.meetingStartTime) {
                    this.formData.meetingStartTime = dateFilter(scope.formData.meetingStartTime, scope.tf);
                }
                if (scope.formData.meetingEndTime) {
                    this.formData.meetingEndTime = dateFilter(scope.formData.meetingEndTime, scope.tf);
                }

                 resourceFactory.centerGroupResource.update({'portfolioCenterId':portfolioCenterId, 'centerGroupId': centerGroupId}, this.formData, function (data) {
                    location.path('/viewcentergroups/' + portfolioId + "/" + portfolioCenterId);
                });
            };
        }
    });
    mifosX.ng.application.controller('EditCenterGroupController', ['$scope', '$routeParams', 'ResourceFactory', '$location', 'dateFilter', mifosX.controllers.EditCenterGroupController]).run(function ($log) {
        $log.info("EditCenterGroupController initialized");
    });
}(mifosX.controllers || {}));
