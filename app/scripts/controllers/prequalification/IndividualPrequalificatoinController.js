(function (module) {
    mifosX.controllers = _.extend(module, {
        IndividualPrequalificatoinController: function (scope, routeParams, route, dateFilter, location, resourceFactory, http, $uibModal, API_VERSION, $timeout, $rootScope, Upload) {

            scope.membersList = [];
            scope.searchText;
            scope.clientsPerPage=20;
            scope.yesNo = [{value: "YES", name: "Yes"}, {value: "NO", name: "No"}];

            scope.getResultsPage = function (pageNumber) {
                var items = resourceFactory.individualPrequalificationResource.get({
                    offset: ((pageNumber - 1) * scope.clientsPerPage),
                    limit: scope.clientsPerPage,
                    searchText:scope.searchText
                }, function (data) {
                    scope.totalMembers = data.totalFilteredRecords;
                    scope.membersList = data.pageItems;
                });
            }

            scope.getResultsPage(1);


        }
    });

    mifosX.ng.application.controller('IndividualPrequalificatoinController', ['$scope', '$routeParams', '$route', 'dateFilter', '$location', 'ResourceFactory', '$http', '$uibModal', 'API_VERSION', '$timeout', '$rootScope', 'Upload', mifosX.controllers.IndividualPrequalificatoinController]).run(function ($log) {
        $log.info("IndividualPrequalificatoinController initialized");
    });
}(mifosX.controllers || {}));
