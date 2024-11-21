(function (module) {
    mifosX.controllers = _.extend(module, {
        EditBankController: function (scope, routeParams, route, location, resourceFactory, http, $uibModal, API_VERSION, $timeout, $rootScope, Upload) {
            scope.formData={};

            resourceFactory.bankResource.get({bankId: routeParams.bankId}, function (data) {
                scope.edit = data;
                scope.formData = {
                    name: data.name,
                    code: data.code
                };
            });

            scope.submit=function (){

                resourceFactory.bankResource.update({bankId: routeParams.bankId}, this.formData, function (data) {
                    location.path('banks/'+data.resourceId+'/viewdetails' );
                });
            }

        }
    });

    mifosX.ng.application.controller('EditBankController', ['$scope', '$routeParams', '$route', '$location', 'ResourceFactory', '$http', '$uibModal', 'API_VERSION', '$timeout', '$rootScope', 'Upload', mifosX.controllers.EditBankController]).run(function ($log) {
        $log.info("EditBankController initialized");
    });
}(mifosX.controllers || {}));
