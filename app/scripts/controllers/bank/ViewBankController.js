(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewBankController: function (scope, routeParams, route, location, resourceFactory, http, $uibModal, API_VERSION, $timeout, $rootScope, Upload) {
            scope.bankData = {};

            scope.formData={};

            resourceFactory.bankResource.get({bankId: routeParams.bankId}, function (data) {
                scope.bankData = data;
            });

        }
    });

    mifosX.ng.application.controller('ViewBankController', ['$scope', '$routeParams', '$route', '$location', 'ResourceFactory', '$http', '$uibModal', 'API_VERSION', '$timeout', '$rootScope', 'Upload', mifosX.controllers.ViewBankController]).run(function ($log) {
        $log.info("ViewBankController initialized");
    });
}(mifosX.controllers || {}));
