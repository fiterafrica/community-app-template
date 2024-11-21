(function (module) {
    mifosX.filters = _.extend(module, {
        FormatNumber: function ($filter) {
            return function (input, fractionSize) {
                let formattedText = input;
                if (isNaN(input)) {
                    formattedText = input;
                } else {
                    if (input !== "" && input !== undefined) {
                        formattedText = $filter('number')(input, fractionSize);
                    }
                }
                return formattedText;
            }
        }
    });
    mifosX.ng.application.filter('FormatNumber', ['$filter', mifosX.filters.FormatNumber]).run(function ($log) {
        $log.info("FormatNumber filter initialized");
    });
}(mifosX.filters || {}));
