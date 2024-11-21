(function (module) {
    mifosX.controllers = _.extend(module, {
        CreatePortfolioController: function (scope, resourceFactory, location, dateFilter) {
            scope.portfolios = [];
            scope.first = {};
            scope.tf = "HH:mm";

            let requestParams = {orderBy: 'description', sortOrder: 'ASC'};
            resourceFactory.portfolioTemplateResource.get(requestParams, function (data) {
                scope.parentOfficesOptions = data.parentOfficesOptions;
                scope.responsibleUserOptions = data.responsibleUserOptions;
                scope.supervisionOptions = data.supervisionOptions;
                scope.formData = {
                    parentId: scope.parentOfficesOptions[0].id,
                    responsibleUserId: scope.responsibleUserOptions[0].id,
                    supervisionId: scope.supervisionOptions[0].id
                }
            });

            scope.submit = function () {
                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;

                resourceFactory.portfolioResource.save(this.formData, function (data) {
                    location.path('/viewportfolio/' + data.resourceId);
                });
            };
        }
    });
    mifosX.ng.application.controller('CreatePortfolioController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', mifosX.controllers.CreatePortfolioController]).run(function ($log) {
        $log.info("CreatePortfolioController initialized");
    });
}(mifosX.controllers || {}));
