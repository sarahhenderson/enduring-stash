"use strict";
define(
    ['../tests/provider.tests', 'Memory.provider'],
    function (tests, provider) {

       var run = function () {

          tests.run("Memory Storage", "Memory");
       
       };

       return {
          run: run
       }

    }
);

