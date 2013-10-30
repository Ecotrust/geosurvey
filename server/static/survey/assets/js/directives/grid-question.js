angular.module('askApp').directive('gridquestion', function() {
    return {
        templateUrl: app.viewPath + 'views/multiQuestionTypes.html',
        restrict: 'EA',
        // replace: true,
        transclude: true,
        scope: {
            question: '=question',
            pageorder: '=pageorder',
            answers: '=answers',
            viewPath: '=viewpath',
            validity: "=validity"
        },
        link: function postLink(scope, element, attrs) {


            scope.validateQuestion = function (question) {
                var overallValidity = true, currentRow;
                _.each(question.options, function (row) {
                    currentRow = row;
                    _.each(question.grid_cols, function (col) {
                        var answer = currentRow[col.label];
                        if (col.required && ! answer) {
                            if (col.either_or && ! currentRow[col.either_or]) {
                                overallValidity = false;
                            }
                            
                        }
                    });
                });
                return overallValidity;
            };
            // get previously answered questions
            scope.getAnswer = function(questionSlug) {
                var slug, gridSlug;
                if (_.string.include(questionSlug, ":")) {
                    slug = questionSlug.split(':')[0];
                    gridSlug = questionSlug.split(':')[1].replace(/-/g, '');
                } else {
                    slug = questionSlug;
                }
                
                if (scope.answers[slug]) {
                    if (gridSlug) {
                        return _.flatten(_.map(scope.answers[slug], function (answer) {
                            return _.map(answer[gridSlug], function (gridAnswer){
                                return {
                                    text: answer.text + ": " + gridAnswer,
                                    label: _.string.slugify(answer.text + ": " + gridAnswer)
                                }
                            });
                        }));
                    } else {
                        return scope.answers[slug];
                    }
                } else {
                    return false;
                }
            };

            // get simple answers
            scope.question.answer = scope.getAnswer(scope.question.slug);
            // set up rows for selects
            if (scope.question.rows) {
                scope.question.options = [];
                _.each(scope.question.rows.split('\n'), function (row, index) {
                    var matches = [];
                    if (_.isArray(scope.question.answer)) {
                        matches = _.filter(scope.question.answer, function (answer) {
                            return answer.text === row;
                        });    
                    } else if (row === scope.question.answer.text) {
                        // handle single selects
                        matches = [true];
                    }

                    scope.question.options.push({
                        text: _.string.startsWith(row, '*') ? row.substr(1) : row,
                        label: _.string.slugify(row),
                        checked: matches.length ? true: false,
                        isGroupName: _.string.startsWith(row, '*')
                    });
                });
                
                scope.question.groupedOptions = [];
                var groupName = "";

                _.each(scope.question.rows.split('\n'), function (row, index) {
                    var matches = _.filter(scope.question.answer, function (answer) {
                        return answer.text === row;
                    });
                    var isGroupName = _.string.startsWith(row, '*');
                    if ( isGroupName ) {
                        groupName = row.substr(1);
                        scope.question.groupedOptions.push( { optionLabel: groupName, options: [] } );
                    } else if ( scope.question.groupedOptions.length > 0 ) {
                        _.findWhere( scope.question.groupedOptions, { optionLabel: groupName } ).options.push({
                            text: row,
                            label: _.string.slugify(row),
                            checked: matches.length ? true : false
                        })
                    } 
                });

            }
             // grid question controller
            if (scope.question.type === 'grid') {
                // Prep row initial row data, each row containing values.
                // for activityLabel, activityText, cost and numPeople.
                if (scope.question.options_from_previous_answer) {
                    scope.question.options = scope.getAnswer(scope.question.options_from_previous_answer);
                }

                if (scope.question.options.length < 1) {
                    // Skip this question since we have no items to list.
                    // $scope.gotoNextQuestion();
                    alert('no rows');
                } 

                if (scope.question.answer) {
                    scope.question.answer = _.groupBy(scope.question.answer, 'text');
                } else {
                    scope.question.answer = {};
                }
                scope.question.selectedOptions = {};
                _.each(scope.question.options, function(value, key, list) {
                    var groupString = "";
                    if (value.groupName && value.groupName !== 'Lobsters\r') {
                        groupString = ' (' + value.groupName + ')';
                    }
                    list[key].activitySlug = value.label.replace(/-/g, '');
                    list[key].activityText = value.text + groupString;
                    _.each(scope.question.grid_cols, function(gridCol, i) {
                        var gridLabel = gridCol.label.replace(/-/g, '');
                        if (scope.question.answer !== null && _.has(scope.question.answer, value.text)) {

                            list[key][gridLabel] = scope.question.answer[value.text][0][gridLabel];

                            // the following loop was failing, not sure why it was a loop to begin with...
                            // this change appears to work for both single and multi column grids
                            if (_.isArray(scope.question.answer[value.text][0][gridLabel])) {
                                _.each(scope.question.answer[value.text][0][gridLabel], function (answer) {
                                    if (! scope.question.selectedOptions[gridLabel]) {
                                        scope.question.selectedOptions[gridLabel] = {};
                                        
                                    }
                                    if (! scope.question.selectedOptions[gridLabel][value.activitySlug]) {
                                        scope.question.selectedOptions[gridLabel][value.activitySlug] = {};
                                        
                                    }
                                    scope.question.selectedOptions[gridLabel][value.activitySlug][answer] = true;
                                });
                            } else {
                                var answer = scope.question.answer[value.text][0][gridLabel];
                                if (! scope.question.selectedOptions[gridLabel]) {
                                    scope.question.selectedOptions[gridLabel] = {};
                                    
                                }
                                if (! scope.question.selectedOptions[gridLabel][value.activitySlug]) {
                                    scope.question.selectedOptions[gridLabel][value.activitySlug] = {};
                                    
                                }
                                scope.question.selectedOptions[gridLabel][value.activitySlug][answer] = true;
                            }
                        }   
                    });
                });
            
                // Configure grid.
                var gridCellTemplateDefault = '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{COL_FIELD CUSTOM_FILTERS}}</span></div>';
                var costCellTemplate = '<input class="colt{{$index}} input-block-level" ng-model="row.entity[col.field]"  max="{{col.colDef.max}}" min="{{col.colDef.min}}" required="{{col.colDef.required}}" style="height: 100%;" type="number" step="any" }" value="{{row.getProperty(col.field)}}" onFocus="this.select();" onClick="this.select();"/>';
                var integerCellTemplate = '<input class="colt{{$index}} input-block-level" required="{{col.colDef.required}}" max="{{col.colDef.max}}" min="{{col.colDef.min}}" ng-model="row.entity[col.field]" style="height: 100%;" type="number" step="1" }" value="{{row.getProperty(col.field)}}" onFocus="this.select();" onClick="this.select();"/>';
                var nameTemplate = '<input class="colt{{$index}} input-block-level" ng-model="row.entity[col.field]" style="height: 100%;" type="text"   required="col.colDef.required" value="{{row.getProperty(col.field)}}"  }" />';
                var checkboxTemplate = '<input class="colt{{$index}} input-block-level" ng-model="row.entity[col.field]" style="height: 100%;" type="checkbox"  required="col.colDef.required" value="{{row.getProperty(col.field)}}" />';
                //var selectTemplate = '<select class="colt{{$index}} input-block-level" ng-model="row.entity[col.field]" style="height: 100%;" value="{{row.getProperty(col.field)}}"  }"><option ng-repeat="option in row.entity[\'rows\']">{{option}}</option></select>';
                // var selectTemplate = '<div style="height:100%">{{col.field}}</div>'
                var selectTemplate = '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text><select class="colt{{$index}} input-block-level" ng-model="row.entity[col.field]"  required="{{col.colDef.required}}" style="height: 100%;" value="{{row.getProperty(col.field)}}"  }"><option value="">select {{row.getProperty(col.field)}}</option><option ng-repeat="option in col.colDef.options">{{option}}</option></select></span></div>';
                var multiSelectTemplate = '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text><select multiple="true" class="colt{{$index}} input-block-level" ng-model="row.entity[col.field]"  required="{{col.colDef.required}}" style="height: 100%;" value="{{row.getProperty(col.field)}}"  }"><option ng-repeat="option in col.colDef.options" ng-selected="question.selectedOptions[col.colDef.field][row.entity.activitySlug][option]" value="{{option}}">{{option}}</option></select></span></div>';
                scope.question.gridOptions = {
                    data: 'question.options',
                    enableSorting: false,
                    enableCellSelection: true,
                    enablePaging: false,
                    canSelectRows: false,
                    multiSelect: false,
                    rowHeight: 50,
                    plugins: [new ngGridFlexibleHeightPlugin()],
                    rowTemplate: '<div ng-style="{\'z-index\': col.zIndex() }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}" ng-cell></div>',
                    columnDefs: [{
                            field: 'activityText',
                            displayName: " "
                        }
                    ]

                };
                
                _.each(scope.question.grid_cols, function(gridCol, i) {
                    var template, col = {
                        field: gridCol.label.replace(/-/g, ''),
                        displayName: gridCol.text,
                        slug: gridCol.label.replace(/-/g, ''),
                        required: gridCol.required || 'false',
                        max: gridCol.max,
                        min: gridCol.min
                    };
                    if (gridCol.type === 'integer') {
                        template = integerCellTemplate;
                    } else if (gridCol.type === 'number' || gridCol.type === 'currency') {
                        template = costCellTemplate;
                    } else if (gridCol.type === 'yes-no') {
                        template = checkboxTemplate;
                    } else if (gridCol.type === 'single-select') {
                        template = selectTemplate;
                        col.options = gridCol.rows.split('\n');
                    } else if (gridCol.type === 'multi-select') {
                        template = multiSelectTemplate;
                        col.options = gridCol.rows.split('\n');
                    } else {
                        template = nameTemplate;
                    }
                    col.cellTemplate = template
                    scope.question.gridOptions.columnDefs.push(col);
                });
            }


            // remove false answers
            if (! scope.question.answer) {
                delete scope.question.answer;
            }
            
            scope.$watch('question.options', function (newAnswer) {
                if (newAnswer) {
                    scope.validity[scope.question.slug] = scope.validateQuestion(scope.question);    
                }
            }, true);

            // $(element.find('.ngCellText')).attr('tabindex', -1);

            // element.on('focus', '.ngCellText', function (e) {
            //     if ($(e.target).closest('.ngRow')[0] === $(e.relatedTarget).closest('.ngRow')[0]) {
            //         // coming from the same row, move back
            //         $($(e.target).closest('.ngRow').prev().find('.ngCell:last-child').children()[0]).focus();
            //     } else {
            //         $(e.target).closest('.ngCell').next().find('input').focus();    
            //     }
                
            // });
        }
    };
});