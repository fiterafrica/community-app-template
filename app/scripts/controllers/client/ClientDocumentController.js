(function (module) {
    mifosX.controllers = _.extend(module, {
        ClientDocumentController: function (scope, location, resourceFactory, http, routeParams,dateFilter, API_VERSION, Upload, $rootScope) {
            scope.clientId = routeParams.clientId;
            scope.onFileSelect = function (files) {
                scope.formData.file = files[0];
            };

            scope.submit = function () {
                let dateCreated = dateFilter(scope.formData.dateCreated, scope.df);

                Upload.upload({
                    url: $rootScope.hostUrl + API_VERSION + '/clients/' + scope.clientId + '/documents',
                    data: { name : scope.formData.name, description : scope.formData.description, file: scope.formData.file,
                        documentType: scope.formData.documentType,documentPurpose: scope.formData.documentPurpose,
                        dateCreated: dateCreated, locale : scope.optlang.code, dateFormat : scope.df},
                }).then(function (data) {
                        // to fix IE not refreshing the model
                        if (!scope.$$phase) {
                            scope.$apply();
                        }
                        location.path('/viewclient/' + scope.clientId);
                    });
            };

            resourceFactory.codeValueNameResource.getAllCodeValues({codeName: "Document Type"}, function (data) {
                scope.documentTypes = data;
            });

            resourceFactory.codeValueNameResource.getAllCodeValues({codeName: "Document Purpose"}, function (data) {
                scope.documentPurposes = data;
            });
            resourceFactory.codeValueResource.getAllCodeValues({codeId: 34}, function (data) {
                scope.allowedDocumentTypes = data;
            });
        }
    });
    mifosX.ng.application.controller('ClientDocumentController', ['$scope', '$location', 'ResourceFactory', '$http', '$routeParams','dateFilter', 'API_VERSION', 'Upload', '$rootScope', mifosX.controllers.ClientDocumentController]).run(function ($log) {
        $log.info("ClientDocumentController initialized");
    });
}(mifosX.controllers || {}));
