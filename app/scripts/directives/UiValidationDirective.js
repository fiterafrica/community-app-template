(function (module) {
    mifosX.directives = _.extend(module, {
        UiValidationDirective: function ($compile) {
            return {
                restrict: 'E',
                require: '?ngmodel',
                link: function (scope, elm, attr, ctrl) {
                    var template = '<div uib-alert type="danger" ng-show="uiValidationErrors.length > 0">' +
                        '<div ng-repeat="error in uiValidationErrors">' +
                            '<label>' +
                                '{{error.message | translate}}' +
                            '</label>' +
                        '</div></div>';
                    elm.html('').append($compile(template)(scope));
                }
            };
        }
    });
}(mifosX.directives || {}));

mifosX.ng.application.directive("uiValidate", ['$compile', mifosX.directives.UiValidationDirective]).run(function ($log) {
    $log.info("UiValidationDirective initialized");
});