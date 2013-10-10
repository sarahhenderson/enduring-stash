﻿"use strict";
define(
    ['../tests/provider.tests', 'IndexedDB.provider'],
    function (tests, provider) {

       var run = function () {

          tests.run("IndexedDB Storage", "IndexedDB");

       };

       return {
          run: run
       }

    }
);
