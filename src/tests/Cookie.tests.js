"use strict";
define(
    ['../tests/provider.tests', 'Cookie.provider'],
    function (tests, provider) {

       var run = function () {

          tests.run("Cookie Storage", "Cookie");

       };

       return {
          run: run
       }

    }
);

