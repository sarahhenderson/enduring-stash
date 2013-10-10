/*!
* Stash.js
* (c) Sarah Henderson 2013
*/

window.enduring = (function () {

   var Q = window.Q || undefined;
   var $ = window.jQuery || undefined;
   var JSON = window.JSON || undefined;

   // Stash requires a promise framework 
   if (!Q && !jQuery) throw 'Enduring Stash: Promise library unavailable! Include https://github.com/kriskowal/q/blob/master/q.js to fix.'

   // Stash requires json 
   if (!JSON) throw 'Enduring Stash: JSON unavailable! Include http://www.json.org/json2.js to fix.'



   // *** Stash "class" ------------------------------------- 
   // must be instantiated with a provider

   var Stash = (function (name, provider) {

      if (!provider) { throw "Cannot create a stash without a provider"; }

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
         var deferred = Q ? Q.defer() : $.Deferred();
         callback(deferred);
         return Q ? deferred.promise : deferred.promise();
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

   });


   // *** ProviderFactory ------------------------------------- 
   // must be instantiated with a provider

   var provider = (function () {
      "use strict";

      var providers = [];
      var namedProviders = {};

      // Allows providers to register themselves if their storage method is supported
      // parameters: name and constructor function for the provider
      var registerProvider = function (name, Provider) {

         if (providerIsValid(name, Provider)) {
            // add necessary prototype methods to the provider
            Provider.prototype.stringify = stringify;
            Provider.prototype.unstringify = unstringify;
            Provider.prototype.isType = isType;
            Provider.prototype.quoteStr = quoteStr;

            providers.push(Provider);
            namedProviders[name] = Provider;
         }
      };

      var providerIsValid = function (name, Provider) {

         var methods = 'get getAll set add update contains remove removeAll'.split(' ');
         var providerInstance = new Provider();

         for (var i = 0; i < methods.length; i++) {
            var method = methods[i];

            if (!providerInstance[method]) {
               if (console && console.error) {
                  console.error("Enduring Stash: Invalid provider! " + name + " provider is missing method " + method);
               }
               return false;
            }
         }
         return true;
      }


      // Returns whether there are any supported providers
      var hasProvider = function () {
         return providers.length > 0;
      }

      // Returns the first provider that registered that it works
      var getProvider = function () {
         if (hasProvider()) {
            var Provider = providers[0];
            return new Provider();
         } else {
            return undefined;
         }
      }

      // Returns a specific provider when multiple are available
      // Mostly for testing
      var forceProvider = function (name) {
         var Provider = namedProviders[name] || undefined;
         if (Provider) {
            return new Provider();
         } else {
            return null;
         }
      }

      // The methods below are attached to any registered providers.
      // Returns whether a constructor is the constructor of a value
      var isType = function (Ctor, val) {
         return val !== undefined && val !== null && val.constructor === Ctor;
      }

      // Returns a safely quoted string
      var quoteStr = function (str) {
         return "'" +
         String(str)
         .replace(/\\/g, '\\\\')
         .replace(/'/g, "\\'")
         .replace(/\n/g, '\\n')
         .replace(/\r/g, '\\r')
         .replace(/\t/g, '\\t') +
         "'";
      }


      // Returns a string version of JavaScript
      var stringify = function (val) {

         if (isType(Date, val)) {
            return 'new Date(' + val.getTime() + ')';
         }

         if (isType(Array, val)) {
            var values = [];
            for (var i = 0; i < val.length; i++) {
               values.push(stringify(val[i]));
            }
            return '[' + values.join(',') + ']';
         }

         if (isType(Object, val)) {
            var values = [];
            for (var property in val) {
               values.push(quoteStr(property) + ':' + stringify(val[property]));
            }
            return '{' + values.join(',') + '}';
         }

         if (
            isType(RegExp, val)
          ) return String(val);

         return JSON.stringify(val);
      }

      // Returns a JavaScript version of a string
      var unstringify = function (str) {
         return new Function('return ' + str).apply();
      }

      return {
         hasProvider: hasProvider,
         getProvider: getProvider,
         forceProvider: forceProvider,
         registerProvider: registerProvider
      }

   })();



   // *** Functions to actually create the stash object with a provider ----------------- 

   var createStash = function (collection, providerName) {

      if (!provider.hasProvider()) {
         throw 'Enduring Stash: No storage providers available! Include at least one provider.';
      }

      if (providerName) {
         var thisProvider = provider.forceProvider(providerName);

         if (!thisProvider) {
            throw "Cannot force use of " + providerName + " provider - it is not available";
         }
      } else {
         var thisProvider = provider.getProvider();
      }

      var stash = new Stash(collection, thisProvider);
      return stash; 
   }


   var stashOf = function (collection, providerName) {
      return createStash(collection, providerName);
   };


   var stash = function () {
      return createStash('');
   };


   return { // public API
      stash: stash,
      stashOf: stashOf,
      provider: provider
   }
})();