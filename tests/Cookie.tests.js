define(
    ['../tests/provider.tests', 'Cookie.provider'],

    function (tests, provider) {
       "use strict";

       var run = function () {
          tests.run("Cookie Storage", "Cookie");
       };

       return {
          run: run
       };

    }
);

