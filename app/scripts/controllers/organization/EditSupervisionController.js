(function (module) {
    mifosX.controllers = _.extend(module, {
        EditSupervisionController: function (scope, routeParams, resourceFactory, location, dateFilter) {
            scope.formData = {};
            scope.parentOfficesOptions = [];
            scope.responsibleUserOptions = [];
            scope.tf = "HH:mm";

            let requestParams = {orderBy: 'description', sortOrder: 'ASC'};
            resourceFactory.supervisionTemplateResource.get(requestParams, function (data) {
                scope.parentOfficesOptions = data.parentOfficesOptions;
                scope.responsibleUserOptions = data.responsibleUserOptions;
                scope.agencyOptions = data.agencyOptions;
            });

            resourceFactory.supervisionResource.get({supervisionId: routeParams.id}, function (data) {
                scope.formData = {
                       id: data.id,
                       name: data.name,
                       agencyId: data.agencyId,
                       responsibleUserId: data.responsibleUserId,
                       parentId: data.parentId
                }
            });

            scope.submit = function () {
                // remove extra fields from form data
                delete this.formData.parentName;

                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;

                 resourceFactory.supervisionResource.update({'supervisionId': routeParams.id}, this.formData, function (data) {
                    location.path('/viewsupervision/' + data.resourceId);
                });
            };
        }
    });
    mifosX.ng.application.controller('EditSupervisionController', ['$scope', '$routeParams', 'ResourceFactory', '$location', 'dateFilter', mifosX.controllers.EditSupervisionController]).run(function ($log) {
        $log.info("EditSupervisionController initialized");
    });
}(mifosX.controllers || {}));
