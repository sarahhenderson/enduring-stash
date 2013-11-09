"use strict";
require.config({
   baseUrl: '../dist',
   paths: {
      'QUnit': '../lib/qunit/qunit-1.12.0',
      'Q': '../lib/q/q',

      'enduring': 'enduring-stash.min',

      'WebStorage.provider': 'WebStorage.provider.min',
      'Cookie.provider': 'Cookie.provider.min',
      'IndexedDB.provider': 'IndexedDb.provider.min',
      'WebSQL.provider': 'WebSQL.provider.min',
      'Memory.provider': 'Memory.provider.min'
},
   shim: {
      'QUnit': {
         exports: 'QUnit',
         init: function () {
            QUnit.config.autoload = false;
            QUnit.config.autostart = false;
         }
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
      'WebSQL.provider': { deps: ['enduring']},
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
       '../tests/WebSQL.tests',
       '../tests/IndexedDB.tests'],
    function (QUnit, webStorage, memoryStorage, cookieStorage, webSQL, indexedDB) {

       memoryStorage.run();
       webSQL.run();
       webStorage.run();
       cookieStorage.run();
       indexedDB.run();

       // start QUnit.
       QUnit.load();
       QUnit.start();
    }
);