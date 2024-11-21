(function (module) {
    mifosX.controllers = _.extend(module, {
        AddToBlacklistController: function (scope, routeParams, route, location, resourceFactory, http, $uibModal, API_VERSION, $timeout, $rootScope, Upload) {
            scope.client = null;
            scope.dpi = null;
            scope.typificationOptions = [];
            scope.loanProductOptions = [];
            scope.agenciesList = [];

            scope.formData={};


            resourceFactory.blacklistTemplateResource.get(function (data) {
                scope.typificationOptions= data.typificationOptions
                scope.loanProductOptions= data.loanProducts
            });


            resourceFactory.agencyResource.getAllAgenciesForCurrentUser(function (data) {
                scope.agenciesList = data;
            });

            scope.submit=function (){
                this.formData.locale = scope.optlang.code;

                resourceFactory.blacklistResource.save(this.formData, function (data) {
                    location.path('blacklist/'+data.resourceId+'/viewdetails' );
                });
            }

            // scope.routeTo = async ()=>{
            //     await setTimeout(function (){
            //         location.path('/blacklist' );
            //     },3000);
            // }

        }
    });

    mifosX.ng.application.controller('AddToBlacklistController', ['$scope', '$routeParams', '$route', '$location', 'ResourceFactory', '$http', '$uibModal', 'API_VERSION', '$timeout', '$rootScope', 'Upload', mifosX.controllers.AddToBlacklistController]).run(function ($log) {
        $log.info("AddToBlacklistController initialized");
    });
}(mifosX.controllers || {}));
