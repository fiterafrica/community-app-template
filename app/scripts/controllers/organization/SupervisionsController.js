(function (module) {
    mifosX.controllers = _.extend(module, {
        SupervisionsController: function (scope, resourceFactory, location) {
            scope.agencies = [];

            scope.routeTo = function (id) {
                location.path('/viewsupervision/' + id);
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

            scope.SupervisionsPerPage =15;
            resourceFactory.supervisionResource.getAllSupervisionsForCurrentUser(function (data) {
                scope.supervisions = scope.deepCopy(data);

                function sortByParentId(a, b) {
                    return a.parentId - b.parentId;
                }

                data.sort(sortByParentId);

            });
        }
    });
    mifosX.ng.application.controller('SupervisionsController', ['$scope', 'ResourceFactory', '$location', mifosX.controllers.SupervisionsController]).run(function ($log) {
        $log.info("SupervisionsController initialized");
    });
}(mifosX.controllers || {}));