(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewSupervisionController: function (scope, routeParams, route, location, resourceFactory) {
            scope.charges = [];
            
            resourceFactory.supervisionResource.get({supervisionId: routeParams.id}, function (data) {
                scope.supervision = data;
            });

        }

    });
    mifosX.ng.application.controller('ViewSupervisionController', ['$scope', '$routeParams', '$route', '$location', 'ResourceFactory', mifosX.controllers.ViewSupervisionController]).run(function ($log) {
        $log.info("ViewSupervisionController initialized");
    });
}(mifosX.controllers || {}));