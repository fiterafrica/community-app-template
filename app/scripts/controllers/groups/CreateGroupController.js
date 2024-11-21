(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateGroupController: function ($q, scope, resourceFactory, location, dateFilter, routeParams, WizardHandler) {
            scope.offices = [];
            scope.staffs = [];
            scope.data = {};
            scope.choice = 0;
            scope.first = {};
            scope.first.submitondate = new Date();
            scope.first.date = new Date();
            scope.restrictDate = new Date();
            scope.addedClients = [];
            scope.available = [];
            scope.added = [];
            scope.formData = {};
            scope.formDat = {};
            scope.formData.clientMembers = [];
            scope.forceOffice = null;
            scope.datatables = [];
            scope.noOfTabs = 1;
            scope.step = '-';
            scope.formData.datatables = [];
            scope.formDat.datatables = [];
            scope.tf = "HH:mm";
            scope.clientData = {};
            scope.prequlificationdata = {};
            scope.parentOfficesOptions = [];
            scope.responsibleUserOptions = [];
            scope.portfolioCenterOptions = [];
            let portfolioId = 0;

            var requestParams = {orderBy: 'name', sortOrder: 'ASC', staffInSelectedOfficeOnly: true};
            if (routeParams.centerId) {
                requestParams.centerId = routeParams.centerId;
            }

            resourceFactory.groupTemplateResource.get(requestParams, function (data) {
                scope.offices = data.officeOptions;
                scope.staffs = data.staffOptions;
                scope.centerOptions = data.centerOptions;

                // FB - customization for groups
                scope.parentOfficesOptions = data.parentOfficesOptions;
                scope.responsibleUserOptions = data.responsibleUserOptions;
                scope.statusOptions = data.statusOptions;
                scope.portfolioCenterOptions = data.portfolioCenterOptions;
                scope.centerGroupLocations = data.centerGroupLocations;

                scope.datatables = data.datatables;
                if (!_.isUndefined(scope.datatables) && scope.datatables.length > 0) {
                    scope.noOfTabs = scope.datatables.length + 1;
                    angular.forEach(scope.datatables, function (datatable, index) {
                        scope.updateColumnHeaders(datatable.columnHeaderData);
                        angular.forEach(datatable.columnHeaderData, function (colHeader, i) {
                            if (_.isEmpty(scope.formDat.datatables[index])) {
                                scope.formDat.datatables[index] = {data: {}};
                            }

                            if (_.isEmpty(scope.formData.datatables[index])) {
                                scope.formData.datatables[index] = {
                                    registeredTableName: datatable.registeredTableName,
                                    data: {locale: scope.optlang.code}
                                };
                            }

                            if (datatable.columnHeaderData[i].columnDisplayType == 'DATETIME') {
                                scope.formDat.datatables[index].data[datatable.columnHeaderData[i].columnName] = {};
                            }
                        });
                    });
                }

                if(routeParams.officeId) {
                    scope.formData.officeId = routeParams.officeId;
                    for(var i in data.officeOptions) {
                        if(data.officeOptions[i].id == routeParams.officeId) {
                            scope.forceOffice = data.officeOptions[i];
                            break;
                        }
                    }
                }
                if(routeParams.groupId) {
                    if(typeof data.staffId !== "undefined") {
                        scope.formData.staffId = data.staffId;
                    }
                }

            });

            resourceFactory.configurationResourceByName.get({configName:'meeting-default-duration'}, function (data){
                scope.defaultMeetingPeriod = data.value;
            });

            resourceFactory.configurationResourceByName.get({configName:'time-between-meetings'}, function (data){
                scope.timePeriodBetweenMeeting = data.value;
            });

            scope.startTimeChanged = function(){
                // Perform any additional logic or actions here
                if(scope.formData.meetingStartTime != null
                    && scope.formData.meetingStartTime != undefined
                    && scope.formData.meetingStartTime != ""){

                    var meetingEndTime = new Date(scope.formData.meetingStartTime);
                    var hours = meetingEndTime.getHours();
                    var minutesToAdd = meetingEndTime.getMinutes() + scope.defaultMeetingPeriod + scope.timePeriodBetweenMeeting;
                    var newTime = new Date(meetingEndTime.getFullYear(), meetingEndTime.getMonth(), meetingEndTime.getDate(), hours, minutesToAdd);
                    scope.formData.meetingEndTime = newTime;
                }
            }

            scope.updateColumnHeaders = function(columnHeaderData) {
                var colName = columnHeaderData[0].columnName;
                if (colName == 'id') {
                    columnHeaderData.splice(0, 1);
                }

                colName = columnHeaderData[0].columnName;
                if (colName == 'client_id' || colName == 'office_id' || colName == 'group_id' || colName == 'center_id' || colName == 'loan_id' || colName == 'savings_account_id') {
                    columnHeaderData.splice(0, 1);
                }
            };


            scope.clientOptions = function(value){
                var deferred = $q.defer();
                resourceFactory.clientResource.getAllClientsWithoutLimit({displayName: value, orderBy : 'displayName', officeId : scope.formData.officeId,
                    sortOrder : 'ASC', orphansOnly : true}, function (data) {
                    deferred.resolve(data.pageItems);
                });
                return deferred.promise;
            };
            scope.prequalificationOption = function(value){
                var deferred = $q.defer();

                resourceFactory.prequalificationResource.getAllGroups({
                    type: 'checked',
                    portfolioCenterId: scope.formData.centerId,
                    searchText:value
                }, function (data) {
                    console.log("prequal data: "+ JSON.stringify(data));
                    deferred.resolve(data.pageItems);
                });
                return deferred.promise;
            };

            scope.viewClient = function (item) {
                scope.client = item;
            };
            scope.viewPrequal = function (item) {
                scope.prequalification = item;
            };

            scope.add = function () {
                if(scope.clientData.available != ""){
                    var temp = {};
                    temp.id = scope.clientData.available.id;
                    temp.displayName = scope.clientData.available.displayName;
                    scope.addedClients.push(temp);
                }
            };
            scope.sub = function (id) {
                for (var i = 0; i < scope.addedClients.length; i++) {
                    if (scope.addedClients[i].id == id) {
                        scope.addedClients.splice(i, 1);
                        break;
                    }
                }
            };
            scope.changeOffice = function (officeId) {
                scope.addedClients = [];
                scope.clientData.available = [];
                resourceFactory.groupTemplateResource.get({staffInSelectedOfficeOnly: false, officeId: officeId,staffInSelectedOfficeOnly:true
                }, function (data) {
                    scope.staffs = data.staffOptions;
                });
            };
            scope.setChoice = function () {
                if (this.formData.active) {
                    scope.choice = 1;
                }
                else if (!this.formData.active) {
                    scope.choice = 0;
                }
            };

            if(routeParams.centerId) {
                scope.cancel = '#/viewcenter/' + routeParams.centerId
                scope.centerid = routeParams.centerId;
            }else {
                scope.cancel = "#/groups"
            }

            //return input type
            scope.fieldType = function (type) {
                var fieldType = "";
                if (type) {
                    if (type == 'CODELOOKUP' || type == 'CODEVALUE') {
                        fieldType = 'SELECT';
                    } else if (type == 'DATE') {
                        fieldType = 'DATE';
                    } else if (type == 'DATETIME') {
                        fieldType = 'DATETIME';
                    } else if (type == 'BOOLEAN') {
                        fieldType = 'BOOLEAN';
                    } else {
                        fieldType = 'TEXT';
                    }
                }
                return fieldType;
            };

            scope.submit = function () {
                // if (WizardHandler.wizard().getCurrentStep() != scope.noOfTabs) {
                //     WizardHandler.wizard().next();
                //     return;
                // }

                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;

                // remove extra fields from form data
                delete this.formData.parentName;
                delete this.formData.status;
                delete this.formData.responsibleUserName;
                delete this.formData.portfolioId;

                if (scope.formData.formationDate) {
                    this.formData.formationDate = dateFilter(scope.formData.formationDate, scope.df);
                }

                if (scope.formData.meetingStartTime) {
                    this.formData.meetingStartTime = dateFilter(scope.formData.meetingStartTime, scope.tf);
                }
                if (scope.formData.meetingEndTime) {
                    this.formData.meetingEndTime = dateFilter(scope.formData.meetingEndTime, scope.tf);
                }

                for (var i in scope.addedClients) {
                    scope.formData.clientMembers[i] = scope.addedClients[i].id;
                }
                if (this.formData.active) {
                    this.formData.activationDate = dateFilter(scope.first.date, scope.df);
                }
                if (routeParams.centerId) {
                    this.formData.centerId = routeParams.centerId;
                }
                if (routeParams.officeId) {
                    this.formData.officeId = routeParams.officeId;
                }
                if (scope.first.submitondate) {
                    this.formData.submittedOnDate = dateFilter(scope.first.submitondate, scope.df);
                }
                if (scope.prequalification) {
                    this.formData.prequalificationId = scope.prequalification.id;
                }

                this.formData.active = this.formData.active || false;
                if (!_.isUndefined(scope.datatables) && scope.datatables.length > 0) {
                    angular.forEach(scope.datatables, function (datatable, index) {
                        scope.columnHeaders = datatable.columnHeaderData;
                        angular.forEach(scope.columnHeaders, function (colHeader, i) {
                            scope.dateFormat = scope.df + " " + scope.tf
                            if (scope.columnHeaders[i].columnDisplayType == 'DATE') {
                                if (!_.isUndefined(scope.formDat.datatables[index].data[scope.columnHeaders[i].columnName])) {
                                    scope.formData.datatables[index].data[scope.columnHeaders[i].columnName] = dateFilter(scope.formDat.datatables[index].data[scope.columnHeaders[i].columnName],
                                        scope.dateFormat);
                                    scope.formData.datatables[index].data.dateFormat = scope.dateFormat;
                                }
                            } else if (scope.columnHeaders[i].columnDisplayType == 'DATETIME') {
                                if (!_.isUndefined(scope.formDat.datatables[index].data[scope.columnHeaders[i].columnName].date) && !_.isUndefined(scope.formDat.datatables[index].data[scope.columnHeaders[i].columnName].time)) {
                                    scope.formData.datatables[index].data[scope.columnHeaders[i].columnName] = dateFilter(scope.formDat.datatables[index].data[scope.columnHeaders[i].columnName].date, scope.df)
                                        + " " + dateFilter(scope.formDat.datatables[index].data[scope.columnHeaders[i].columnName].time, scope.tf);
                                    scope.formData.datatables[index].data.dateFormat = scope.dateFormat;
                                }
                            }
                        });
                    });
                } else {
                    delete scope.formData.datatables;
                }
                resourceFactory.groupResource.save(this.formData, function (data) {
                    location.path('/viewgroup/' + data.resourceId);
                });
            };
        }
    });
    mifosX.ng.application.controller('CreateGroupController', ['$q', '$scope', 'ResourceFactory', '$location', 'dateFilter', '$routeParams', 'WizardHandler', mifosX.controllers.CreateGroupController]).run(function ($log) {
        $log.info("CreateGroupController initialized");
    });
}(mifosX.controllers || {}));
