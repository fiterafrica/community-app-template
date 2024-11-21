(function (module) {
    mifosX.controllers = _.extend(module, {
        AgenciesController: function (scope, resourceFactory, location) {
            scope.agencies = [];

            scope.routeTo = function (id) {
                location.path('/viewagency/' + id);
            };

            if (!scope.searchCriteria.agencies) {
                scope.searchCriteria.agencies = null;
                scope.saveSC();
            }
            scope.filterText = scope.searchCriteria.agencies || '';

            scope.onFilter = function () {
                scope.searchCriteria.agencies = scope.filterText;
                scope.saveSC();
            };

            scope.deepCopy = function (obj) {
                if (Object.prototype.toString.call(obj) === '[object Array]') {
                    var out = [], i = 0, len = obj.length;
                    for (; i < len; i++) {
                        out[i] = arguments.callee(obj[i]);
                    }
                    return out;
                }
                if (typeof obj === 'object') {
                    var out = {}, i;
                    for (i in obj) {
                        out[i] = arguments.callee(obj[i]);
                    }
                    return out;
                }
                return obj;
            }

            scope.AgenciesPerPage =15;
            resourceFactory.agencyResource.getAllAgenciesForCurrentUser(function (data) {
                scope.agencies = scope.deepCopy(data);

                function sortByParentId(a, b) {
                    return a.parentId - b.parentId;
                }

                data.sort(sortByParentId);

            });

            scope.transferAgency=function(agencyId)
            {
                location.path('/transferagency/'+ agencyId);
            }
        }
    });
    mifosX.ng.application.controller('AgenciesController', ['$scope', 'ResourceFactory', '$location', mifosX.controllers.AgenciesController]).run(function ($log) {
        $log.info("AgenciesController initialized");
    });
}(mifosX.controllers || {}));