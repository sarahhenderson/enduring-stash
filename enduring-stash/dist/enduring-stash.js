"use strict";
define(['story'], function (story) {

 
   var stash = function () {

      var storyobject = story.storage(story.StorageTypes.LOCAL_STORAGE);

      return {
         get: storyobject.get,
         set: storyobject.set,
         add: storyobject.add,
         update: storyobject.update,
         getAll: storyobject.getAll,
         contains: storyobject.contains,
         remove: storyobject.remove,
         clear: storyobject.clear,
         storage: storyobject.storage
         }
   };
      


      return {
         stash: stash(),
      }
    }
);