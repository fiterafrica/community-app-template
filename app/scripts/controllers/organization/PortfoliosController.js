(function (module) {
    mifosX.controllers = _.extend(module, {
        PortfoliosController: function (scope, resourceFactory, location) {
            scope.agencies = [];

            scope.routeTo = function (id) {
                location.path('/viewportfolio/' + id);
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

            scope.PortfoliosPerPage =15;
            resourceFactory.portfolioResource.getAllPortfoliosForCurrentUser(function (data) {
                scope.portfolios = scope.deepCopy(data);

                function sortByParentId(a, b) {
                    return a.parentId - b.parentId;
                }

                data.sort(sortByParentId);

            });

            scope.searchByName = function () {
                const params = {
                    name: this.searchText,
                };
                resourceFactory.portfolioResource.getAllPortfoliosForCurrentUser(params, function (data) {
                    scope.portfolios = scope.deepCopy(data);
                    function sortByParentId(a, b) {
                        return a.parentId - b.parentId;
                    }
                    data.sort(sortByParentId);
                });
            }

        }
    });
    mifosX.ng.application.controller('PortfoliosController', ['$scope', 'ResourceFactory', '$location', mifosX.controllers.PortfoliosController]).run(function ($log) {
        $log.info("PortfoliosController initialized");
    });
}(mifosX.controllers || {}));