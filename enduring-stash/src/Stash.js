/*!
* Stash.js
* (c) Sarah Henderson 2013
*/

define(['Q'], function (Q) {
   "use strict";

   var Stash = function (name, provider) {

      if (!provider) {
         throw "Cannot create a stash without a provider";
      }

      // establish keyPrefix for this collection
      var keyPrefix = "_stash_";
      keyPrefix += name ? name + "_" : "";
      keyPrefix = keyPrefix.toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-');

      // creates a key unique to the collection and this application
      var createStoreKey = function (key) {
         if (key instanceof Array || key === null || key === undefined) {
            throw "Invalid key: " + key;
         }
         return keyPrefix + key;
      };


      // wraps each provider method in a promise
      var promiseWrap = function (callback) {
         var deferred = Q.defer();
         callback(deferred);
         return deferred.promise;
      }


      // individual methods
      var get = function (key) {
         return promiseWrap(function (promise) {
            provider.get(createStoreKey(key), promise);
         });
      };

      var set = function (key, value) {
         return promiseWrap(function (promise) {
            provider.set(createStoreKey(key), value, promise);
         });
      };

      var getAll = function () {
         return promiseWrap(function (promise) {
            provider.getAll(keyPrefix, promise);
         });
      };
      var update = function (key, value) {
         return promiseWrap(function (promise) {
            provider.update(createStoreKey(key), value, promise);
         });
      };
      var add = function (key, value) {
         return promiseWrap(function (promise) {
            provider.add(createStoreKey(key), value, promise);
         });
      };
      var remove = function (key) {
         return promiseWrap(function (promise) {
            provider.remove(createStoreKey(key), promise);
         });
      };
      var contains = function (key) {
         return promiseWrap(function (promise) {
            provider.contains(createStoreKey(key), promise);
         });
      };
      var removeAll = function () {
         return promiseWrap(function (promise) {
            provider.removeAll(promise);
         });
      };
   

      return {
         get: get,
         getAll: getAll,
         set: set,
         add: add,
         update: update,
         contains: contains,
         remove: remove,
         removeAll: removeAll
      };

   }
   return Stash;
});