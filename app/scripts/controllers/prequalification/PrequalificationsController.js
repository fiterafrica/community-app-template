(function (module) {
    mifosX.controllers = _.extend(module, {
        PrequalificationsController: function (scope, routeParams, route, dateFilter, location, resourceFactory, http, $uibModal, API_VERSION, $timeout, $rootScope, Upload) {

            scope.groupsList = [];
            scope.formData = {};
            scope.groupsPerPage=20;
            scope.groupingType=routeParams.groupingType;
            scope.prequalificationType=routeParams.type;
            scope.isIndividual=routeParams.individual;

            scope.getResultsPage = function (pageNumber) {
                resourceFactory.prequalificationResource.getAllGroups({
                    offset: ((pageNumber - 1) * scope.groupsPerPage),
                    limit: scope.groupsPerPage,
                    type: routeParams.type,
                    status: scope.formData.status,
                    agencyId: scope.formData.agencyId,
                    searchText:scope.searchText,
                    groupingType: routeParams.groupingType,
                    orderBy: 'g.id',
                    sortOrder: 'desc'
                }, function (data) {
                    scope.totalGroups = data.totalFilteredRecords;
                    scope.groupsList = data.pageItems;
                });
            }

            resourceFactory.prequalificationTemplateResource.get({type:routeParams.type},function (data) {
                scope.groupStatusOptions = data.groupStatusOptions
                scope.agencyOptions = data.agencies
                if (data.agencies && data.agencies.length === 1) {
                    scope.formData.agencyId = scope.agencyOptions[0].id
                }
                scope.getResultsPage(1);

            });
        }
    });

    mifosX.ng.application.controller('PrequalificationsController', ['$scope', '$routeParams', '$route', 'dateFilter', '$location', 'ResourceFactory', '$http', '$uibModal', 'API_VERSION', '$timeout', '$rootScope', 'Upload', mifosX.controllers.PrequalificationsController]).run(function ($log) {
        $log.info("PrequalificationsController initialized");
    });
}(mifosX.controllers || {}));
