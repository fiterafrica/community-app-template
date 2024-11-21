(function (module) {
    mifosX.controllers = _.extend(module, {
        CommitteesController: function (scope, resourceFactory, location) {
            scope.agencies = [];

            scope.routeTo = function (id) {
                location.path('/viewcommittee/' + id);
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

            scope.CommitteesPerPage =15;
            resourceFactory.committeeResource.getAllCommitteesForCurrentUser(function (data) {
                scope.committees = data.pageItems;
            });
        }
    });
    mifosX.ng.application.controller('CommitteesController', ['$scope', 'ResourceFactory', '$location', mifosX.controllers.CommitteesController]).run(function ($log) {
        $log.info("CommitteesController initialized");
    });
}(mifosX.controllers || {}));