
"use strict";
require.config({
   paths: {
      'QUnit': '../lib/qunit/qunit-1.12.0',
      'QPromises': '../lib/qunit/qunit.promises',
      'enduring': '../dist/enduring-stash',
      'story': '../src/story',
      'Q': '../lib/q/q'
   },
   shim: {
      'QUnit': {
         exports: 'QUnit',
         init: function () {
            QUnit.config.autoload = false;
            QUnit.config.autostart = false;
         }
      },
      'QPromises': {
         deps: ['QUnit'],
         exports: 'QUnit'
      },
      'Q': {
         exports: 'Q',
      },
      'story': {
         exports: 'story'
}
   }
});
// require the unit tests.
require(
    ['QUnit', 'localstorage', 'indexedDB'],
    function (qunit, localstorage, indexedDB) {

       var tests = [];
       tests.push(localstorage);
       tests.push(indexedDB);

       // configure and run the tests
      for (var i = 0; i < tests.length; i++) {
          var test = tests[i];
          test.testStorage = true;
          test.testRetrieval = true;
          test.run();
       }

       // start QUnit.
       QUnit.load();
       QUnit.start();
    }
);