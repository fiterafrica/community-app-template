(function (module) {
    mifosX.controllers = _.extend(module, {
        RemoveBlacklistController: function (scope, routeParams, route, location, resourceFactory, http, $uibModal, API_VERSION, $timeout, $rootScope, Upload) {
            scope.client = null;
            scope.dpi = null;
            scope.typificationOptions = [];
            scope.loanProductOptions = [];
            scope.blacklistDocuments = [];
            scope.action = routeParams.action;

            scope.formData={};


            resourceFactory.blacklistResource.getOne({blacklistId: routeParams.blacklistId}, function (data) {
                scope.client = data;
            });

            resourceFactory.blacklistDocumentsResource.getAllDocuments({blacklistId: routeParams.blacklistId}, function (data) {
                for (var l in data) {

                    var bldocs = {};
                    bldocs = API_VERSION + '/' + data[l].parentEntityType + '/' + data[l].parentEntityId + '/documents/' + data[l].id + '/attachment?tenantIdentifier=' + $rootScope.tenantIdentifier;
                    data[l].docUrl = bldocs;
                    if (data[l].fileName)
                        if (data[l].fileName.toLowerCase().indexOf('.jpg') != -1 || data[l].fileName.toLowerCase().indexOf('.jpeg') != -1 || data[l].fileName.toLowerCase().indexOf('.png') != -1)
                            data[l].fileIsImage = true;
                    if (data[l].type)
                        if (data[l].type.toLowerCase().indexOf('image') != -1)
                            data[l].fileIsImage = true;
                }
                scope.blacklistDocuments = data;
            });

            scope.submit = function () {
                Upload.upload({
                    url: $rootScope.hostUrl + API_VERSION + '/blacklist/' + routeParams.blacklistId+ '/removeblacklist',
                    data: { name : scope.client.clientName, description : scope.formData.description, file: scope.formData.file},
                }).then(function (data) {
                    // to fix IE not refreshing the model
                    if (!scope.$$phase) {
                        scope.$apply();
                    }
                    location.path('/blacklist');
                });
            };
            scope.routeTo = async ()=>{
                await setTimeout(function (){
                    location.path('/blacklist' );
                },3000);
            }

            scope.onFileSelect = function (files) {
                scope.formData.file = files[0];
            };

        }
    });

    mifosX.ng.application.controller('RemoveBlacklistController', ['$scope', '$routeParams', '$route', '$location', 'ResourceFactory', '$http', '$uibModal', 'API_VERSION', '$timeout', '$rootScope', 'Upload', mifosX.controllers.RemoveBlacklistController]).run(function ($log) {
        $log.info("RemoveBlacklistController initialized");
    });
}(mifosX.controllers || {}));
