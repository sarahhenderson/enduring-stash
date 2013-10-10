"use strict";
define(
    ['../tests/provider.tests', 'WebSQL.provider'],
    function (tests, provider) {

       var run = function () {

          tests.run("WebSQL Storage", "WebSQL");
       
       };

       return {
          run: run
       }

    }
);

