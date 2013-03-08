fixture.surveyQuestions = [{
	title: "Select a vendor to survey",
	type: "single-select",
	choices: fixture.vendors,
	slug: "vendor",
	name: "name",
	submit: "Vendor",
	displayVars: ["GivenName", "Surname"],
	addNewItem: true,
	fields: [{
		title: "Enter a Given Name",
		name: "GivenName",
		type: "text",
		newItem: true
	}, {
		title: "Enter a Surname",
		name: "Surname",
		type: "text",
		newItem: true
	}]
}, {
	title: "Select a location",
	type: "single-select",
	choices: fixture.locations,
	name: "name",
	slug: "location",
	submit: "Location"
}, {
	title: "Select resource type(s)",
	type: "multi-select",
	choices: fixture.resources,
	name: "name",
	slug: "resource-type",
	submit: "Resource"
},
// {
// 	title: "Volume Purchased (total today)",
// 	suffixUnit: "kg",
// 	slug: "totalVolumePurchasedForAllResources",
// },
{
	title: "Resource Origin",
	type: "multi-select",
	choices: $.extend([], fixture.locations),
	name: 'name',
	slug: "resource-origin",
	foreach: "resource-type"
}, {
	title: "Volume Purchased (total today)",
	suffixUnit: "kg",
	slug: "totalVolumePurchased",
	foreach: "resource-type"
}, {
	title: "Volume Purchased by Location",
	suffixUnit: "kg",
	slug: "volumePurchasedByLocation",
	foreach: "resource-origin"

},

{
	title: "Price Paid to Fishers",
	prefixUnit: "$",
	suffixUnit: "per kg",
	slug: "wholesalePrice",
	foreach: "resource-origin"
}, {
	title: "Retail Price",
	prefixUnit: "$",
	suffixUnit: "per kg",
	slug: "retailPrice",
	foreach: "resource-type"
},

{
	title: "Number of fishers/wholesalers purchased from",
	slug: "numberOfWholesalers",
	type: "integer",
	foreach: "resource-origin"
}, {
	title: "Volume Remaining from Previous Day",
	suffixUnit: "kg",
	slug: "volumeRemaining",
	foreach: "resource-type"

}, {
	title: "Approximate Volume Lost to Spoilage",
	suffixUnit: "%",
	slug: "percentSpoiled",
	foreach: "resource-type"

}];