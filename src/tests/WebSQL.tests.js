define(
    ['../tests/provider.tests', 'WebSQL.provider'],
    function (tests, provider) {
       "use strict";

       var run = function () {

          tests.run("WebSQL Storage", "WebSQL");
       
       };

       return {
          run: run
       };

    }
);

