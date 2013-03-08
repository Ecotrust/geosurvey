// alert('starting');
$.each(fixture.vendors, function (i, vendor) {
	vendor.name = [vendor.Surname, vendor.GivenName].join(', ');
});

function SurveyCtrl($scope, $location) {
	// alert('starting ctrl');
	var $ctrl = $("#survey");

	$scope.locations = fixture.locations;
	$scope.resources = fixture.resources;

	$scope.vendors = fixture.vendors.sort(function (a, b) {
		return a.Surname.localeCompare(b.Surname);
	});


	$scope.surveyQuestions = fixture.surveyQuestions;

	$scope.vendorSearch = function (vendor) {
		return vendor.Surname === $scope.vendorSearchTerm;
	};

	
	$scope.completeSurvey = function () {
		$scope.survey.completedAt = new Date();
		$scope.surveyList = $.map($scope.survey, function (question, i) {
			return question;
		});
		//$location.path("survey-done");
		$scope.navigateTo("survey-done");
	};

	$scope.edit = function (question) {
		
		$scope.numberInput = question.value;
		$scope.question = question;
		$scope.questions = [question];
		$scope.questionIndex = 0;
		//$location.path("survey");
		//window.location.hash = "survey";
		$scope.navigateTo("survey");	
	
		
	};

	$scope.recordAnswer = function (question) {
		// alert('record answer');
		if (! question.loopValue) {
			question.loopValue = [];
		}
		if (question.currentLoop) {
			if (question.selectedValues) {
				$.each(question.selectedValues, function (i, value) {
					question.loopValue.push([question.currentLoop, value.name].join(': '));
				});	
			} else {
				question.loopValue.push(question.value);
			}
			$scope.survey[[question.currentLoop, question.slug].join(':')] = $.extend({}, question);
		} else {
			$scope.survey[question.slug] = $.extend({}, question);	
			// alert(question.slug + " " + question.value);
		}
		
	};

	$scope.numberInput = null;
	$scope.padClick = function (event) {
		var question = $scope.questions[$scope.questionIndex],
			number = $(event.target).closest('button').text();
		if (number === "enter") {
			question.value = $scope.numberInput;
			$scope.recordAnswer(question);
			$scope.numberInput = null;
			if ($scope.questionIndex === $scope.questions.length - 1) {
				$scope.completeSurvey();
			} else {
				$scope.nextQuestion();
			}
		} else if ($scope.numberInput) {
			$scope.numberInput = $scope.numberInput + number;
		} else {
			$scope.numberInput = number;
		}
		
	};

	$scope.deleteButton = function () {
		
		if ($scope.numberInput) {
			$scope.numberInput = $scope.numberInput.slice(0, -1);
		
		}
	};

	$scope.backButton = false;
	$scope.back = function () {
		$scope.questionIndex--;
		$scope.setupQuestion($scope.questions[$scope.questionIndex]);
	};


	$scope.getQuestionBySlug = function (slug) {
		var desiredQuestion;
		angular.forEach($scope.questions, function (question) {
			if (question.slug === slug) {
				desiredQuestion = question;
				return false;
			}
			
		});
		return desiredQuestion;
	};


	$scope.nextQuestion = function () {
		
		//alert('next question');
		if (! $scope.questionIndex && $scope.questionIndex !== 0) {
			// starting the first question, no need to check for foreach
			$scope.questionIndex = 0;
		} else if (! $scope.question.foreach || $scope.question.foreachDone){
			// no foreach move on to the next question

			$scope.questionIndex++;	
			
		}
		
		if ($scope.questionIndex === $scope.questions.length - 1) {
			// we are at the end
			$scope.completeSurvey();
		} else {
			$scope.setupQuestion($scope.questions[$scope.questionIndex]);
		}

	
		

	};

	$scope.getLoopValues = function (slug) {
		var loopQuestion = $scope.getQuestionBySlug(slug),
			loopValues = [];
			// this question depends on another question
			// get the answers it depends on and get the loop values
			// for instance:
			// 
			// Price Paid to Fishers:
			// depends on resource-origin, which depends on resource-type
			// taro: pelagic
			// taro: lobster
			// yandina: pelagic
		

		if (loopQuestion.foreach) {
			loopValues = loopQuestion.loopValue;
		} else {
			loopValues = $.map(loopQuestion.selectedValues, function (value) {
				return value.name;
			});
		}
		
		//return loopQuestion.value.split(', ');
		return loopValues;
	};
	
	$scope.reset = function () {
		window.location.reload();
	};
	
	$scope.clearAnswers = function (choices) {
		if (choices) {
			$.each(choices, function (i, choice) {
				choice.selected = false;
				if (choice.children) {
					$scope.clearAnswers(choice.children);
				}
			});	
		}
		

	};

	$scope.setupQuestion = function (question) {
		var loopQuestion, $pane = $('.pane.active');

		if (question.foreach && ! question.loopValues) {
			// we are starting a foreach
			// look up the previous question
			// get a list of the values to loop over
			question.loopChoices = {};
			question.loopValues = $scope.getLoopValues(question.foreach);	
			
			// start with the first loop			
			question.currentLoopIndex = 0;
			question.currentLoop = question.loopValues[question.currentLoopIndex];
			question.loopChoices[question.currentLoop] = $.extend([], question.choices);
			
		} else  if (question.loopValues) {
			// we are in a foreach
			
			if (question.currentLoopIndex === question.loopValues.length - 1) {
				// done with question loop
				question.foreachDone = true;
			} else {
				
				question.currentLoopIndex++;
				question.currentLoop = question.loopValues[question.currentLoopIndex];
				//question.loopChoices[question.currentLoop] = $.extend([], question.choices);		
				
			}
			
		}

		if (question.foreachDone  && question.currentLoopIndex === question.loopValues.length - 1) {
			// we are done looping go to next question
			if ($scope.questionIndex === $scope.questions.length - 1) {
				$scope.completeSurvey();
			} else {
				$scope.nextQuestion();		
			}
			
		} else {
			// just a regular question
			$scope.question = question;
		}	
		$scope.clearAnswers(question.choices);
		// scroll back to top
		// $pane.removeClass('active');
		// $pane.find('.content').scrollTop(0);
		// $pane.addClass('active');
		// debugger;
		
	};

	$scope.pickMultiChoice = function (choice) {
		choice.selected = ! choice.selected;
	};

	$scope.selectMultiChoice = function () {
		var question = $scope.question;
		
		if (! question.loopSelectedValues) {
			question.loopSelectedValues = {};
		}


		if (! question.currentLoop) {
			question.currentLoop = 'default';
		}

		if (! question.loopSelectedValues[question.currentLoop]) {
			question.loopSelectedValues[question.currentLoop] = [];	
		}
		


		question.selectedValues = [];
		if (! question.currentLoopChoices) {
			question.currentLoopChoices = question.choices;
		}
		$.each(question.currentLoopChoices, function (i, choice) {
			var childSelected = false, 
				subChildSelected = false;
			if (choice.selected && choice.children) {
				$.each(choice.children, function (i, child) {
					if (child.selected && child.children) {
						$.each(child.children, function (i, child) {
							if (child.selected) {
								child.displayName = [child.name, choice.name].join(", ");
								question.loopSelectedValues[question.currentLoop].push(child);
								subChildSelected = true;
							}
						});
					}
					if (child.selected && ! subChildSelected) {
						child.displayName = [child.name, choice.name].join(", ");
						question.loopSelectedValues[question.currentLoop].push(child);
						subChildSelected = true;
						childSelected = true;
					}
				});
			}

			if (choice.selected && ! childSelected && ! subChildSelected) {
				question.loopSelectedValues[question.currentLoop].push(choice);
				childSelected = true;
			} 
		});

		question.value = $.map(question.loopSelectedValues[question.currentLoop], function (choice, i) {
			return choice.name;
		}).join(', ');
		question.selectedValues = question.loopSelectedValues[question.currentLoop];
		$scope.recordAnswer(question);
		
		if ($scope.questionIndex === $scope.questions.length - 1) {	
			$scope.completeSurvey();
		} else {
			$scope.nextQuestion();
		}
	};

	$scope.selectChoice = function (choice, question) {
		if (choice.children) {
			choice.selected = ! choice.selected;
		} else {
			question.value = choice.name;
			
			$scope.recordAnswer(question);
			
			if ($scope.questionIndex === $scope.questions.length - 1) {
				$scope.completeSurvey();
			} else {
				$scope.nextQuestion();
			}	
		}	
	};

	$scope.newItem = {

	};

	$scope.completedQuestions = [];

	$scope.width = $(document).width();

	$scope.addNewItem = function (fields) {
		// $scope.newItemFields = $.extend([], fields);
		// $scope.newItemFields.reverse();
		//$scope.newSurvey($scope.newItemFields);
		$scope.newSurvey(fields);
	};
	$scope.newSurvey = function (questions) {
		// pause the current survey
		$scope.interruptSurvey = $scope.questions;
		$scope.interruptQuestion = $scope.question;

		// jump into new survey
		$scope.questions = $.extend([], questions.reverse());
		$scope.question = $scope.questions.pop();
		
	};

	$scope.saveItem = function (question) {
		
		$scope.completedQuestions.push(question);

		// move to next question if it exists
		if ($scope.questions.length) {
			// have a new question
			$scope.question = $scope.questions.pop();	
		} else {
			// otherwise record the answer	
			// complete survey
			if (question.newItem) {
				// we are in a new item loop
				// record the answer and resume survey
				$scope.saveNewItem($scope.completedQuestions);
				$scope.resumeSurvey();
			} else {
				// this is a regular question
			}
		}
		
	};

	$scope.resumeSurvey = function () {
		$scope.completedQuestions = [];
		$scope.questions = $scope.interruptSurvey;
		$scope.nextQuestion();
	}

	$scope.saveNewItem = function (completedQuestions) {
		var newValue = {};
		angular.forEach(completedQuestions, function (question) {
			newValue[question.name] = question.value;
		});

		$scope.interruptQuestion.selectedValue = newValue;
		$scope.interruptQuestion.value = $.map($scope.interruptQuestion.displayVars, function (displayVar) {
			return newValue[displayVar];
		}).join(" ");
		$scope.recordAnswer($scope.interruptQuestion);
	}

	$scope.finalizeSurvey = function () {
		amplify.store($scope.survey.vendor.value + $scope.survey.completedAt, $scope.survey);
		$('.pane.active').removeClass('active');
		window.location.reload();
	};

	$scope.showSurvey = function (survey) {
		$scope.survey = survey;
		$scope.surveyList = $.map($scope.survey, function (question, i) {
			return question;
		});

		$scope.navigateTo('survey-done');
	}

	$scope.navigateTo = function (path) {
		//$location.path(path.replace('/', ''));

		$('.active').removeClass('active');
		$('#' + path).addClass('active');
		$('#' + path).trigger('page-show');
	};
	
	$scope.completedSurveys = amplify.store();
	//alert('ctrl registered');
	

	$scope.navigateTo('completed-surveys');
	//$location.path('survey');
	//alert('launched');

	$('#survey').on('page-show', function () {
		$scope.questions = $.extend([], $scope.surveyQuestions);
		$scope.questionIndex = false;

		$scope.survey = {};
		$scope.nextQuestion();

	});
}


window.addEventListener('load', function() {
    new FastClick(document.body);
}, false);

