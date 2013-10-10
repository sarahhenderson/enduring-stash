console.log(enduring);
console.log(window.enduring);

$(document).ready(function(){

   var settings = enduring.stash();

   $("#try-set").click(function () {
      settings.set("Username", "Sarah");
   });

   $("#try-get").click(function () {
      settings.get("Username")
      .then(function (result) {
         alert(result);
      });
   });


});