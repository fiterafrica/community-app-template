(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateCenterGroupController: function (scope, routeParams, resourceFactory, location, dateFilter) {
            scope.formData = {};
            scope.parentOfficesOptions = [];
            scope.responsibleUserOptions = [];
            scope.statusOptions = [];
            scope.centerGroupLocations = [];
            scope.portfolioCenterOptions = [];
            scope.defaultMeetingPeriod = 0;
            scope.timePeriodBetweenMeeting = 0;
            scope.tf = "HH:mm";
            let portfolioId = routeParams.portfolioId;
            let portfolioCenterId = routeParams.portfolioCenterId;

            resourceFactory.portfolioCenterByCurrentUserResource.get({portfolioId:portfolioId},function(data)
            {
                scope.portfolioCenterOptions = data;
            });

            resourceFactory.configurationResourceByName.get({configName:'meeting-default-duration'}, function (data){
                scope.defaultMeetingPeriod = data.value;
            });

            resourceFactory.configurationResourceByName.get({configName:'time-between-meetings'}, function (data){
                scope.timePeriodBetweenMeeting = data.value;
            });

            scope.startTimeChanged = function(){
                // Perform any additional logic or actions here
                if(scope.formData.meetingStartTime != null
                        && scope.formData.meetingStartTime != undefined
                        && scope.formData.meetingStartTime != ""){

                    var meetingEndTime = new Date(scope.formData.meetingStartTime);
                    var hours = meetingEndTime.getHours();
                    var minutesToAdd = meetingEndTime.getMinutes() + scope.defaultMeetingPeriod + scope.timePeriodBetweenMeeting;
                    var newTime = new Date(meetingEndTime.getFullYear(), meetingEndTime.getMonth(), meetingEndTime.getDate(), hours, minutesToAdd);
                    scope.formData.meetingEndTime = newTime;
                }
            }

            resourceFactory.centerGroupTemplateResource.get({portfolioCenterId:portfolioCenterId}, function (data) {
                scope.parentOfficesOptions = data.parentOfficesOptions;
                scope.responsibleUserOptions = data.responsibleUserOptions;
                scope.statusOptions = data.statusOptions;
                scope.centerGroupLocations = data.centerGroupLocations;
                scope.formData = {
                    portfolioCenterId: parseInt(portfolioCenterId),
                    portfolioId: parseInt(portfolioId)
                }
            });

            scope.submit = function () {
                // remove extra fields from form data
                delete this.formData.parentName;
                delete this.formData.status;
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

                resourceFactory.centerGroupResource.save({'portfolioId': portfolioId, 'portfolioCenterId': portfolioCenterId}, this.formData, function (data) {
                    location.path('/viewcentergroups/' + portfolioId + "/" + portfolioCenterId);
                });
            };
        }
    });
    mifosX.ng.application.controller('CreateCenterGroupController', ['$scope', '$routeParams', 'ResourceFactory', '$location', 'dateFilter', mifosX.controllers.CreateCenterGroupController]).run(function ($log) {
        $log.info("CreateCenterGroupController initialized");
    });
}(mifosX.controllers || {}));
