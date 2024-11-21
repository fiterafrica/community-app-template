(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateSupervisionController: function (scope, resourceFactory, location, dateFilter) {
            scope.supervisions = [];
            scope.first = {};
            scope.tf = "HH:mm";
            scope.formData = {};
            let requestParams = {orderBy: 'description', sortOrder: 'ASC'};
            resourceFactory.supervisionTemplateResource.get(requestParams, function (data) {
                scope.parentOfficesOptions = data.parentOfficesOptions;
                scope.responsibleUserOptions = data.responsibleUserOptions;
                scope.agencyOptions = data.agencyOptions;
                if(scope.parentOfficesOptions && scope.parentOfficesOptions.length > 0){
                   scope.formData.parentId = scope.parentOfficesOptions[0].id
                }
                if(scope.responsibleUserOptions && scope.responsibleUserOptions.length > 0){
                   scope.formData.responsibleUserId = scope.responsibleUserOptions[0].id
                }
                if(scope.agencyOptions && scope.agencyOptions.length > 0){
                   scope.formData.agencyId = scope.agencyOptions[0].id
                }
            });

            scope.submit = function () {
                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;

                resourceFactory.supervisionResource.save(this.formData, function (data) {
                    location.path('/viewsupervision/' + data.resourceId);
                });
            };
        }
    });
    mifosX.ng.application.controller('CreateSupervisionController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', mifosX.controllers.CreateSupervisionController]).run(function ($log) {
        $log.info("CreateSupervisionController initialized");
    });
}(mifosX.controllers || {}));
