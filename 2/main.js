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
	var Sortable = __webpack_require__(1);
	var staticTools = [
	    { icon: 'img/lib.svg' },
	    { icon: 'img/upload.svg', droppable: true },
	    { icon: 'img/frames.svg', droppable: true },
	    { icon: 'img/comments.svg', droppable: true }
	];
	var customTools = [
	    { icon: 'img/pen.svg', sortable: true },
	    { icon: 'img/shapes.svg', sortable: true },
	    { icon: 'img/icfinder.svg', sortable: true },
	    { icon: 'img/varfr.svg', sortable: true },
	    { icon: 'img/atlass.svg', sortable: true, droppable: true }
	];
	var catalog = [
	    { icon: 'img/catalog/add-embed.svg', sortable: true, droppable: true },
	    { icon: 'img/catalog/box.svg', sortable: true, droppable: true },
	    { icon: 'img/catalog/charts.svg', sortable: true },
	    { icon: 'img/catalog/dropbox.svg', sortable: true, droppable: true },
	    { icon: 'img/catalog/from-url.svg', sortable: true, droppable: true },
	    { icon: 'img/catalog/google-drive.svg', sortable: true, droppable: true },
	    { icon: 'img/catalog/iconfinder.svg', sortable: true },
	    { icon: 'img/catalog/image-search.svg', sortable: true, droppable: true },
	    { icon: 'img/catalog/jiracards.svg', sortable: true, droppable: true },
	    { icon: 'img/catalog/onedrive.svg', sortable: true, droppable: true },
	    { icon: 'img/catalog/save-files.svg', sortable: true },
	    { icon: 'img/catalog/templates.svg', sortable: true, droppable: true },
	    { icon: 'img/catalog/wireframes.svg', sortable: true }
	];
	var CATALOG_ITEM_SIZE = 96;
	var app = angular.module('demo', [])
	    .controller('WelcomeController', function ($scope) {
	    $scope.staticTools = staticTools;
	    $scope.customTools = customTools;
	    $scope.sidebarItems = catalog.map(function (item, index) { return ({
	        id: index,
	        title: item.icon.substring(12).substr(0, item.icon.substring(12).length - 4),
	        icon: item.icon,
	        originalInfo: item
	    }); });
	    $scope.sidebarVisible = true;
	    $scope.onSidebarToggle = function () {
	        $scope.sidebarVisible = !$scope.sidebarVisible;
	    };
	    ///////////////////////////////////
	    // drop catalog item
	    ///////////////////////////////////
	    var startPos;
	    var draggingItem;
	    var downItemElement;
	    var downItemInfo;
	    var startOffsetX;
	    var startOffsetY;
	    $scope.onItemDown = function (e, item) {
	        e.preventDefault();
	        downItemElement = $(e.currentTarget);
	        downItemInfo = item.originalInfo;
	        startPos = { x: e.clientX, y: e.clientY };
	        startOffsetX = e.offsetX;
	        startOffsetY = e.offsetY;
	        document.addEventListener('mousemove', onMove);
	        document.addEventListener('mouseup', onUp);
	    };
	    function onMove(e) {
	        if (draggingItem) {
	            updateDraggingItemPosition(e.clientX, e.clientY);
	        }
	        else if (Math.abs(startPos.x - e.clientX) > 5 || Math.abs(startPos.y - e.clientY) > 5) {
	            Sortable.onCatalogItemDown(downItemInfo);
	            draggingItem = createDraggingPlaceholder();
	            updateDraggingItemPosition(e.clientX, e.clientY);
	            $(document.body).append(draggingItem);
	        }
	    }
	    function updateDraggingItemPosition(clientX, clientY) {
	        if (draggingItem) {
	            var x = clientX - startOffsetX;
	            var y = clientY - startOffsetY;
	            draggingItem.css({ transform: "translateX(" + Math.round(x) + "px) translateY(" + Math.round(y) + "px)" });
	            Sortable.onCatalogItemMove(x + CATALOG_ITEM_SIZE / 2, y + CATALOG_ITEM_SIZE / 2);
	        }
	    }
	    function onUp(e) {
	        if (draggingItem) {
	            if (Sortable.onCatalogItemUp(downItemInfo)) {
	                draggingItem.remove();
	            }
	            else if (e.clientX > 360) {
	                if (downItemInfo.droppable) {
	                    draggingItem.remove();
	                    Sortable.createWidgetDummy(e.clientX, e.clientY);
	                }
	                else {
	                    draggingItem.remove();
	                    Sortable.showWarning();
	                }
	            }
	            else {
	                runRemoveAnimation(draggingItem);
	            }
	            draggingItem = undefined;
	        }
	        document.removeEventListener('mousemove', onMove);
	        document.removeEventListener('mouseup', onUp);
	    }
	    function runRemoveAnimation(element) {
	        element.addClass('dragging-catalog-item--removing');
	        element.css({
	            transform: "translateX(" + (startPos.x - startOffsetX) + "px) translateY(" + (startPos.y - startOffsetY) + "px)",
	            opacity: 0
	        });
	        setTimeout(function () {
	            element.remove();
	        }, 300);
	    }
	    function createDraggingPlaceholder() {
	        var el = downItemElement.clone();
	        el.addClass('dragging-catalog-item');
	        el.find('.sidebar-item__title').remove();
	        return el;
	    }
	});
	Sortable.register(app);
	angular.bootstrap(document, ['demo']);


/***/ }),
/* 1 */
/***/ (function(module, exports) {

	"use strict";
	function register(rtbApp) {
	    rtbApp.directive('sortableList', directive);
	}
	exports.register = register;
	var ITEM_HEIGHT = 50;
	function createToolElement(data) {
	    var e = $("<div class=\"tool-item\"><div class=\"tool-item__inner\"><img src=\"" + data.icon + "\"></div></div>");
	    e.data('data', data);
	    return e;
	}
	function createCustomToolElement(data) {
	    var e = createToolElement(data);
	    e.addClass('tool-item--customized');
	    return e;
	}
	function createWidgetDummy(x, y) {
	    var widgetDummy = $("<div class=\"widget-dummy\">Some widget</div>");
	    widgetDummy.css({ left: x, top: y });
	    $(document.body).append(widgetDummy);
	    requestAnimationFrame(function () {
	        widgetDummy.addClass('widget-dummy--active');
	    });
	    return widgetDummy;
	}
	exports.createWidgetDummy = createWidgetDummy;
	function showWarning() {
	    var warningElement = $("<div class=\"warning-box\">Can't drop this</div>");
	    $(document.body).append(warningElement);
	    requestAnimationFrame(function () { return warningElement.addClass('warning-box--visible'); });
	    setTimeout(function () {
	        warningElement.removeClass('warning-box--visible');
	        setTimeout(function () {
	            warningElement.remove();
	        }, 300);
	    }, 1000);
	}
	exports.showWarning = showWarning;
	function directive() {
	    return {
	        restrict: 'A',
	        scope: {
	            replaceDraggableElement: '=',
	            onSortStart: '&',
	            onSortStop: '&',
	            onSidebarToggle: '&',
	            staticTools: '=',
	            customTools: '='
	        },
	        link: function (scope, mainContainer) {
	            var staticBox = $("<div class=\"board-toolbar__static-box\"></div>");
	            var customizedBox = $("<div class=\"board-toolbar__customized-box\"></div>");
	            var staticItems;
	            var customizedItems;
	            function initView() {
	                staticItems = scope.staticTools.map(createToolElement);
	                customizedItems = scope.customTools.map(createCustomToolElement);
	                updateToolsPositions();
	                staticBox.append(staticItems);
	                customizedBox.append(customizedItems);
	                mainContainer.on('mousedown', function (e) {
	                    if (e.target.classList.contains('tool-item')
	                        && e.target !== staticItems[0][0]) {
	                        onDown(e);
	                    }
	                });
	                staticItems[0].on('click', function () {
	                    scope.$apply(function () {
	                        scope.onSidebarToggle();
	                    });
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
	                mainContainer.css('height', (customizedItems.length + staticItems.length) * ITEM_HEIGHT);
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
	            var startTime;
	            var currentItemInfo;
	            function onDown(e) {
	                e.preventDefault();
	                startPos = { x: e.clientX, y: e.clientY };
	                startOffsetX = e.offsetX;
	                startOffsetY = e.offsetY;
	                customizedBoxOffset = customizedBox.offset();
	                currentDraggingItem = customizedItems.concat(staticItems).find(function (el) { return el[0] === e.target; });
	                currentItemInfo = currentDraggingItem.data('data');
	                if (currentItemInfo.sortable) {
	                    currentDraggingItem.addClass('tool-item--dragging');
	                    currentDraggingItemIndex = customizedItems.findIndex(function (el) { return el === currentDraggingItem; });
	                    startTime = Date.now();
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
	                            addCustomizedItem(currentDraggingItemIndex, currentDraggingItem);
	                            updateToolsPositions(currentDraggingItem);
	                        }
	                        var newIndex = calcNewIndex(e.clientY - startOffsetY, customizedBoxOffset.top, customizedItems.length - 1);
	                        if (newIndex !== currentDraggingItemIndex) {
	                            removeCustomizedItem(currentDraggingItemIndex);
	                            addCustomizedItem(newIndex, currentDraggingItem);
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
	                    var deltaX = Math.abs(startPos.x - e.clientX);
	                    var deltaY = Math.abs(startPos.y - e.clientY);
	                    var deltaTime = Date.now() - startTime;
	                    if (deltaX > 10) {
	                        if (currentItemInfo.droppable) {
	                            draggingWidget = true;
	                            widgetDummy = createWidgetDummy(e.clientX, e.clientY);
	                            widgetDummy.addClass('widget-dummy--dragging');
	                        }
	                        else {
	                            showWarning();
	                            onUp();
	                        }
	                    }
	                    else if (currentItemInfo.sortable && deltaY > 20 && deltaTime > 60) {
	                        mainContainer.addClass('tools-box--dragging');
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
	                mainContainer.removeClass('tools-box--dragging');
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
	            function calcNewIndex(itemY, customizedBoxTop, maxIndex) {
	                var centerPositionY = itemY - customizedBoxTop;
	                return Math.max(0, Math.min(maxIndex, Math.round(centerPositionY / ITEM_HEIGHT)));
	            }
	            function addCustomizedItem(index, element) {
	                customizedItems.splice(index, 0, element);
	            }
	            function removeCustomizedItem(index) {
	                if (index !== -1) {
	                    customizedItems.splice(index, 1);
	                }
	            }
	            initView();
	            /////////////////////////////////////////////
	            // drag from catalog
	            /////////////////////////////////////////////
	            var customizedBoundingBox;
	            var prevIndex;
	            var lastMouseOverTime = 0;
	            var savedMoveY;
	            var catalogItemIsDragging = false;
	            var dummyForCatalog = $('<div/>');
	            exports.onCatalogItemDown = function (downItemInfo) {
	                prevIndex = -1;
	                lastMouseOverTime = Number.MAX_SAFE_INTEGER;
	                catalogItemIsDragging = true;
	                if (!hasItemInToolbar(downItemInfo)) {
	                    var offset = customizedBox.offset();
	                    customizedBoundingBox = {
	                        top: offset.top,
	                        bottom: offset.top + customizedItems.length * ITEM_HEIGHT,
	                        left: offset.left,
	                        right: offset.left + 60
	                    };
	                    requestAnimationFrame(onCatalogItemTick);
	                }
	            };
	            exports.onCatalogItemMove = function (x, y) {
	                if (underCustomizedPanel(x, y)) {
	                    if (lastMouseOverTime === Number.MAX_SAFE_INTEGER) {
	                        lastMouseOverTime = Date.now();
	                    }
	                    savedMoveY = y;
	                }
	                else {
	                    lastMouseOverTime = Number.MAX_SAFE_INTEGER;
	                    onCatalogItemOutToolbar();
	                }
	            };
	            function onCatalogItemTick() {
	                if (catalogItemIsDragging) {
	                    if (Date.now() - lastMouseOverTime > 200) {
	                        onCatalogItemOverToolbar(savedMoveY);
	                    }
	                    requestAnimationFrame(onCatalogItemTick);
	                }
	            }
	            function onCatalogItemOverToolbar(y) {
	                var newIndex = calcNewIndex(y - ITEM_HEIGHT / 2, customizedBoundingBox.top, prevIndex === -1 ? customizedItems.length : customizedItems.length - 1);
	                if (newIndex !== prevIndex) {
	                    removeCustomizedItem(prevIndex);
	                    addCustomizedItem(newIndex, dummyForCatalog);
	                    prevIndex = newIndex;
	                    updateToolsPositions();
	                }
	            }
	            function onCatalogItemOutToolbar() {
	                if (prevIndex !== -1) {
	                    removeCustomizedItem(prevIndex);
	                    updateToolsPositions();
	                    prevIndex = -1;
	                }
	            }
	            exports.onCatalogItemUp = function (downItemInfo) {
	                catalogItemIsDragging = false;
	                if (prevIndex !== -1) {
	                    removeCustomizedItem(prevIndex);
	                    var el = createCustomToolElement(downItemInfo);
	                    addCustomizedItem(prevIndex, el);
	                    customizedBox.append(el);
	                    updateToolsPositions();
	                    return true;
	                }
	                else {
	                    return false;
	                }
	            };
	            function underCustomizedPanel(x, y) {
	                return x > customizedBoundingBox.left
	                    && x < customizedBoundingBox.right
	                    && y > customizedBoundingBox.top - ITEM_HEIGHT / 2
	                    && y < customizedBoundingBox.bottom + ITEM_HEIGHT * 1.5;
	            }
	            function hasItemInToolbar(item) {
	                return !!customizedItems.find(function (element) { return element.data('data').icon === item.icon; });
	            }
	        }
	    };
	}


/***/ })
/******/ ]);