fixture.surveyQuestions = [
	{
		title: "Select a location",
		type: "single-select",
		choices: fixture.locations,
		name: "name",
		slug: "location",
		submit: "Location",
		fields: [
			{ 
				title: "Select a province",
				name: "name",
				slug: "province", 
				type: "single-select", 
				choices: fixture.locations,
				showChildren: false
			},
			{ name: "name" }
		]
	},
	{
		title: "Select a fisher to survey",
		type: "single-select",
		choices: fixture.vendors,
		slug: "vendor",
		name: "name",
		submit: "Vendor",
		fields: [
			{ name: "GivenName", type: "text" },
			{ name: "Surname", type: "text" }
		]
	},
	{
		title: "Total Fishers",
		suffixUnit: "fisher",
		slug: "total-fishers",
		type: "integer"
	},
	{
		title: "Fisher Origin",
		type: "single-select",
		choices: fixture.resourceOrigins,
		name: 'name',
		slug: "fisher-origin"
	},
	{
		title: "Fishing Location",
		type: "single-select",
		choices: fixture.resourceOrigins,
		name: 'name',
		slug: "fishing-location"
	},
	{
		title: "Total hours fished (excluding travel time)",
		suffixUnit: "hours",
		slug: "total-hours-fished"
	},
	{
		title: "Select gear type(s)",
		type: "multi-select",
		choices: fixture.gearTypes,
		name: "name",
		slug: "gear-type"
	},
	{
		title: "Select resource type(s)",
		type: "multi-select",
		choices: fixture.resources,
		name: "name",
		slug: "resource-type",
		foreach: "gear-type"
	},
	{
		title: "Amount sold",
		suffixUnit: "kg",
		slug: "amount-sold"
	},
	{
		title: "Amount kept",
		suffixUnit: "kg",
		slug: "amount-kept"
	},
	{
		title: "Total price paid for catch",
		prefixUnit: "$",
		slug: "total-price",
	},
	{
		title: "Price paid for resource",
		prefixUnit: "$",
		slug: "resource-price",
		foreach: "resource-type"
	},
	{
		title: "Weight for resource",
		suffixUnit: "kg",
		slug: "resource-weight",
		foreach: "resource-type"
	},
	{
		title: "Vessel Type",
		type: "single-select",
		choices: fixture.vesselTypes,
		name: 'name',
	},
	{
		title: "Fuel Expenditures",
		prefixUnit: "$",
		slug: "fuel-cost"
	},
	{
		title: "Cost for ice",
		prefixUnit: "$",
		slug: "ice-cost"
	},
	{
		title: "Cost for eskie",
		prefixUnit: "$",
		slug: "eskie-cost"
	},
	{
		title: "Cost for salt",
		prefixUnit: "$",
		slug: "salt-cost"
	},
	{
		title: "Cost for fishing gear",
		prefixUnit: "$",
		slug: "gear-cost"
	},
	{
		title: "Primary or secondary fisher",
		type: "single-select",
		choices: [ {name: "full-time" }, {name: "part-time" }],
		name: "name",
		slug: "fisher-type"
	}
	
];

