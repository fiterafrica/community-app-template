(function (module) {
    mifosX.controllers = _.extend(module, {
        EditCommitteeController: function (scope, routeParams, route, location, resourceFactory) {
            scope.first = {};
            scope.available = [];
            scope.selected = [];
            scope.selectedUsers = [] ;
            scope.availableUsers = [];

            let requestParams = {orderBy: 'description', sortOrder: 'ASC'};
            resourceFactory.committeeTemplateResource.get(requestParams, function (data) {
                scope.committees = data.committees;
            });

            resourceFactory.committeeResource.get({committeeId: routeParams.id}, function (data) {
                scope.formData = data;
                scope.formData.id = data.id;
                scope.selectedUsers = data.selectedUsers;
                scope.availableUsers = data.availableUsers;
                scope.committeeId = data.id;
                scope.formData.users = [];
            });

            scope.addUser = function () {
                for (var i in this.available) {
                    for (var j in scope.availableUsers) {
                        if (scope.availableUsers[j].userId == this.available[i]) {
                            var temp = scope.availableUsers[j];
                            scope.selectedUsers.push(temp);
                            scope.availableUsers.splice(j, 1);
                        }
                    }
                }
                //We need to remove selected items outside above loop. If we don't remove, we can see empty item appearing
                //If we remove available items in above loop, all items will not be moved to selectedUsers
                for (var i in this.available) {
                    for (var j in scope.selectedUsers) {
                        if (scope.selectedUsers[j].userId == this.available[i]) {
                            scope.available.splice(i, 1);
                        }
                    }
                }
            };

            scope.removeUser = function () {
                for (var i in this.selected) {
                    for (var j in scope.selectedUsers) {
                        if (scope.selectedUsers[j].userId == this.selected[i]) {
                            var temp = scope.selectedUsers[j];
                            scope.availableUsers.push(temp);
                            scope.selectedUsers.splice(j, 1);
                        }
                    }
                }
                //We need to remove selected items outside above loop. If we don't remove, we can see empty item appearing
                //If we remove selected items in above loop, all items will not be moved to availableUsers
                for (var i in this.selected) {
                    for (var j in scope.availableUsers) {
                        if (scope.availableUsers[j].userId == this.selected[i]) {
                            scope.selected.splice(i, 1);
                        }
                    }
                }
            };

            scope.submit = function () {
                for (var i in scope.selectedUsers) {
                    scope.formData.users.push(scope.selectedUsers[i].userId) ;
                }
                delete scope.formData.selectedUsers;
                delete scope.formData.availableUsers;

                resourceFactory.committeeResource.update({'committeeId': scope.committeeId}, this.formData, function (data) {
                    location.path('/viewcommittee/' + data.resourceId);
                });
            };
        }
    });
    mifosX.ng.application.controller('EditCommitteeController', ['$scope', '$routeParams', '$route', '$location', 'ResourceFactory', mifosX.controllers.EditCommitteeController]).run(function ($log) {
        $log.info("EditCommitteeController initialized");
    });
}(mifosX.controllers || {}));
