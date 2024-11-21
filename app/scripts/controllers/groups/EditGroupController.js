(function (module) {
    mifosX.controllers = _.extend(module, {
        EditGroupController: function (scope, resourceFactory, location, routeParams, dateFilter, WizardHandler,$q) {
            scope.first = {};
            scope.managecode = routeParams.managecode;
            scope.restrictDate = new Date();
            scope.entityformData = {};
            scope.entityformData.datatables={};
            scope.prequlificationdata = {};
            scope.submittedDatatables = [];
            var submitStatus = [];
            scope.parentOfficesOptions = [];
            scope.responsibleUserOptions = [];
            scope.portfolioCenterOptions = [];
            scope.tf = "HH:mm";
            scope.available = [];

            scope.RequestEntities = function(entity,status){
                resourceFactory.entityDatatableChecksResource.getAll({limit:-1},function (response) {
                    scope.entityDatatableChecks = _.filter(response.pageItems , function(datatable){
                        var AllTables = (datatable.entity == entity && datatable.status.value == status);
                        return AllTables;
                    });
                    scope.entityDatatableChecks = _.pluck(scope.entityDatatableChecks,'datatableName');
                    scope.datatables = [];
                    var k=0;
                    _.each(scope.entityDatatableChecks,function(entitytable) {
                        resourceFactory.DataTablesResource.getTableDetails({datatablename:entitytable,entityId: routeParams.id, genericResultSet: 'true'}, function (data) {
                            data.registeredTableName = entitytable;
                            var colName = data.columnHeaders[0].columnName;
                            if (colName == 'id') {
                                data.columnHeaders.splice(0, 1);
                            }

                            colName = data.columnHeaders[0].columnName;
                            if (colName == 'client_id' || colName == 'office_id' || colName == 'group_id' || colName == 'center_id' || colName == 'loan_id' || colName == 'savings_account_id') {
                                data.columnHeaders.splice(0, 1);
                                scope.isCenter = (colName == 'center_id') ? true : false;
                            }

                            data.noData = (data.data.length == 0);
                            if(data.noData){
                                scope.datatables.push(data);
                                scope.entityformData.datatables[k] = {data:{}};
                                submitStatus[k] = "save";
                                _.each(data.columnHeaders,function(Header){
                                    scope.entityformData.datatables[k].data[Header.columnName] = "";
                                });
                                k++;
                                scope.isEntityDatatables = true;
                            }
                        });
                    });
                });

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
                        var minMinutesToAdd = meetingEndTime.getMinutes() + 1;
                        scope.minMeetingEndTime = new Date(meetingEndTime.getFullYear(), meetingEndTime.getMonth(), meetingEndTime.getDate(), hours, minMinutesToAdd);
                        var newTime = new Date(meetingEndTime.getFullYear(), meetingEndTime.getMonth(), meetingEndTime.getDate(), hours, minutesToAdd);
                        scope.formData.meetingEndTime = newTime;
                    }
                }
            };

            function asyncLoop(iterations, func, callback) {
                var index = 0;
                var done = false;
                var loop = {
                    next: function() {
                        if (done) {
                            return;
                        }

                        if (index < iterations) {
                            index++;
                            func(loop);

                        } else {
                            done = true;
                            callback();
                        }
                    },

                    iteration: function() {
                        return index - 1;
                    },

                    break: function() {
                        done = true;
                    }
                };
                loop.next();
                return loop;
            }

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

            scope.RequestEntities('m_group','ACTIVATE');

            resourceFactory.groupResource.get({groupId: routeParams.id, associations: 'clientMembers', template: 'true',staffInSelectedOfficeOnly:true}, function (data) {
                scope.editGroup = data;
                scope.formData = {
                    name: data.name,
                    externalId: data.externalId,
                    staffId: data.staffId,
                    portfolioCenterId: data.portfolioCenterId,
                    legacyNumber: data.legacyNumber>0?data.legacyNumber:null,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    size: data.size,
                    responsibleUserId: data.responsibleUserId,
                    centerId: data.centerId
                };
                if(data.groupLocation) {
                    scope.formData.groupLocation = data.groupLocation.id;
                }
                if (data.activationDate) {
                    var actDate = dateFilter(data.activationDate, scope.df);
                    scope.first.date = new Date(actDate);
                }
                if (data.formationDate) {
                    let formationDate = dateFilter(data.formationDate, scope.df);
                    scope.formData.formationDate = new Date(formationDate);
                }

                var date = new Date();
                if (data.meetingStartTime) {
                    scope.formData.meetingStartTime = new Date(date.getFullYear(), date.getMonth(), date.getDay(), data.meetingStartTime[0], data.meetingStartTime[1], 0);
                }

                if (data.meetingEndTime) {
                    scope.formData.meetingEndTime = new Date(date.getFullYear(), date.getMonth(), date.getDay(), data.meetingEndTime[0], data.meetingEndTime[1], 0);
                }
            });

            resourceFactory.groupResource.get({groupId: routeParams.id}, function (data) {
                if (data.timeline.submittedOnDate) {
                    scope.mindate = new Date(data.timeline.submittedOnDate);
                    scope.first.submitondate = new Date(dateFilter(data.timeline.submittedOnDate, scope.df));
                }
            });

            scope.updateGroup = function () {
                this.formData.submittedOnDate = dateFilter(scope.first.submitondate, scope.df);
                this.formData.activationDate = dateFilter(scope.first.date, scope.df);
                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;
                this.formData.timeFormat = scope.tf;

                this.formData.formationDate = dateFilter(scope.formData.formationDate, scope.df);

                if (scope.formData.meetingStartTime) {
                    this.formData.meetingStartTime = dateFilter(scope.formData.meetingStartTime, scope.tf);
                }
                if (scope.formData.meetingEndTime) {
                    this.formData.meetingEndTime = dateFilter(scope.formData.meetingEndTime, scope.tf);
                }

                if (scope.prequalification) {
                    this.formData.prequalificationId = scope.prequalification.id;
                }

                resourceFactory.groupResource.update({groupId: routeParams.id}, this.formData, function (data) {
                    location.path('/viewgroup/' + routeParams.id);
                });
            };

            scope.prequalificationOption = function(value){
                var deferred = $q.defer();

                resourceFactory.prequalificationResource.getAllGroups({
                    type: 'checked',
                    portfolioCenterId:scope.formData.portfolioCenterId,
                    searchText:value
                }, function (data) {
                    console.log("prequal data: "+ JSON.stringify(data));
                    deferred.resolve(data.pageItems);
                });
                return deferred.promise;
            };

            scope.viewPrequal = function (item) {
                scope.prequalification = item;
            };

            scope.submitDatatable = function(){
                if(scope.datatables) {
                    asyncLoop(Object.keys(scope.entityformData.datatables).length,function(loop){
                        var cnt = loop.iteration();
                        var formData = scope.entityformData.datatables[cnt];
                        formData.registeredTableName = scope.datatables[cnt].registeredTableName;

                        var params = {
                            datatablename: formData.registeredTableName,
                            entityId: routeParams.id,
                            genericResultSet: 'true'
                        };

                        angular.extend(formData.data,{dateFormat: scope.df, locale: scope.optlang.code});

                        _.each(formData.data, function (columnHeader) {
                            if (columnHeader.dateType) {
                                columnHeader = dateFilter(columnHeader.dateType.date, params.dateFormat);
                            }
                            else if (columnHeader.dateTimeType) {
                                columnHeader = dateFilter(columnHeader.columnName.date, scope.df) + " " + dateFilter(columnHeader.columnName.time, scope.tf);
                            }
                        });

                        var action = submitStatus[cnt];
                        resourceFactory.DataTablesResource[action](params, formData.data, function (data) {

                            submitStatus[cnt] = "update";
                            scope.submittedDatatables.push(scope.datatables[cnt].registeredTableName);
                            loop.next();

                        },function(){
                            rootScope.errorDetails[0].push({datatable:scope.datatables[cnt].registeredTableName});
                            loop.break();
                        });

                    },function(){
                        scope.activate();
                    });
                }
                else{
                    scope.activate();
                }
            };

            scope.activate = function () {
                var reqDate = dateFilter(scope.first.date, scope.df);
                var newActivation = new Object();
                newActivation.activationDate = reqDate;
                newActivation.locale = scope.optlang.code;
                newActivation.dateFormat = scope.df;
                resourceFactory.groupResource.save({groupId: routeParams.id, command: 'activate'}, newActivation, function (data) {
                    location.path('/viewgroup/' + routeParams.id);
                });
            };
        }
    });
    mifosX.ng.application.controller('EditGroupController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter','WizardHandler','$q', mifosX.controllers.EditGroupController]).run(function ($log) {
        $log.info("EditGroupController initialized");
    });
}(mifosX.controllers || {}));

