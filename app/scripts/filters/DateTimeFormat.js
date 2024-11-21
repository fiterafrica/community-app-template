(function (module) {
    mifosX.filters = _.extend(module, {
        DateTimeFormat: function (dateFilter, localStorageService) {
            return function (input) {
                if (input) {
                    // SAFARI is Bad We fix it Issue #3196
                    // This fix affected transaction
                    //remove = input.toString().split(",");
                    //var tDate = new Date(remove[0], remove[1]-1, remove[2]);
                    //return dateFilter(tDate, localStorageService.getFromLocalStorage('dateformat'));
                    var dateFormat = localStorageService.getFromLocalStorage('dateformat');
                    var dateTimeFormat = dateFormat + ' ' + 'HH:mm:ss';
                    const [ year, month, day, hour, minute, second ] = input;
                    var tDate = new Date(`${year}-${month}-${day} ${hour}:${minute}:${second}`);
                    return dateFilter(tDate, dateTimeFormat);
                }
                return '';
            }
        }
    });
    mifosX.ng.application.filter('DateTimeFormat', ['dateFilter', 'localStorageService', mifosX.filters.DateTimeFormat]).run(function ($log) {
        $log.info("DateTimeFormat filter initialized");
    });
}(mifosX.filters || {}));
