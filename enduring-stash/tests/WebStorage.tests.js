"use strict";
define(
    ['../tests/provider.tests', 'WebStorage.provider'],
    function (tests, provider) {

       var run = function () {

          tests.run("WebStorage (local)", "LocalStorage");
  
       };

       return {
          run: run
       }

    }
);

