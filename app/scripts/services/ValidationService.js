(function (module) {
    mifosX.services = _.extend(module, {

        ValidationService: function () {
            function validDpi(modelValue) {
                // En caso de que no venga valor, no se realiza la validacion
                if (!modelValue) {
                    return true;
                }
                var dpi = modelValue.toString();
                var dpiRegExp = /^[0-9]{4}[\s\-]?[0-9]{5}[\s\-]?[0-9]{4}$/;

                if (!dpiRegExp.test(dpi)) {
                    return false;
                }

                dpi = dpi.replace(/\s/, '').split(/\-/).join('');
                var regionCode = parseInt(dpi.substring(9, 11), 10);
                var cityCode = parseInt(dpi.substring(11, 13), 10);
                var dpiNumber = dpi.substring(0, 8);
                var verifier = parseInt(dpi.substring(8, 9), 10);

                // Se asume que la codificación de Municipios y 
                // departamentos es la misma que esta publicada en 
                // http://goo.gl/EsxN1a

                // Listado de municipios actualizado segun:
                // http://goo.gl/QLNglm

                // Este listado contiene la cantidad de municipios
                // existentes en cada departamento para poder 
                // determinar el código máximo aceptado por cada 
                // uno de los departamentos.
                var cityCountPerRegion = [
                    /* 01 - Guatemala has:      */ 17 /* cities. */,
                    /* 02 - El Progreso has:    */  8 /* cities. */,
                    /* 03 - Sacatepéquez has:   */ 16 /* cities. */,
                    /* 04 - Chimaltenango has:  */ 16 /* cities. */,
                    /* 05 - Escuintla has:      */ 13 /* cities. */,
                    /* 06 - Santa Rosa has:     */ 14 /* cities. */,
                    /* 07 - Sololá has:         */ 19 /* cities. */,
                    /* 08 - Totonicapán has:    */  8 /* cities. */,
                    /* 09 - Quetzaltenango has: */ 24 /* cities. */,
                    /* 10 - Suchitepéquez has:  */ 21 /* cities. */,
                    /* 11 - Retalhuleu has:     */  9 /* cities. */,
                    /* 12 - San Marcos has:     */ 30 /* cities. */,
                    /* 13 - Huehuetenango has:  */ 32 /* cities. */,
                    /* 14 - Quiché has:         */ 21 /* cities. */,
                    /* 15 - Baja Verapaz has:   */  8 /* cities. */,
                    /* 16 - Alta Verapaz has:   */ 17 /* cities. */,
                    /* 17 - Petén has:          */ 14 /* cities. */,
                    /* 18 - Izabal has:         */  5 /* cities. */,
                    /* 19 - Zacapa has:         */ 11 /* cities. */,
                    /* 20 - Chiquimula has:     */ 11 /* cities. */,
                    /* 21 - Jalapa has:         */  7 /* cities. */,
                    /* 22 - Jutiapa has:        */ 17 /* cities. */
                ];

                if (regionCode === 0 || cityCode === 0) {
                    // Departamento o municipio invalidos
                    return false;
                }

                if (regionCode > cityCountPerRegion.length) {
                    // CUI con código de departamento inválido.
                    return false;
                }

                if (cityCode > cityCountPerRegion[regionCode - 1]) {
                    // CUI con código de municipio inválido.
                    return false;
                }

                // Se verifica el correlativo con base 
                // en el algoritmo del complemento 11.
                var total = 0;

                for (var i = 0; i < dpiNumber.length; i++) {
                    total += parseInt(dpiNumber[i], 10) * (i + 2);
                }

                var modulus = (total % 11);

                // console.log("CUI con módulo: " + modulo);
                return modulus === verifier;
            }


            this.$get = ['$resource', '$rootScope', function (resource, $rootScope) {
                return {
                    checkDPI: function (dpi) {
                        return validDpi(dpi);
                    }
                };
            }];
        }
    });
    mifosX.ng.services.config(function ($provide) {
        $provide.provider('ValidationService', mifosX.services.ValidationService);
    }).run(function ($log) {
        $log.info("ValidationService initialized");
    });
}(mifosX.services || {}));
