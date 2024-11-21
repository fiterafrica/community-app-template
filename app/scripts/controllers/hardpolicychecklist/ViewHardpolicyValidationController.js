(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewHardpolicyValidationController: function (scope, routeParams, route, dateFilter, location, resourceFactory, http, $uibModal, API_VERSION, $timeout, $rootScope, Upload) {
            scope.prequalificationId = routeParams.prequalificationId;
            resourceFactory.prequalificationValidationResource.get({prequalificationId: routeParams.prequalificationId}, function (data) {
                    scope.prequalification = data.prequalification;
                    scope.members = data.members;
                    resourceFactory.prequalificationResource.get({groupId: scope.prequalificationId}, function (prequalificationData) {
                        scope.prequalificationType = prequalificationData.prequalificationType.value;
                    });
                });
              scope.checkValidationColor = function (colorName) {
                 if(colorName){
                    if('RED' === colorName.toUpperCase()){
                        return 'text-danger';
                    }else if('YELLOW' === colorName.toUpperCase()){
                         return 'text-warning';
                    }else if('GREEN' === colorName.toUpperCase()){
                        return 'text-success';
                    }else if('GREEN' === colorName.toUpperCase()){
                        return 'text-success';
                    }else if('ORANGE' === colorName.toUpperCase()){
                        return 'text-warning';
                    }else{
                        return colorName
                    }
                 }
                 return colorName;
              }

              scope.colorLabel = function (colorName) {
                 if(colorName){
                    if('RED' === colorName.toUpperCase()){
                        return 'label.color.red';
                    }else if('YELLOW' === colorName.toUpperCase()){
                         return 'label.color.yellow';
                    }else if('GREEN' === colorName.toUpperCase()){
                        return 'label.color.green';
                    }else if('ORANGE' === colorName.toUpperCase()){
                        return 'label.color.orange';
                    }else{
                        return null;
                    }
                 }
                 return null;
              }
        }
    });

    mifosX.ng.application.controller('ViewHardpolicyValidationController', ['$scope', '$routeParams', '$route', 'dateFilter', '$location', 'ResourceFactory', '$http', '$uibModal', 'API_VERSION', '$timeout', '$rootScope', 'Upload', mifosX.controllers.ViewHardpolicyValidationController]).run(function ($log) {
        $log.info("ViewHardpolicyValidationController initialized");
    });
}(mifosX.controllers || {}));
