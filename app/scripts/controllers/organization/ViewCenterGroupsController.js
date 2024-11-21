(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewCenterGroupsController: function (scope, routeParams, route, location, resourceFactory) {
            scope.centers=[];

            let portfolioId = routeParams.portfolioId;
            let portfolioCenterId = routeParams.portfolioCenterId;

            scope.convertTimeArrayToObject = function(timeFieldName){
                var date = new Date();
                for(var i in scope.groups){
                    scope.groups[i][timeFieldName] =  new Date(date.getFullYear(), date.getMonth(), date.getDay(), scope.groups[i][timeFieldName][0], scope.groups[i][timeFieldName][1], 0);
                }
            };

            resourceFactory.portfolioCenterResource.get({portfolioId:portfolioId, portfolioCenterId: portfolioCenterId}, function (data) {
                scope.portfolioCenter = data;

                // groups associated with this center
                if (data.groups) {
                    scope.groups = data.groups;
                    scope.convertTimeArrayToObject('meetingStartTime');
                    scope.convertTimeArrayToObject('meetingEndTime');
                }
            });

            scope.routeToAddGroup=function()
            {
                location.path('/createcentergroup/'+ portfolioId +'/'+ routeParams.portfolioCenterId);
            }

            scope.editCenterGroup=function(centerGroupId)
            {
                location.path('/editcentergroup/'+ portfolioId +'/'+ routeParams.portfolioCenterId +'/'+ centerGroupId);
            }

            scope.transferCenterGroup=function(centerGroupId)
            {
                location.path('/transfercentergroup/'+ portfolioId +'/'+ routeParams.portfolioCenterId +'/'+ centerGroupId);
            }

        }

    });
    mifosX.ng.application.controller('ViewCenterGroupsController', ['$scope', '$routeParams', '$route', '$location', 'ResourceFactory', mifosX.controllers.ViewCenterGroupsController]).run(function ($log) {
        $log.info("ViewCenterGroupsController initialized");
    });
}(mifosX.controllers || {}));