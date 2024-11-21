(function (module) {
    mifosX.controllers = _.extend(module, {
        EditCenterController: function (scope, resourceFactory, location, routeParams, dateFilter) {
            scope.managecode = routeParams.managecode;
            scope.first = {};
            scope.first.date = new Date();
            scope.centerId = routeParams.id;
            scope.restrictDate = new Date();
            scope.tf = "HH:mm";
            resourceFactory.centerResource.get({centerId: routeParams.id, template: 'true',staffInSelectedOfficeOnly:true}, function (data) {
                scope.edit = data;
                scope.staffs = data.staffOptions;
                scope.cityOptions = data.cityOptions;
                scope.stateOptions = data.stateOptions;
                scope.typeOptions = data.typeOptions;
                scope.meetingDayOptions = data.meetingDayOptions;
                scope.formData = {
                    name: data.name,
                    externalId: data.externalId,
                    staffId: data.staffId,
                    portfolioId: data.portfolioId,
                    portfolioName: data.portfolioName,
                    cityId: data.city.id,
                    stateId: data.state.id,
                    centerTypeId: data.type.id,
                    legacyNumber: data.legacyNumber,
                    referencePoint: data.referencePoint,
                    meetingDay: data.meetingDay,
                    meetingDayName: data.meetingDayName,
                    distance: data.distance
                };

                if (data.activationDate) {
                    var newDate = dateFilter(data.activationDate, scope.df);
                    scope.first.date = new Date(newDate);
                }

                if (data.timeline.submittedOnDate) {
                    scope.mindate = new Date(data.timeline.submittedOnDate);
                }

                if (data.createdDate) {
                    let editDate = dateFilter(data.createdDate, scope.df);
                    scope.formData.createdDate = new Date(editDate);
                }

                var date = new Date();
                if (data.meetingStartTime) {
                    scope.formData.meetingStartTime = new Date(date.getFullYear(), date.getMonth(), date.getDay(), data.meetingStartTime[0], data.meetingStartTime[1], 0);
                }

                if (data.meetingEndTime) {
                    scope.formData.meetingEndTime = new Date(date.getFullYear(), date.getMonth(), date.getDay(), data.meetingEndTime[0], data.meetingEndTime[1], 0);
                }
            });

            scope.updateGroup = function () {
                var reqDate = dateFilter(scope.first.date, scope.df);
                this.formData.activationDate = reqDate;
                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;

                delete this.formData.portfolioName;
                delete this.formData.meetingDayName;
                delete this.formData.createdDate;
                if (scope.formData.meetingStartTime) {
                    this.formData.meetingStartTime = dateFilter(scope.formData.meetingStartTime, scope.tf);
                }
                if (scope.formData.meetingEndTime) {
                    this.formData.meetingEndTime = dateFilter(scope.formData.meetingEndTime, scope.tf);
                }

                resourceFactory.centerResource.update({centerId: routeParams.id}, this.formData, function (data) {
                    location.path('/viewcenter/' + routeParams.id);
                });
            };
            scope.activate = function () {
                var reqDate = dateFilter(scope.first.date, scope.df);
                var newActivation = new Object();
                newActivation.activationDate = reqDate;
                newActivation.locale = scope.optlang.code;
                newActivation.dateFormat = scope.df;
                resourceFactory.centerResource.save({centerId: routeParams.id, command: 'activate'}, newActivation, function (data) {
                    location.path('/viewcenter/' + routeParams.id);
                });
            };
        }
    });
    mifosX.ng.application.controller('EditCenterController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter', mifosX.controllers.EditCenterController]).run(function ($log) {
        $log.info("EditCenterController initialized");
    });
}(mifosX.controllers || {}));