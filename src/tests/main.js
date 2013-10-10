"use strict";
require.config({
   baseUrl: '../app',
   paths: {
      'QUnit': '../lib/qunit/qunit-1.12.0',
      'QPromises': '../lib/qunit/qunit.promises',
      'Q': '../lib/q/q',

      'enduring': '../app/enduring',

      'WebStorage.provider': 'WebStorage.provider',
      'CookieStorage.provider': 'Cookie.provider',
      'IndexedDB.provider': 'IndexedDb.provider',
      'Memory.provider': 'Memory.provider'
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
      'enduring': {
         deps:['Q'],
         exports: 'enduring'
      },
      'WebStorage.provider': { deps: ['enduring']},
      'Cookie.provider': { deps: ['enduring']},
      'IndexedDB.provider': { deps: ['enduring']},
      'Memory.provider': { deps: ['enduring']}

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

       webStorage.run();
       memoryStorage.run();
       cookieStorage.run();
//       indexedDB.run();

       // start QUnit.
       QUnit.load();
       QUnit.start();
    }
);