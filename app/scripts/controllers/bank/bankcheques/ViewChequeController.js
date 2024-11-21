(function (module) {
    mifosX.controllers = _.extend(module, {

        ViewChequeController: function (scope, routeParams, route, location, resourceFactory,dateFilter, http, $uibModal, API_VERSION, $sce, $timeout, $rootScope, Upload) {
            scope.batchId = routeParams.batchId;
            scope.chequeId = routeParams.chequeId;
            scope.chequeData = {};
            scope.showVoidButton = false;
            scope.showPrintButton = false;
            scope.showReassignButton = false;
            scope.showAuthorizeVoidanceButton = false;
            scope.showApproveIssuanceButton = false;
            scope.showIssueButton = false;
            resourceFactory.searchChequeResource.get({
                batchId: scope.batchId,
                chequeId: scope.chequeId
            }, function (data) {
                if (data.pageItems.length > 0) {
                    scope.chequeData = data.pageItems[0];
                    var status = scope.chequeData.status.id;
                    switch (status) {
                        case 1:
                            scope.showVoidButton = true;
                            break;
                        case 2:
                            scope.showReassignButton = true;
                            break;
                        case 3:
                            break;
                        case 4:
                            scope.showAuthorizeVoidanceButton = true;
                            break;
                        case 5:
                            scope.showApproveIssuanceButton = true;
                            break;
                        case 6:
                            scope.showAuthorizeIssuanceButton = true;
                            break;
                        case 7:
                            scope.showPrintButton = true;
                            break;
                        default:
                    }
                }
            });
            scope.authorizeVoidance = function () {
                resourceFactory.chequeBatchResource.authorizeVoidance({chequeId: scope.chequeId}, function (data) {
                    location.path('/viewchequebatch/' + scope.batchId);
                });
            }

            scope.reloadPage = function(){
                route.reload();
            }

            scope.printCheque = function () {

                var request = {
                    locale: scope.optlang.code,
                    selectedCheques: [{chequeId: scope.chequeData.id}],
                    actualDisbursementDate: dateFilter(new Date(Date.now()), scope.df),
                    dateFormat: scope.df
                }
                resourceFactory.chequeBatchResource.printCheques({commandParam: 'printCheques'}, request, function (data) {
                    console.log("goig to print cheque- " + scope.chequeData.id);
                    var paramValue = ',';
                    paramValue = paramValue + scope.chequeData.id + paramValue;
                    scope.report = true;
                    var outputType = 'PDF';
                    var reportURL = $rootScope.hostUrl + API_VERSION + "/runreports/" + encodeURIComponent("Print Bank Cheque");
                    reportURL += "?output-type=" + encodeURIComponent(outputType) + "&tenantIdentifier=" + $rootScope.tenantIdentifier + "&locale=" + scope.optlang.code;

                    var reportParams = "";
                    var paramName = "R_selectedCheques";
                    reportParams += encodeURIComponent(paramName) + "=" + encodeURIComponent(paramValue);
                    if (reportParams > "") {
                        reportURL += "&" + reportParams;
                    }
                    console.log("reportURL: \n\n" + reportURL);
                    reportURL = $sce.trustAsResourceUrl(reportURL);
                    reportURL = $sce.valueOf(reportURL);
                    http.get(reportURL, {responseType: 'arraybuffer'})
                        .then(function (response) {
                            let data = response.data;
                            let status = response.status;
                            let headers = response.headers;
                            let config = response.config;
                            var contentType = headers('Content-Type');
                            var file = new Blob([data], {type: contentType});
                            var fileContent = URL.createObjectURL(file);
                            scope.reportURL = $sce.trustAsResourceUrl(fileContent);
                        }).catch(function (error) {
                        $log.error(`Error loading ${scope.reportType} report`);
                        $log.error(error);
                    });
                });
            }

        }
    });

    mifosX.ng.application.controller('ViewChequeController', ['$scope', '$routeParams', '$route', '$location', 'ResourceFactory','dateFilter', '$http', '$uibModal', 'API_VERSION', '$sce', '$timeout', '$rootScope', 'Upload', mifosX.controllers.ViewChequeController]).run(function ($log) {
        $log.info("ViewChequeController initialized");
    });
}(mifosX.controllers || {}));
