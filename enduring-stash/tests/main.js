
"use strict";
require.config({
   baseUrl: '../src',
   paths: {
      'QUnit': '../lib/qunit/qunit-1.12.0',
      'QPromises': '../lib/qunit/qunit.promises',
      'Q': '../lib/q/q',

      'enduring': '../src/enduring-stash',
      'Stash': '../src/Stash',
      'WebStorage': '../src/WebStorage.provider',
      'Memory': '../src/Memory.provider'
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
      }
   }
});
// require the unit tests.
require(
    ['QUnit',
       '../tests/WebStorage.tests',
       '../tests/Memory.tests',
       '../tests/Cookie.tests',
       '../tests/IndexedDB.tests'],
    function (QUnit, webStorage, memoryStorage, cookieStorage, indexedDB) {

       //webStorage.run();
       //memoryStorage.run();
       //cookieStorage.run();
       indexedDB.run();

       // start QUnit.
       QUnit.load();
       QUnit.start();
    }
);