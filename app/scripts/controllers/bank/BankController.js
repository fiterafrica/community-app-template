(function (module) {
    mifosX.controllers = _.extend(module, {
        BankController: function (scope, routeParams, route, location, resourceFactory, http, $uibModal, API_VERSION, $timeout, $rootScope, Upload) {
            scope.banklist = [];
            scope.showInactive = false;
            scope.totalBanks;

            scope.formData = {};
            scope.searchText;
            scope.banksPerPage = 25;

            scope.getResultsPage = function (pageNumber) {
                var items = resourceFactory.bankResource.getAllBanks({
                    offset: ((pageNumber - 1) * scope.banksPerPage),
                    limit: scope.banksPerPage,
                    searchText: scope.searchText
                }, function (data) {
                    scope.totalBanks = data.totalFilteredRecords;
                    scope.banklist = data.pageItems;
                });
            }

            scope.getResultsPage(1);
            
            scope.routeTo = function (path) {
                location.path(path);
            }

            scope.getActiveInactive = function () {
                scope.showInactive = !scope.showInactive;
                scope.getResultsPage(1);
            }

        }

    });

    mifosX.ng.application.controller('BankController', ['$scope', '$routeParams', '$route', '$location', 'ResourceFactory', '$http', '$uibModal', 'API_VERSION', '$timeout', '$rootScope', 'Upload', mifosX.controllers.BankController]).run(function ($log) {
        $log.info("BankController initialized");
    });
}(mifosX.controllers || {}));
