(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewPortfolioController: function (scope, routeParams, route, location, resourceFactory) {
            scope.centers=[];
            
            resourceFactory.portfolioResource.get({portfolioId: routeParams.id}, function (data) {
                scope.portfolio = data;

                // centers associated with this portfolio
                if (data.centers) {
                    scope.centers = data.centers;
                }
            });

            scope.editCenter=function(centerId)
            {
                location.path('/editportfoliocenter/'+routeParams.id+'/'+centerId);
            }

            scope.viewGroups=function(centerId)
            {
                location.path('/viewcentergroups/'+routeParams.id+'/'+centerId);
            }

        }

    });
    mifosX.ng.application.controller('ViewPortfolioController', ['$scope', '$routeParams', '$route', '$location', 'ResourceFactory', mifosX.controllers.ViewPortfolioController]).run(function ($log) {
        $log.info("ViewPortfolioController initialized");
    });
}(mifosX.controllers || {}));