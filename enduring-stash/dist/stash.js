"use strict";
define(['story'], function (story) {



   var storage = story.storage(story.StorageTypes.LOCAL_STORAGE);

      var set = function (key, value) {
         if (storage.contains(key)) {
            storage.update(key, value);
         } else {
            storage.add(key, value);
         }
      }

      


      return {
         stash: storage,
      }
    }
);