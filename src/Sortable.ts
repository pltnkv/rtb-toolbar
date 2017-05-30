import ICatalogItemInfo from './ICatalogItemInfo'
import IPoint from './IPoint'

export function register(rtbApp:ng.IModule) {
	rtbApp.directive('sortableList', directive)
}

const ITEM_HEIGHT = 50

function createToolElement(data) {
	let e = $(`<div class="tool-item"><div class="tool-item__inner"><img src="${data.icon}"></div></div>`)
	e.data('data', data)
	return e
}

function createCustomToolElement(data) {
	let e = createToolElement(data)
	e.addClass('tool-item--customized')
	return e
}

export function createWidgetDummy(x, y) {
	let widgetDummy = $(`<div class="widget-dummy">Some widget</div>`)
	widgetDummy.css({left: x, top: y})
	$(document.body).append(widgetDummy)
	requestAnimationFrame(() => {
		widgetDummy.addClass('widget-dummy--active')
	})
	return widgetDummy
}

export function showWarning() {
	let warningElement = $(`<div class="warning-box">Can't drop this</div>`)
	$(document.body).append(warningElement)
	requestAnimationFrame(() => warningElement.addClass('warning-box--visible'))
	setTimeout(() => {
		warningElement.removeClass('warning-box--visible')
		setTimeout(() => {
			warningElement.remove()
		}, 300)
	}, 1000)
}

function directive():ng.IDirective {
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
		link: function (scope:any, mainContainer:ng.IAugmentedJQuery):void {
			let staticBox = $(`<div class="board-toolbar__static-box"></div>`)
			let customizedBox = $(`<div class="board-toolbar__customized-box"></div>`)
			let staticItems:JQuery[]
			let customizedItems:JQuery[]

			function initView() {
				staticItems = scope.staticTools.map(createToolElement)
				customizedItems = scope.customTools.map(createCustomToolElement)
				updateToolsPositions()

				staticBox.append(staticItems)
				customizedBox.append(customizedItems)

				mainContainer.on('mousedown', (e) => {
					if (e.target.classList.contains('tool-item')
						&& e.target !== staticItems[0][0]) {
						onDown(e)
					}
				})

				staticItems[0].on('click', () => {
					scope.$apply(() => {
						scope.onSidebarToggle()
					})
				})

				mainContainer.append(staticBox)
				mainContainer.append(customizedBox)
			}

			function updateToolsPositions(excludedElement?:JQuery) {
				customizedItems.forEach((element, index) => {
					if (element !== excludedElement) {
						element.css({
							top: (ITEM_HEIGHT * index) + 'px',
							left: 0
						})
					}
				})
				mainContainer.css('height', (customizedItems.length + staticItems.length) * ITEM_HEIGHT)
			}

			//////////////////////////
			//drag logic
			//////////////////////////

			let draggingTool = false
			let draggingWidget = false
			let markAsRemoved:boolean
			let startPos:IPoint
			let startOffsetX:number
			let startOffsetY:number
			let customizedBoxOffset:{ top; left }
			let currentDraggingItem:JQuery | undefined
			let currentDraggingItemIndex:number
			let widgetDummy
			let startTime:number
			let currentItemInfo:{ sortable:boolean, droppable:boolean }

			function onDown(e) {
				e.preventDefault()
				startPos = {x: e.clientX, y: e.clientY}
				startOffsetX = e.offsetX
				startOffsetY = e.offsetY
				customizedBoxOffset = customizedBox.offset()
				currentDraggingItem = [...customizedItems, ...staticItems].find(el => el[0] === e.target)
				currentItemInfo = currentDraggingItem.data('data')
				if (currentItemInfo.sortable) {
					currentDraggingItem.addClass('tool-item--dragging')
					currentDraggingItemIndex = customizedItems.findIndex(el => el === currentDraggingItem)
					startTime = Date.now()
				}
				document.addEventListener('mousemove', onMove)
				document.addEventListener('mouseup', onUp)
			}

			function onMove(e) {
				if (draggingTool && currentDraggingItem) {
					currentDraggingItem.css({
						left: e.clientX - startOffsetX - customizedBoxOffset.left,
						top: e.clientY - startOffsetY - customizedBoxOffset.top
					})
					if (isNeedToRemove(e)) {
						if (!markAsRemoved) {
							markAsRemoved = true
							currentDraggingItem.addClass('tool-item--removed')
							customizedItems.splice(currentDraggingItemIndex, 1)
							updateToolsPositions()
						}
					} else {
						if (markAsRemoved) {
							markAsRemoved = false
							currentDraggingItem.removeClass('tool-item--removed')
							addCustomizedItem(currentDraggingItemIndex, currentDraggingItem)
							updateToolsPositions(currentDraggingItem)
						}
						let newIndex = calcNewIndex(e.clientY - startOffsetY, customizedBoxOffset.top, customizedItems.length - 1)
						if (newIndex !== currentDraggingItemIndex) {
							removeCustomizedItem(currentDraggingItemIndex)
							addCustomizedItem(newIndex, currentDraggingItem)
							currentDraggingItemIndex = newIndex
							updateToolsPositions(currentDraggingItem)
						}
					}
				} else if (draggingWidget) {
					widgetDummy.css({
						left: e.clientX,
						top: e.clientY
					})
				} else {
					let deltaX = e.clientX - startPos.x
					let absDeltaY = Math.abs(startPos.y - e.clientY)
					let deltaTime = Date.now() - startTime
					if (deltaX > 10) {
						if (currentItemInfo.droppable) {
							draggingWidget = true
							widgetDummy = createWidgetDummy(e.clientX, e.clientY)
							widgetDummy.addClass('widget-dummy--dragging')
						} else {
							showWarning()
							onUp()
						}
					} else if (currentItemInfo.sortable && (deltaX < -20 || absDeltaY > 20 && deltaTime > 160)) {
						mainContainer.addClass('tools-box--dragging')
						draggingTool = true
					}
				}
			}

			function onUp() {
				if (widgetDummy) {
					widgetDummy.removeClass('widget-dummy--dragging')
				}
				draggingTool = false
				draggingWidget = false
				mainContainer.removeClass('tools-box--dragging')
				if (currentDraggingItem) {
					if (markAsRemoved) {
						currentDraggingItem.remove()
						markAsRemoved = false
					}
					currentDraggingItem.removeClass('tool-item--dragging')
					updateToolsPositions()
				}
				document.removeEventListener('mousemove', onMove)
				document.removeEventListener('mouseup', onUp)
			}

			function isNeedToRemove(e) {
				return e.clientX - startPos.x < -70 //слишком влево
					|| e.clientX - startPos.x > 60 //слишком вправо
					|| e.clientY - startOffsetY - customizedBoxOffset.top + ITEM_HEIGHT * 1.5 < 0 //слишком вверх
					|| e.clientY - startOffsetY > customizedBoxOffset.top + customizedItems.length * ITEM_HEIGHT //слишком вниз
			}

			function calcNewIndex(itemY:number, customizedBoxTop:number, maxIndex:number):number {
				let centerPositionY = itemY - customizedBoxTop
				return Math.max(0, Math.min(maxIndex, Math.round(centerPositionY / ITEM_HEIGHT)))
			}

			function addCustomizedItem(index:number, element:JQuery) {
				customizedItems.splice(index, 0, element)
			}

			function removeCustomizedItem(index:number) {
				if (index !== -1) {
					customizedItems.splice(index, 1)
				}
			}

			initView()

			/////////////////////////////////////////////
			// drag from catalog
			/////////////////////////////////////////////

			let customizedBoundingBox:{ top; bottom; right; left }
			let prevIndex:number
			let lastMouseOverTime = 0
			let savedMoveY:number
			let catalogItemIsDragging = false
			const dummyForCatalog = $('<div/>')

			onCatalogItemDown = (downItemInfo:ICatalogItemInfo) => {
				prevIndex = -1
				lastMouseOverTime = Number.MAX_SAFE_INTEGER
				catalogItemIsDragging = true

				if (!hasItemInToolbar(downItemInfo)) {
					let offset = customizedBox.offset()
					customizedBoundingBox = {
						top: offset.top,
						bottom: offset.top + customizedItems.length * ITEM_HEIGHT,
						left: offset.left,
						right: offset.left + 60
					}
					requestAnimationFrame(onCatalogItemTick)
				}
			}

			onCatalogItemMove = (x, y) => {
				if (underCustomizedPanel(x, y)) {
					if (lastMouseOverTime === Number.MAX_SAFE_INTEGER) {
						lastMouseOverTime = Date.now()
					}
					savedMoveY = y
				} else {
					lastMouseOverTime = Number.MAX_SAFE_INTEGER
					onCatalogItemOutToolbar()
				}
			}

			function onCatalogItemTick() {
				if (catalogItemIsDragging) {
					if (Date.now() - lastMouseOverTime > 200) {
						onCatalogItemOverToolbar(savedMoveY)
					}
					requestAnimationFrame(onCatalogItemTick)
				}
			}

			function onCatalogItemOverToolbar(y) {
				let newIndex = calcNewIndex(y - ITEM_HEIGHT / 2, customizedBoundingBox.top, prevIndex === -1 ? customizedItems.length : customizedItems.length - 1)
				if (newIndex !== prevIndex) {
					removeCustomizedItem(prevIndex)
					addCustomizedItem(newIndex, dummyForCatalog)
					prevIndex = newIndex
					updateToolsPositions()
				}
			}

			function onCatalogItemOutToolbar() {
				if (prevIndex !== -1) {
					removeCustomizedItem(prevIndex)
					updateToolsPositions()
					prevIndex = -1
				}
			}

			onCatalogItemUp = (downItemInfo:ICatalogItemInfo) => {
				catalogItemIsDragging = false
				if (prevIndex !== -1) {
					removeCustomizedItem(prevIndex)
					let el = createCustomToolElement(downItemInfo)
					addCustomizedItem(prevIndex, el)
					customizedBox.append(el)
					updateToolsPositions()
					return true
				} else {
					return false
				}
			}

			function underCustomizedPanel(x, y) {
				return x > customizedBoundingBox.left
					&& x < customizedBoundingBox.right
					&& y > customizedBoundingBox.top - ITEM_HEIGHT / 2
					&& y < customizedBoundingBox.bottom + ITEM_HEIGHT * 1.5
			}

			function hasItemInToolbar(item:ICatalogItemInfo):boolean {
				return !!customizedItems.find(element => element.data('data').icon === item.icon)
			}
		}
	}
}

export let onCatalogItemDown:(downItemInfo:ICatalogItemInfo) => void
export let onCatalogItemMove:(x, y) => void
export let onCatalogItemUp:(info:ICatalogItemInfo) => boolean
