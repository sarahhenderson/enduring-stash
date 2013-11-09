$(document).ready(function () {

	var settings = enduring.stash();
	var people = enduring.stashOf("person");

	$("#try-set").click(function () {

		var username = $("#try-set-value").val();
		settings.set("Username", username);

		var person = { name: "Pat Lee", id: "PL001" };
		people.set(person.id, person);
		$(".try-set-message").removeClass('hidden');
	});

	$("#try-get").click(function () {
		settings.get("Username")
      .then(function (result) {
      	$(".try-get-username").html(result);
      });
		people.get("PL001")
      .then(function (person) {
      	$(".try-get-person").html(person.name);
      });
		$(".try-get-message").removeClass('hidden');
	});

	$("#try-add").click(function () {
		settings.add("FavouriteColour", "blue");
		settings.add("FavouriteColour", "red");
		// Favourite colour is still blue, adding a second value does not overwrite the first one
	});

	$("#try-update").click(function () {
		settings.add("FavouriteColour", "blue");
		settings.update("FavouriteColour", "red");
		// Favourite colour is now updated to red
		settings.update("YearsOfExperience", 2);
		// YearsOfExperience is not saved because it was not previously added
	});

	$("#try-contains").click(function () {
		settings.contains("FavouriteColour")
			.then(function (itemExists) {
				if (itemExists) {
					$(".try-contains-message").html("FavouriteColour exists")
				} else {
					$(".try-contains-message").html("FavouriteColour does NOT exist")
				}
			});
	});

	$("#try-getAll").click(function () {
		settings.set("FavouriteColour", "red");
		settings.set("FavouriteNumber", 21);
		settings.set("FavouritePerson", { name: "Ada Lovelace", profession: "Programmer" });
		settings.getAll()
			.then(function (result) {
				$(".try-get-all-message").html(JSON.stringify(result));
			});
		$(".try-get-all-message").closest("pre").removeClass("hidden");
	});


	$("#try-remove").click(function () {
		settings.remove("FavouriteColour");
		settings.remove("FavouriteNumber")
		.then(function () {
			console.log("FavouriteNumber removed");
		});
	});


	$("#try-removeAll").click(function () {
		settings.removeAll();
		person.removeAll()
		.then(function () {
			console.log("Stash emptied");
		});
	});

	$("button.btn-success").click(function () {
		var button = $(this);
		button.removeClass("btn-success");
		button.next().show();
	});


});