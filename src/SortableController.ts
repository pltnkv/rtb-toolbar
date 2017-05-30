interface IPoint {
    x:number
    y:number
}
interface IOnSortStart {
    ():void
}
interface IOnSortStop {
    (params:{oldIndex:number; newIndex:number}):void
}
interface EventNames {
    press:string
    pressEnd:string
    move:string
    leave:string
    enter:string
}
let REGULAR_EVENT_NAMES:EventNames = {
    press: 'mousedown',
    pressEnd: 'mouseup',
    move: 'mousemove',
    leave: 'mouseleave',
    enter: 'mouseenter'
}
let MOBILE_EVENT_NAMES:EventNames = {
    press: 'touchstart',
    pressEnd: 'touchend',
    move: 'touchmove',
    leave: 'touchleave',
    enter: 'touchenter'
}
const EVENT_NAMES:EventNames = REGULAR_EVENT_NAMES
const TOUCH_CHANGE_POSITION_TOLERANCE = 10
const MOUSE_MOVE_POSITION_THRESHOLD = 5
const DELAY_IN_MS = 500

export default class SortableController {

    private container:JQuery
    private draggableItem:JQuery
    private mouseStartPos:IPoint
    private mouseCurrentPos:IPoint
    private isDragElement = false
    private isElementPressed = false
    private timeoutId:number
    private onSortStart:IOnSortStart
    private onSortStop:IOnSortStop
    private maxIndex:number
    private items:JQuery
    private replaceDraggableElement:boolean
    private dummy:JQuery
    private newDraggableItemIndex:number
    private minTopValue:number
    private maxTopValue:number
    private containerPaddingTop:number

    constructor(container:JQuery, replaceDraggableElement:boolean, onSortStart:IOnSortStart, onSortStop:IOnSortStop) {
        this.replaceDraggableElement = replaceDraggableElement
        this.container = container
        this.onSortStart = onSortStart
        this.onSortStop = onSortStop
        this.container.addClass('sortable-list')
        this.dummy = $('<div class="draggable-dummy"/>')
    }

    refresh() {
        this.deactivate()
        this.activate()
    }

    activate() {
        this.items = this.container.children()
        this.items.on(EVENT_NAMES.press, this.pressHandler)
        let itemHeight = this.items.first().outerHeight(true)
        this.dummy.css('height', itemHeight)
        this.maxIndex = this.items.length - 1
        this.containerPaddingTop = parseInt(this.container.css('padding-top'), 10)
        this.minTopValue = this.containerPaddingTop
        this.maxTopValue = itemHeight * this.maxIndex + this.containerPaddingTop
    }

    deactivate() {
        if (this.items) {
            this.items.off(EVENT_NAMES.press, this.pressHandler)
        }
    }

    private pressHandler = (event) => {
        this.draggableItem = $(event.currentTarget)
        this.mouseCurrentPos = this.mouseStartPos = this.getPosition(event)
        this.isElementPressed = true
        // if (bowser.isTouchSupported) {
        //     this.timeoutId = setTimeout(this.onDelayIsOver, DELAY_IN_MS)
        //     this.draggableItem.on(EVENT_NAMES.move, this.onMouseMove)
        //     this.draggableItem.one(EVENT_NAMES.leave, this.pressInterrupted)
        //     $(document).one('scroll', this.pressInterrupted)
        //         .on(EVENT_NAMES.pressEnd, this.pressInterrupted)
        // } else {
            let onMouseMove = (e) => {
                if (Math.abs(this.getPosition(e).y - this.mouseStartPos.y) > MOUSE_MOVE_POSITION_THRESHOLD) {
                    this.startDrag()
                    removeEvents()
                }
            }
            let removeEvents = () => {
                $(document).off(EVENT_NAMES.move, onMouseMove)
                $(document).off(EVENT_NAMES.pressEnd, removeEvents)
            }
            $(document).on(EVENT_NAMES.move, onMouseMove)
            $(document).on(EVENT_NAMES.pressEnd, removeEvents)
        // }
    }
    private onDelayIsOver = () => {
        if (this.isElementPressed) {
            let changePosX = Math.abs(this.mouseStartPos.x - this.mouseCurrentPos.x)
            let changePosY = Math.abs(this.mouseStartPos.y - this.mouseCurrentPos.y)
            if (changePosX < TOUCH_CHANGE_POSITION_TOLERANCE && changePosY < TOUCH_CHANGE_POSITION_TOLERANCE) {
                this.pressInterrupted()
                this.startDrag()
            } else {
                this.pressInterrupted()
            }
        }
    }
    private pressInterrupted = () => {
        this.isElementPressed = false
        clearTimeout(this.timeoutId)
        this.draggableItem.off(EVENT_NAMES.leave, this.pressInterrupted)
        this.draggableItem.off(EVENT_NAMES.move, this.onMouseMove)
        $(document).off('scroll', this.pressInterrupted).off(EVENT_NAMES.pressEnd, this.pressInterrupted)
    }

    private startDrag() {
        this.newDraggableItemIndex = -1
        this.isDragElement = true
        this.draggableItem
            .addClass('permeable draggable')
            .addClass('dragged-top-shadow')
            .find('.item')
            .removeClass('selected')
            .addClass('dragged-bottom-shadow')
        $(document).on(EVENT_NAMES.move, this.onMouseMove)
            .one(EVENT_NAMES.pressEnd, this.dragEndHandler)
        let currentIndex = this.getDraggableElementIndex(this.draggableItem)
        this.setNewDraggableItemIndex(currentIndex, currentIndex)
        this.onSortStart()
    }

    private dragEndHandler = () => {
        this.isDragElement = false
        this.draggableItem.removeClass('draggable')
            .css({top: 'auto'})
            .removeClass('permeable')
            .removeClass('dragged-top-shadow')
            .find('.item')
            .removeClass('dragged-bottom-shadow')
        $(document).off(EVENT_NAMES.move, this.onMouseMove)
            .off(EVENT_NAMES.pressEnd, this.dragEndHandler)
        let currentIndex = this.getDraggableElementIndex(this.draggableItem)
        this.dummy.remove()
        if (this.replaceDraggableElement) {
            this.insertElementInPlace(this.draggableItem, currentIndex, this.newDraggableItemIndex)
        }
        this.onSortStop({oldIndex: currentIndex, newIndex: this.newDraggableItemIndex})
    }
    private onMouseMove = (event) => {
        if (this.isDragElement) {
            let draggableElementHeight = this.draggableItem.outerHeight(true)
            let draggableElementIndex = this.getDraggableElementIndex(this.draggableItem)
            let topValue = this.getPosition(event).y - this.mouseStartPos.y + this.containerPaddingTop + draggableElementHeight * draggableElementIndex
            let newIndex = this.getRoundedIndex(topValue / draggableElementHeight)
            this.setDraggableItemTop(topValue)
            this.setNewDraggableItemIndex(draggableElementIndex, newIndex)
        } else {
            this.mouseCurrentPos = this.getPosition(event)
        }
    }

    private setDraggableItemTop(top:number) {
        let newTop = Math.max(this.minTopValue, Math.min(this.maxTopValue, top))
        this.draggableItem.css({top: newTop})
    }

    private setNewDraggableItemIndex(draggableElementIndex, newIndex) {
        if (this.newDraggableItemIndex !== newIndex) {
            this.newDraggableItemIndex = newIndex
            this.insertElementInPlace(this.dummy, draggableElementIndex, newIndex)
        }
    }

    private insertElementInPlace(element, currentIndex, newIndex) {
        if (currentIndex > newIndex) {
            element.insertBefore(this.items[newIndex])
        } else {
            element.insertAfter(this.items[newIndex])
        }
    }

    private getDraggableElementIndex(item):number {
        return this.items.index(item)
    }

    private getRoundedIndex(floatIndex:number):number {
        return Math.max(0, Math.min(this.maxIndex, Math.round(floatIndex)))
    }

    private getPosition(event):{x; y} {
        let res = {x: 0, y: 0}
        res.x = event.clientX
        res.y = event.clientY
        return res
    }
}