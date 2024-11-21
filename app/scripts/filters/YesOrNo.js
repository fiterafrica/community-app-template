(function (module) {
    mifosX.filters = _.extend(module, {
        YesOrNo: function ($filter, $locale) {
            return function (input) {
                var status = 'No';
                if (input === true) {
                    status = $locale.id === 'es' ? 'Sí' : 'Yes';
                } else if (input === false) {
                    status = $locale.id === 'es' ? 'No' : 'No';
                }
                return status;
            }
        }
    });
    mifosX.ng.application.filter('YesOrNo', ['$filter', '$locale', mifosX.filters.YesOrNo]).run(function ($log) {
        $log.info("YesOrNo filter initialized");
    });
}(mifosX.filters || {}));
