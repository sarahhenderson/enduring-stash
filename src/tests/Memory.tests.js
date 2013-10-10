define(
    ['../tests/provider.tests', 'Memory.provider'],
    function (tests, provider) {
       "use strict";

       var run = function () {

          tests.run("Memory Storage", "Memory");
       
       };

       return {
          run: run
       };

    }
);

