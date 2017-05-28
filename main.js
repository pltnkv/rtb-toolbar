/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var Sortable_1 = __webpack_require__(1);
	var app = angular.module('demo', [])
	    .controller('WelcomeController', function ($scope) {
	    $scope.tools = Array.from(Array(5)).map(function (item, index) { return ({
	        index: index,
	        id: index,
	        title: "T" + index
	    }); });
	});
	Sortable_1.default(app);
	angular.bootstrap(document, ['demo']);


/***/ }),
/* 1 */
/***/ (function(module, exports) {

	"use strict";
	function register(rtbApp) {
	    rtbApp.directive('sortableList', directive);
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = register;
	var ITEM_HEIGHT = 50;
	var staticTools = [
	    { icon: 'lib.svg' },
	    { icon: 'upload.svg' },
	    { icon: 'frames.svg' },
	    { icon: 'comments.svg' }
	];
	var customTools = [
	    { icon: 'pen.svg' },
	    { icon: 'shapes.svg' },
	    { icon: 'icfinder.svg' },
	    { icon: 'varfr.svg' },
	    { icon: 'atlass.svg' }
	];
	function createToolElement(data) {
	    return $("<div class=\"tool-item\"><div class=\"tool-item__inner\"><img src=\"img/" + data.icon + "\"></div></div>");
	}
	function createCustomToolElement(data) {
	    var e = createToolElement(data);
	    e.addClass('tool-item--customized');
	    return e;
	}
	function createWidgetDummy() {
	    return $("<div class=\"widget-dummy\">Some widget</div>");
	}
	function directive() {
	    return {
	        restrict: 'A',
	        scope: {
	            sortableArray: '=',
	            replaceDraggableElement: '=',
	            onSortStart: '&',
	            onSortStop: '&'
	        },
	        link: function (scope, mainContainer) {
	            var staticBox = $("<div class=\"board-toolbar__static-box\"></div>");
	            var customizedBox = $("<div class=\"board-toolbar__customized-box\"></div>");
	            var staticItems;
	            var customizedItems;
	            var maxIndex;
	            function initView() {
	                staticItems = staticTools.map(createToolElement);
	                customizedItems = customTools.map(createCustomToolElement); //scope.sortableArray.map(createCustomToolElement)
	                updateToolsPositions();
	                staticBox.append(staticItems);
	                customizedBox.append(customizedItems);
	                customizedItems.forEach(function (element) {
	                    element.on('mousedown', onDown);
	                });
	                staticItems.forEach(function (element, i) {
	                    if (i !== 0) {
	                        element.on('mousedown', onDown);
	                    }
	                });
	                mainContainer.append(staticBox);
	                mainContainer.append(customizedBox);
	            }
	            function updateToolsPositions(excludedElement) {
	                customizedItems.forEach(function (element, index) {
	                    if (element !== excludedElement) {
	                        element.css({
	                            top: (ITEM_HEIGHT * index) + 'px',
	                            left: 0
	                        });
	                    }
	                });
	                mainContainer.css('height', (customizedItems.length + staticTools.length) * ITEM_HEIGHT);
	            }
	            //////////////////////////
	            //drag logic
	            //////////////////////////
	            var draggingTool = false;
	            var draggingWidget = false;
	            var markAsRemoved;
	            var startPos;
	            var startOffsetX;
	            var startOffsetY;
	            var customizedBoxOffset;
	            var currentDraggingItem;
	            var currentDraggingItemIndex;
	            var widgetDummy;
	            function onDown(e) {
	                e.preventDefault();
	                maxIndex = customizedItems.length - 1;
	                startPos = { x: e.clientX, y: e.clientY };
	                startOffsetX = e.offsetX;
	                startOffsetY = e.offsetY;
	                customizedBoxOffset = customizedBox.offset();
	                currentDraggingItem = customizedItems.find(function (el) { return el[0] === e.currentTarget; });
	                if (currentDraggingItem) {
	                    currentDraggingItem.addClass('tool-item--dragging');
	                    currentDraggingItemIndex = customizedItems.findIndex(function (el) { return el === currentDraggingItem; });
	                }
	                document.addEventListener('mousemove', onMove);
	                document.addEventListener('mouseup', onUp);
	            }
	            function onMove(e) {
	                if (draggingTool && currentDraggingItem) {
	                    currentDraggingItem.css({
	                        left: e.clientX - startOffsetX - customizedBoxOffset.left,
	                        top: e.clientY - startOffsetY - customizedBoxOffset.top
	                    });
	                    if (isNeedToRemove(e)) {
	                        if (!markAsRemoved) {
	                            markAsRemoved = true;
	                            currentDraggingItem.addClass('tool-item--removed');
	                            customizedItems.splice(currentDraggingItemIndex, 1);
	                            updateToolsPositions();
	                        }
	                    }
	                    else {
	                        if (markAsRemoved) {
	                            markAsRemoved = false;
	                            currentDraggingItem.removeClass('tool-item--removed');
	                            customizedItems.splice(currentDraggingItemIndex, 0, currentDraggingItem);
	                            updateToolsPositions(currentDraggingItem);
	                        }
	                        var centerPositionY = e.clientY - startOffsetY - customizedBoxOffset.top; // + ITEM_HEIGHT / 2
	                        var newIndex = roundIndex(centerPositionY / ITEM_HEIGHT);
	                        if (newIndex !== currentDraggingItemIndex) {
	                            customizedItems.splice(currentDraggingItemIndex, 1);
	                            customizedItems.splice(newIndex, 0, currentDraggingItem);
	                            currentDraggingItemIndex = newIndex;
	                            updateToolsPositions(currentDraggingItem);
	                        }
	                    }
	                }
	                else if (draggingWidget) {
	                    widgetDummy.css({
	                        left: e.clientX,
	                        top: e.clientY
	                    });
	                }
	                else {
	                    var xDelta = Math.abs(startPos.x - e.clientX);
	                    var yDelta = Math.abs(startPos.y - e.clientY);
	                    if (xDelta > 5 || (xDelta > 3 && yDelta > 5)) {
	                        draggingWidget = true;
	                        widgetDummy = createWidgetDummy();
	                        widgetDummy.css({
	                            left: e.clientX,
	                            top: e.clientY
	                        });
	                        $(document.body).append(widgetDummy);
	                        requestAnimationFrame(function () {
	                            widgetDummy.addClass('widget-dummy--active').addClass('widget-dummy--dragging');
	                        });
	                    }
	                    else if (yDelta > 5) {
	                        draggingTool = true;
	                    }
	                }
	            }
	            function onUp() {
	                if (widgetDummy) {
	                    widgetDummy.removeClass('widget-dummy--dragging');
	                }
	                draggingTool = false;
	                draggingWidget = false;
	                if (currentDraggingItem) {
	                    if (markAsRemoved) {
	                        currentDraggingItem.remove();
	                        markAsRemoved = false;
	                    }
	                    currentDraggingItem.removeClass('tool-item--dragging');
	                    updateToolsPositions();
	                }
	                document.removeEventListener('mousemove', onMove);
	                document.removeEventListener('mouseup', onUp);
	            }
	            function isNeedToRemove(e) {
	                return e.clientX - startPos.x > 60 //слишком вправо
	                    || e.clientY - startOffsetY - customizedBoxOffset.top + ITEM_HEIGHT * 1.5 < 0 //слишком вверх
	                    || e.clientY - startOffsetY > customizedBoxOffset.top + customizedItems.length * ITEM_HEIGHT; //слишком вниз
	            }
	            function roundIndex(floatIndex) {
	                return Math.max(0, Math.min(maxIndex, Math.round(floatIndex)));
	            }
	            initView();
	        }
	    };
	}


/***/ })
/******/ ]);