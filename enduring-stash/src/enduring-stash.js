define(['Stash', 'providerFactory'], function (Stash, providerFactory) {
   "use strict";

   var createStash = function (collection, providerName) {

      // Stash requires json 
      if (!JSON) throw 'Enduring Stash: JSON unavailable! Include http://www.json.org/json2.js to fix.'

      if (!providerFactory.hasProvider()) {
         throw 'Enduring Stash: No storage providers available! Include at least one provider.';
      }

      if (providerName) {
         var provider = providerFactory.forceProvider(providerName);
         if (!provider) {
            throw "Cannot force use of " + providerName + " provider - it is not available";
         }
      } else {
         var provider = providerFactory.getProvider();
      }

      var stash = new Stash(collection, provider);
      return stash; 
   }


   var stashOf = function (collection, providerName) {
      return createStash(collection, providerName);
   };


   var stash = function () {
      return createStash('');
   };



   return {
      stash: stash,
      stashOf: stashOf
   }
}
);