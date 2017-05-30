import * as Sortable from 'Sortable'
import ICatalogItemInfo from './ICatalogItemInfo'
import IPoint from './IPoint'

const staticTools:ICatalogItemInfo[] = [
    {icon: 'img/lib.svg'},
    {icon: 'img/upload.svg', droppable: true},
    {icon: 'img/frames.svg', droppable: true},
    {icon: 'img/comments.svg', droppable: true}
]

const customTools:ICatalogItemInfo[] = [
    {icon: 'img/pen.svg', sortable: true},
    {icon: 'img/shapes.svg', sortable: true},
    {icon: 'img/icfinder.svg', sortable: true},
    {icon: 'img/varfr.svg', sortable: true},
    {icon: 'img/atlass.svg', sortable: true, droppable: true}
]

const catalog:ICatalogItemInfo[] = [
    {icon: 'img/catalog/add-embed.svg', sortable: true, droppable: true},
    {icon: 'img/catalog/box.svg', sortable: true, droppable: true},
    {icon: 'img/catalog/charts.svg', sortable: true},
    {icon: 'img/catalog/dropbox.svg', sortable: true, droppable: true},
    {icon: 'img/catalog/from-url.svg', sortable: true, droppable: true},
    {icon: 'img/catalog/google-drive.svg', sortable: true, droppable: true},
    {icon: 'img/catalog/iconfinder.svg', sortable: true},
    {icon: 'img/catalog/image-search.svg', sortable: true, droppable: true},
    {icon: 'img/catalog/jiracards.svg', sortable: true, droppable: true},
    {icon: 'img/catalog/onedrive.svg', sortable: true, droppable: true},
    {icon: 'img/catalog/save-files.svg', sortable: true},
    {icon: 'img/catalog/templates.svg', sortable: true, droppable: true},
    {icon: 'img/catalog/wireframes.svg', sortable: true}
]

const CATALOG_ITEM_SIZE = 96

const app = angular.module('demo', [])
    .controller('WelcomeController', function ($scope) {
        $scope.staticTools = staticTools
        $scope.customTools = customTools

        $scope.sidebarItems = catalog.map((item, index) => ({
            id: index,
            title: item.icon.substring(12).substr(0, item.icon.substring(12).length - 4),
            icon: item.icon,
            originalInfo: item
        }))

        $scope.sidebarVisible = true
        $scope.onSidebarToggle = () => {
            $scope.sidebarVisible = !$scope.sidebarVisible
        }

        ///////////////////////////////////
        // drop catalog item
        ///////////////////////////////////

        let startPos:IPoint
        let draggingItem:JQuery | undefined
        let downItemElement:JQuery
        let downItemInfo:ICatalogItemInfo
        let startOffsetX
        let startOffsetY

        $scope.onItemDown = (e, item) => {
            e.preventDefault()
            downItemElement = $(e.currentTarget)
            downItemInfo = item.originalInfo
            startPos = {x: e.clientX, y: e.clientY}
            startOffsetX = e.offsetX
            startOffsetY = e.offsetY
            document.addEventListener('mousemove', onMove)
            document.addEventListener('mouseup', onUp)
        }

        function onMove(e) {
            if (draggingItem) {
                updateDraggingItemPosition(e.clientX, e.clientY)
            } else if (Math.abs(startPos.x - e.clientX) > 5 || Math.abs(startPos.y - e.clientY) > 5) {
                Sortable.onCatalogItemDown(downItemInfo)
                draggingItem = createDraggingPlaceholder()
                updateDraggingItemPosition(e.clientX, e.clientY)
                $(document.body).append(draggingItem)
            }
        }

        function updateDraggingItemPosition(clientX, clientY) {
            if (draggingItem) {
                let x = clientX - startOffsetX
                let y = clientY - startOffsetY
                draggingItem.css({transform: `translateX(${Math.round(x)}px) translateY(${Math.round(y)}px)`})
                Sortable.onCatalogItemMove(x + CATALOG_ITEM_SIZE / 2, y + CATALOG_ITEM_SIZE / 2)
            }
        }

        function onUp(e) {
            if (draggingItem) {
                if (Sortable.onCatalogItemUp(downItemInfo)) {
                    draggingItem.remove()
                } else if (e.clientX > 360) {
                    if (downItemInfo.droppable) {
                        draggingItem.remove()
                        Sortable.createWidgetDummy(e.clientX, e.clientY)
                    } else {
                        draggingItem.remove()
                        Sortable.showWarning()
                    }
                } else {
                    runRemoveAnimation(draggingItem)
                }
                draggingItem = undefined
            }
            document.removeEventListener('mousemove', onMove)
            document.removeEventListener('mouseup', onUp)
        }

        function runRemoveAnimation(element) {
            element.addClass('dragging-catalog-item--removing')
            element.css({
                transform: `translateX(${startPos.x - startOffsetX}px) translateY(${startPos.y - startOffsetY}px)`,
                opacity: 0
            })
            setTimeout(() => {
                element.remove()
            }, 300)
        }

        function createDraggingPlaceholder():JQuery {
            let el = downItemElement.clone()
            el.addClass('dragging-catalog-item')
            el.find('.sidebar-item__title').remove()
            return el
        }
    })

Sortable.register(app)

angular.bootstrap(document, ['demo'])