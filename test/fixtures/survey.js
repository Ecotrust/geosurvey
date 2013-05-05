var survey = {
    "id": 1,
    "name": "Test Survey",
    "questions": [{
        "id": 1,
        "label": "Name",
        "options": [],
        "resource_uri": "",
        "slug": "name",
        "title": "What is your name?",
        "type": "text"
    }, {
        "id": 2,
        "label": "Age",
        "options": [],
        "resource_uri": "",
        "slug": "age",
        "title": "How old are you?",
        "type": "text"
    }, {
        "id": 4,
        "info": "",
        "label": "Pick a state",
        "options": [],
        "resource_uri": "",
        "slug": "state",
        "title": "What state do you live in?",
        "type": "auto-single-select"
    }, {
        "id": 5,
        "info": "",
        "label": "Pick a county",
        "options": [],
        "resource_uri": "",
        "slug": "county",
        "title": "What county do you live in?",
        "type": "auto-single-select",
        "options_from_previous_answer": "state"
    }, {
        "id": 6,
        "label": "Activity Locations",
        "options": [],
        "resource_uri": "",
        "slug": "activity-locations",
        "title": "Activity Locations",
        "type": "map-multipoint",
        "subQuestion": {
            "id": 6,
            "label": "Activity at Location",
            "options": ["dancing", "sailing"],
            "resource_uri": "",
            "slug": "activities",
            "title": "Activity Locations",
            "type": "single-select",
            "inflow": false,
            "subQuestionSlug": "activities"
        }
    }],
    "resource_uri": "/api/v1/survey/1/",
    "slug": "test-survey"
};
