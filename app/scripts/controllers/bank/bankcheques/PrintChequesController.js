(function (module) {
    mifosX.controllers = _.extend(module, {
        PrintChequesController: function (scope, routeParams, route, location, resourceFactory, http, $uibModal, dateFilter, API_VERSION, $sce, $rootScope) {

             scope.bankAccountOptions = [];
             resourceFactory.chequeBatchTemplateResource.get({}, function (data) {
                 scope.statusOptions = data.statusOptions;
                 scope.agencyOptions = data.agencyOptions;
                 scope.facilitatorOptions = data.facilitatorOptions;
                 scope.centerOptions = data.centerOptions;
                 scope.allGroupOptions = data.groupOptions;
                 scope.groupOptions = data.groupOptions;
                 scope.allCenterGroupOptions = data.groupOptions;
             });

            scope.filterGroups = function () {
                if (this.formData.centerId){
                    scope.groupOptions = [];
                    for (var i in scope.allGroupOptions) {
                        if (scope.allGroupOptions[i].centerId == scope.formData.centerId) {
                            scope.groupOptions.push(scope.allGroupOptions[i]);
                        }
                    }
                }else {
                    scope.groupOptions = scope.allGroupOptions;
                }

            }
             resourceFactory.bankAccountResource.getAllBankAccounts({}, function (data) {
                 scope.totalBankAccounts = data.totalFilteredRecords;
                 scope.bankAccountOptions = data.pageItems;
                 for (var i = 0; i < scope.bankAccountOptions.length; i++ ){
                     var accountName = scope.bankAccountOptions[i].accountNumber + ' - ' + scope.bankAccountOptions[i].agency.name;
                     scope.bankAccountOptions[i].accountName = accountName;
                 }

             });

            scope.cheques = [];
            scope.formData = {};
            scope.chequesPerPage = 100;
            scope.formData.status = 7;
            scope.isAllChequesSelected = false;
            scope.isCollapsed = false;
            scope.getResultsPage = function (pageNumber) {
               resourceFactory.searchChequeResource.get({
                    offset: ((pageNumber - 1) * scope.chequesPerPage),
                    limit: scope.chequesPerPage,
                    orderBy: 'chequeNo',
                    sortOrder: 'ASC',
                    bankAccId: scope.formData.bankAccId,
                    chequeNo: scope.formData.chequeNo,
                    agencyId: scope.formData.agencyId,
                    status: scope.formData.status,
                    to: scope.formData.to,
                    from: scope.formData.from,
                    centerId: scope.formData.centerId,
                    groupId: scope.formData.groupId,
                    facilitatorId: scope.formData.facilitatorId
                }, function (data) {
                    scope.totalCheques = data.totalFilteredRecords;
                    scope.cheques = data.pageItems;
                    scope.isAllChequesSelected = false;
               });
            }

            scope.search = function () {
                 scope.getResultsPage(1);
                 scope.isCollapsed = true;
            }

            scope.selectAllCheques = function(){
                for (var i = 0; i < scope.cheques.length; i++ ){
                     scope.cheques[i].isSelected = scope.isAllChequesSelected;
                }
            }

            scope.isExportBtnDisabled = function(){
              var ret = true;
              for (var i = 0; i < scope.cheques.length; i++ ){
                   if(scope.cheques[i].isSelected){
                      ret = false;
                      break;
                   }
               }
               return ret;
            }

            scope.processCsvData = function () {
              var selectedCheques = [];
                for(var i = 0; i < scope.cheques.length; i++){
                  if(scope.cheques[i].isSelected){
                      let cheque = {
                          chequeNo: scope.cheques[i].chequeNo,
                          clientName: scope.cheques[i].clientName,
                          chequeAmount: scope.cheques[i].chequeAmount
                      }
                     selectedCheques.push(cheque);
                  }
               }
              var csvData = [];
              for (let i = 0; i < selectedCheques.length; i++) {
                 var row = [selectedCheques[i].chequeNo, selectedCheques[i].clientName, selectedCheques[i].chequeAmount];
                 csvData.push(row);
              }
              var date = new Date();
              var year = date.getFullYear();
              var month = date.getMonth() + 1;
              var day = date.getDate();
              var hours = date.getHours();
              var minutes = date.getMinutes();
              var seconds = date.getSeconds();
              var fileName = 'cheques_' + [year, month.toString().padStart(2, '0'), day.toString().padStart(2, '0'), hours.toString().padStart(2, '0'), minutes.toString().padStart(2, '0'), seconds.toString().padStart(2, '0')].join('-');
              scope.fileName = fileName;
             return csvData;
            };

             scope.issueCheques = function () {
               var selectedCheques = [];
               for(var i = 0; i < scope.cheques.length; i++){
                   if(scope.cheques[i].isSelected){
                       var selectedCheque = {
                          chequeId: scope.cheques[i].id
                       }
                      selectedCheques.push(selectedCheque);
                   }
               }
               var request = {
                  locale: scope.optlang.code,
                  selectedCheques: selectedCheques,
                  actualDisbursementDate: dateFilter(new Date(Date.now()),  scope.df),
                  dateFormat: scope.df
                }
                resourceFactory.chequeBatchResource.printCheques({ commandParam: 'printCheques'}, request, function (data) {
                    scope.printPentahoBankCheques(selectedCheques);
                });
             };

           scope.reloadPage = function(){
                route.reload();
           }

           scope.$watch('formData.bankAccId',function(){
            delete scope.formData.agencyName;
            delete  scope.formData.bankName;
            for (var i = 0; i < scope.bankAccountOptions.length; i++ ){
                if(scope.bankAccountOptions[i].id === scope.formData.bankAccId){
                    scope.formData.agencyName = scope.bankAccountOptions[i].agency.name;
                    scope.formData.bankName = scope.bankAccountOptions[i].bank.name;
                }
             }
           });

           scope.$watch('formData.centerId',function(){
               var selectedCenterGroupOptions = [];
               if(scope.formData.centerId){
                   var centerGroupOptions = [];
                   for (var i = 0; i < scope.groupOptions.length; i++ ){
                        selectedCenterGroupOptions.push(scope.groupOptions[i]);
                    }
                   scope.groupOptions = selectedCenterGroupOptions;
               } else {
                   scope.groupOptions = scope.allCenterGroupOptions;
               }
            });

            scope.printPentahoBankCheques = function (selectedCheques) {
                  var paramValue = ',';
                  for (var i = 0; i < selectedCheques.length; i++ ){
                     paramValue = paramValue + selectedCheques[i].chequeId + ',';
                  }
                  scope.report = true;
                  scope.formData.outputType = 'PDF';
                  var reportURL = $rootScope.hostUrl + API_VERSION + "/runreports/" + encodeURIComponent("Print Bank Cheque");
                  reportURL += "?output-type=" + encodeURIComponent(scope.formData.outputType) + "&tenantIdentifier=" + $rootScope.tenantIdentifier+"&locale="+scope.optlang.code;
                  var reportParams = "";
                  var paramName = "R_selectedCheques";
                  reportParams += encodeURIComponent(paramName) + "=" + encodeURIComponent(paramValue);
                  if (reportParams > "") {
                      reportURL += "&" + reportParams;
                  }
                  reportURL = $sce.trustAsResourceUrl(reportURL);
                  reportURL = $sce.valueOf(reportURL);
                  http.get(reportURL, {responseType: 'arraybuffer'})
                    .then(function(response) {
                        let data = response.data;
                        let status = response.status;
                        let headers = response.headers;
                        let config = response.config;
                        var contentType = headers('Content-Type');
                        var file = new Blob([data], {type: contentType});
                        var fileContent = URL.createObjectURL(file);
                        scope.reportURL = $sce.trustAsResourceUrl(fileContent);
                    }).catch(function(error){
                      console.log(JSON.stringify(error))
                        $log.error(`Error loading ${scope.reportType} report`);
                        $log.error(error);
                    });
              };

        }
    });

    mifosX.ng.application.controller('PrintChequesController', ['$scope', '$routeParams', '$route', '$location', 'ResourceFactory', '$http', '$uibModal', 'dateFilter', 'API_VERSION', '$sce', '$rootScope', mifosX.controllers.PrintChequesController]).run(function ($log) {
        $log.info("PrintChequesController initialized");
    });
}(mifosX.controllers || {}));
