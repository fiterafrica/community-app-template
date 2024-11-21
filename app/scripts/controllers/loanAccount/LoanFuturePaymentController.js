(function (module) {
    mifosX.controllers = _.extend(module, {
        LoanFuturePaymentController: function (scope, routeParams, resourceFactory, location, route, http, $uibModal, dateFilter, $filter) {
            scope.accountId = routeParams.id;
            scope.formData = {};
            scope.formData.loanId = scope.accountId;
            scope.taskTypeName = 'Future Payment';
            scope.subTaskTypeName = 'Futurepayment';
            scope.formData.paymentDate = new Date();
            scope.formData.paymentType = 'partial';
            scope.restrictDate = new Date();

            resourceFactory.LoanAccountResource.getLoanAccountDetails({loanId: routeParams.id, associations: 'all'}, function (data) {
                scope.loandetails = data;
                scope.restrictDate = new Date(data.timeline.expectedMaturityDate);
            });

            scope.simulatePayment = function() {
                resourceFactory.loanTrxnsSimulatePaymentResource.get({
                    loanId: routeParams.id,
                    command: 'futurepayment',
                    paymentDate: dateFilter(this.formData.paymentDate, scope.df),
                    paymentType: this.formData.paymentType,
                    dateFormat: scope.df,
                    locale: scope.optlang.code
                }, function (data) {
                    scope.simulationPaymentData = data;
                });
            }

            scope.cancel = function () {
                location.path('/viewloanaccount/' + scope.accountId);
            };
        }
    });
    mifosX.ng.application.controller('LoanFuturePaymentController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$route', '$http', '$uibModal', 'dateFilter','$filter', mifosX.controllers.LoanFuturePaymentController]).run(function ($log) {
        $log.info("LoanFuturePaymentController initialized");
    });
}(mifosX.controllers || {}));