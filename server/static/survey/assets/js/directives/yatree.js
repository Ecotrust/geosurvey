angular.module('askApp').directive('yaTree', function() {

    return {
        restrict: 'A',
        transclude: 'element',
        priority: 1000,
        terminal: true,
        compile: function(tElement, tAttrs, transclude) {

            var repeatExpr, childExpr, rootExpr, childrenExpr;

            repeatExpr = tAttrs.yaTree.match(/^(.*) in ((?:.*\.)?(.*)) at (.*)$/);
            childExpr = repeatExpr[1];
            rootExpr = repeatExpr[2];
            childrenExpr = "questions"; //repeatExpr[3];
            altChildrenExpr = "pages"
            branchExpr = repeatExpr[4];

            return function link(scope, element, attrs) {

                var rootElement = element[0].parentNode,
                    cache = [];

                // Reverse lookup object to avoid re-rendering elements

                function lookup(child) {
                    var i = cache.length;
                    while (i--) {
                        if (cache[i].scope[childExpr] === child) {
                            return cache.splice(i, 1)[0];
                        }
                    }
                }

                scope.$watch(rootExpr, function(root) {

                    var currentCache = [];

                    // Recurse the data structure
                    (function walk(children, parentNode, parentScope, depth) {

                        var i = 0,
                            n = children ? children.length : 0,
                            last = n - 1,
                            cursor,
                            child,
                            cached,
                            childScope,
                            grandchildren;

                        // Iterate the children at the current level
                        for (; i < n; ++i) {

                            // We will compare the cached element to the element in 
                            // at the destination index. If it does not match, then 
                            // the cached element is being moved into this position.
                            cursor = parentNode.childNodes[i];

                            child = children[i];

                            // See if this child has been previously rendered
                            // using a reverse lookup by object reference
                            cached = lookup(child);

                            // If the parentScope no longer matches, we've moved.
                            // We'll have to transclude again so that scopes 
                            // and controllers are properly inherited
                            if (cached && cached.parentScope !== parentScope) {
                                cache.push(cached);
                                cached = null;
                            }

                            // If it has not, render a new element and prepare its scope
                            // We also cache a reference to its branch node which will
                            // be used as the parentNode in the next level of recursion
                            if (!cached) {
                                transclude(parentScope.$new(), function(clone, childScope) {

                                    childScope[childExpr] = child;

                                    cached = {
                                        scope: childScope,
                                        parentScope: parentScope,
                                        element: clone[0],
                                        branch: clone.find(branchExpr)[0]
                                    };

                                    // This had to happen during transclusion so inherited 
                                    // controllers, among other things, work properly
                                    if (!cursor) parentNode.appendChild(cached.element);
                                    else parentNode.insertBefore(cached.element, cursor);


                                });
                            } else if (cached.element !== cursor) {
                                if (!cursor) parentNode.appendChild(cached.element);
                                else parentNode.insertBefore(cached.element, cursor);

                            }

                            // Lets's set some scope values
                            childScope = cached.scope;

                            // Store the current depth on the scope in case you want 
                            // to use it (for good or evil, no judgment).
                            childScope.$depth = depth;

                            // Emulate some ng-repeat values
                            childScope.$index = i;
                            childScope.$first = (i === 0);
                            childScope.$last = (i === last);
                            childScope.$middle = !(childScope.$first || childScope.$last);

                            // Push the object onto the new cache which will replace
                            // the old cache at the end of the walk.
                            currentCache.push(cached);

                            // If the child has children of its own, recurse 'em.             
                            grandchildren = child[childrenExpr];
                            if (grandchildren && grandchildren.length) {
                                walk(grandchildren, cached.branch, childScope, depth + 1);
                            }
                        }
                    })(root, rootElement, scope, 0);

                    // Cleanup objects which have been removed.
                    // Remove DOM elements and destroy scopes to prevent memory leaks.
                    i = cache.length;

                    while (i--) {
                        cached = cache[i];
                        if (cached.scope) {
                            cached.scope.$destroy();
                        }
                        if (cached.element) {
                            cached.element.parentNode.removeChild(cached.element);
                        }
                    }

                    // Replace previous cache.
                    cache = currentCache;

                }, true);
            };
        }
    };
}).directive('uiNestedSortable', ['$parse',
    function($parse) {

        'use strict';

        var eventTypes = 'Create Start Sort Change BeforeStop Stop Update Receive Remove Over Out Activate Deactivate'.split(' ');

        return {
            restrict: 'A',
            require: '?ngModel',
            link: function(scope, element, attrs, ngModel) {

                var options = attrs.uiNestedSortable ? $parse(attrs.uiNestedSortable)() : {};

                angular.forEach(eventTypes, function(eventType) {

                    var attr = attrs['uiNestedSortable' + eventType],
                        callback;
                    if (attr && ngModel) {
                        callback = $parse(attr);
                        options[eventType.charAt(0).toLowerCase() + eventType.substr(1)] = function(event, ui) {
                            scope.$apply(function() {
                                callback(scope, {
                                    $event: event,
                                    $ui: ui
                                });
                            });
                        };
                    }

                });


                // ngModel.$render = function() {
                //   element.sortable( "refresh" );
                // };

                options.start = function(e, ui) {
                    // Save position of dragged item
                    var index = ui.item.index(),
                        $parent = $(ui.item).parent().closest('.tree')
                    ui.item.sortable = {
                        index: index,
                        parent: $parent.length? $parent.index(): null
                    };
                };

                options.update = function(e, ui) {
                    // For some reason the reference to ngModel in stop() is wrong
                    var index = ui.item.index(),
                        $parent = $(ui.item).parent().closest('.tree');
                    ui.item.sortable.destParent = $parent.length? $parent.index(): null;
                    ui.item.sortable.resort = ngModel;
                };

                options.receive = function(e, ui) {
                    ui.item.sortable.relocate = true;
                    console.log('receive');
                    // added item to array into correct position and set up flag
                    ngModel.$modelValue.splice(ui.item.index(), 0, ui.item.sortable.moved);
                };

                options.remove = function(e, ui) {
                    // copy data into item
                    console.log('remove');
                    if (ngModel.$modelValue.length === 1) {
                        ui.item.sortable.moved = ngModel.$modelValue.splice(0, 1)[0];
                    } else {
                        ui.item.sortable.moved = ngModel.$modelValue.splice(ui.item.sortable.index, 1)[0];
                    }
                };

                options.stop = function(e, ui) {
                    // digest all prepared changes
                    var end, start, list, destList;
                    if (ui.item.sortable.resort && !ui.item.sortable.relocate) {
                        // Fetch saved and current position of dropped element
                  
                        start = ui.item.sortable.index;
                        end = ui.item.index();

                        if (_.isNumber(ui.item.sortable.destParent)) {
                            destList = ui.item.sortable.resort.$modelValue[ui.item.sortable.destParent];
                            list = ui.item.sortable.resort.$modelValue[ui.item.sortable.parent];
                            destList.questions.splice(end, 0, list.questions.splice(start, 1)[0]);
                            list.updateQuestions = true;
                            destList.updateQuestions = true;
                        } else if (_.isNumber(ui.item.sortable.parent)) {
                            list = ui.item.sortable.resort.$modelValue[ui.item.sortable.parent];
                            list.questions.splice(end, 0, list.questions.splice(start, 1)[0]);
                        } else {
                            list = ui.item.sortable.resort.$modelValue
                            list.splice(end, 0, list.splice(start, 1)[0]);
                        }
                        // Reorder array and apply change to scope
                      
                    }
                    if (ui.item.sortable.resort || ui.item.sortable.relocate) {
                        scope.$apply();
                    }

                };

                //note the item="{{child}}" attribute on line 17
                options.isAllowed = function(item, parent) {
                    // none of this is working :(

                    // var itemType, parentType;

                    //   if ( ! parent) {
                    //     // we are dragging a question within a page
                    //     return true;
                    //   } else {
                    //     parent = parent.scope().item;
                    //     item = item.scope().item;
                    //     parentType = parent.resource_uri.split('/')[3];
                    //     itemType = item.resource_uri.split('/')[3];
                    //     if (itemType === 'question' && parentType === 'question') {
                    //       return false;
                    //     }
                    //     if (itemType === 'page' && parentType === 'page') {
                    //       return false;
                    //     }
                    //     if (itemType === 'page' && parentType === 'question') {
                    //       return false;
                    //     }
                    //     if (itemType === 'question' && parentType === 'page') {
                    //       return false;
                    //     }
                    //     console.log("parent ", parentType);
                    //     console.log("item ", itemType);
                    //     return true;
                    //   }
                    return true;
                };

                element.nestedSortable(options);

            }
        };
    }
]);
