(function (module) {
    mifosX.controllers = _.extend(module, {
        EditPortfolioController: function (scope, routeParams, resourceFactory, location, dateFilter) {
            scope.formData = {};
            scope.parentOfficesOptions = [];
            scope.responsibleUserOptions = [];
            scope.tf = "HH:mm";

            let requestParams = {orderBy: 'description', sortOrder: 'ASC'};
            resourceFactory.portfolioTemplateResource.get(requestParams, function (data) {
                scope.parentOfficesOptions = data.parentOfficesOptions;
                scope.responsibleUserOptions = data.responsibleUserOptions;
                scope.supervisionOptions = data.supervisionOptions;
            });

            resourceFactory.portfolioResource.get({portfolioId: routeParams.id}, function (data) {
                scope.formData = {
                   id: data.id,
                   name: data.name,
                   supervisionId: data.supervisionId,
                   responsibleUserId: data.responsibleUserId,
                   parentId: data.parentId
                }
            });

            scope.submit = function () {
                // remove extra fields from form data
                delete this.formData.parentName;
                delete this.formData.responsibleUserName;
                delete this.formData.centers;

                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;

                resourceFactory.portfolioResource.update({'portfolioId': routeParams.id}, this.formData, function (data) {
                    location.path('/viewportfolio/' + data.resourceId);
                });
            };
        }
    });
    mifosX.ng.application.controller('EditPortfolioController', ['$scope', '$routeParams', 'ResourceFactory', '$location', 'dateFilter', mifosX.controllers.EditPortfolioController]).run(function ($log) {
        $log.info("EditPortfolioController initialized");
    });
}(mifosX.controllers || {}));
