define(
    ['../tests/provider.tests', 'IndexedDB.provider'],
    function (tests, provider) {
       "use strict";

       var run = function () {
          tests.run("IndexedDB Storage", "IndexedDB");
       };

       return {
          run: run
       };

    }
);

