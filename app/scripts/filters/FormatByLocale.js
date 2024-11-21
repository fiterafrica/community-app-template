(function (module) {
    mifosX.filters = _.extend(module, {
        FormatByLocale: function ($filter, $locale) {
            return function (input) {
                let formattedResult = input;
                if (!isNaN(input)) {
                    if (input !== "" && input !== undefined) {
                        if ($locale.id === 'es') {
                            formattedResult = input.toLocaleString('en');
                        } else {
                            formattedResult = input.toLocaleString($locale.id);
                        }
                    }
                }
                return formattedResult;
            }
        }
    });
    mifosX.ng.application.filter('FormatByLocale', ['$filter', '$locale', mifosX.filters.FormatByLocale]).run(function ($log) {
        $log.info("FormatByLocale filter initialized");
    });
}(mifosX.filters || {}));
