(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewPortfolioPlanningController: function (scope, routeParams, route, location, resourceFactory, dateFilter) {
            scope.centers=[];
            var date = new Date();
            scope.csvData = [];
            scope.fromDate = new Date();
            scope.toDate = date.setMonth(date.getMonth() + 1);

            scope.convertTimeArrayToObject = function(timeFieldName){
                var date = new Date();
                for(var i in scope.detailedPlanningData){
                    scope.detailedPlanningData[i][timeFieldName] =  new Date(date.getFullYear(), date.getMonth(), date.getDay(), scope.detailedPlanningData[i][timeFieldName][0], scope.detailedPlanningData[i][timeFieldName][1], 0);
                }
            };

            scope.addMonths = function (date, months) {
                date.setMonth(date.getMonth() + months);

                return date;
            };

            scope.retrievePlanning = function () {
                var reqFirstDate = dateFilter(scope.fromDate, scope.df);
                var reqSecondDate = dateFilter(scope.toDate, scope.df);
                var params = {};
                params.locale = scope.optlang.code;
                params.dateFormat = scope.df;
                params.portfolioId = routeParams.id;

                if (scope.fromDate) {
                    params.fromDate = reqFirstDate;
                };

                if (scope.toDate) {
                    params.toDate = reqSecondDate;
                };

                resourceFactory.portfolioPlanningResource.get(params, function (data) {
                    scope.portfolio = data;

                    // centers associated with this portfolio
                    if (data.detailedPlanningData) {
                        scope.detailedPlanningData = data.detailedPlanningData;
                        scope.convertTimeArrayToObject('meetingStartTime');
                        scope.convertTimeArrayToObject('meetingEndTime');

                        scope.csvData = [];
                        scope.row = ['Fecha', 'Día', 'Hora', 'Centro', 'Nro. Grupo', 'Grupo', 'Categoría', 'Tipo',
                            'A Cobrar', 'Mora', 'Clientes'];
                        scope.csvData.push(scope.row);
                        for (var i in scope.detailedPlanningData) {
                            // push each row of planning into the array for csv data
                            var planningType = scope.detailedPlanningData[i].planningType === 'planning.type.individual' ? 'Individual' : 'Grupo';
                            scope.row = [dateFilter(scope.detailedPlanningData[i].meetingDate, 'dd MMM yyyy'),
                                scope.detailedPlanningData[i].meetingDayName,
                                dateFilter(scope.detailedPlanningData[i].meetingStartTime, 'HH:mm'),
                                scope.detailedPlanningData[i].portfolioCenterName, scope.detailedPlanningData[i].centerGroupId,
                                scope.detailedPlanningData[i].centerGroupName, planningType, 'Cobro',
                                scope.detailedPlanningData[i].totalRepayment, scope.detailedPlanningData[i].totalOverdue,
                                scope.detailedPlanningData[i].numberOfClients];
                            scope.csvData.push(scope.row);
                        }
                    }
                });
            };

            scope.retrievePlanning();
        }

    });
    mifosX.ng.application.controller('ViewPortfolioPlanningController', ['$scope', '$routeParams', '$route', '$location', 'ResourceFactory', 'dateFilter', mifosX.controllers.ViewPortfolioPlanningController]).run(function ($log) {
        $log.info("ViewPortfolioPlanningController initialized");
    });
}(mifosX.controllers || {}));