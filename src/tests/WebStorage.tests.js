define(
    ['../tests/provider.tests', 'WebStorage.provider'],
    function (tests, provider) {
       "use strict";

       var run = function () {

          tests.run("WebStorage (local)", "LocalStorage");
  
       };

       return {
          run: run
       };

    }
);

