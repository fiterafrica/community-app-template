(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateBankController: function (scope, routeParams, route, location, resourceFactory, http, $uibModal, API_VERSION, $timeout, $rootScope, Upload) {

            scope.formData={};


            scope.submit=function (){

                resourceFactory.bankResource.save(this.formData, function (data) {
                    location.path('banks' );
                    //location.path('/banks/' + data.resourceId + "/viewdetails");
                });
            }


        }
    });

    mifosX.ng.application.controller('CreateBankController', ['$scope', '$routeParams', '$route', '$location', 'ResourceFactory', '$http', '$uibModal', 'API_VERSION', '$timeout', '$rootScope', 'Upload', mifosX.controllers.CreateBankController]).run(function ($log) {
        $log.info("CreateBankController initialized");
    });
}(mifosX.controllers || {}));
