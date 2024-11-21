(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewAgencyController: function (scope, routeParams, route, location, resourceFactory) {
            scope.charges = [];
            
            resourceFactory.agencyResource.get({agencyId: routeParams.id}, function (data) {
                scope.agency = data;
            });

        }

    });
    mifosX.ng.application.controller('ViewAgencyController', ['$scope', '$routeParams', '$route', '$location', 'ResourceFactory', mifosX.controllers.ViewAgencyController]).run(function ($log) {
        $log.info("ViewAgencyController initialized");
    });
}(mifosX.controllers || {}));