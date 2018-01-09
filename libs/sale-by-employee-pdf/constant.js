
var FONT = {
    SIZE: {
        HEADER: 14,
        BIG: 11,
        CATALOG: 10,
        NORMAL: 9.5,
        SMALL: 8
    }

}

//DEFAULT 1(excel4node),50(pdfkit)
var ROW = {
    DEFAULT: 50
}
//----------table_layout

var TAB = {
    ITEMS: {
        INDEX: 50,
        TYPE: 80,
        GROUP: 150,
        ITEM: 230,
        QUANTITY: 320,
        AMOUNT: 370,
        LAST: 460
    },
    SUMMARY_CHART: {
        INDEX: 50,
        FOOD: 100,
        DRINK: 200,
        DESSERT: 300,
        OTHER: 400,
        LAST: 500
    }
}
var TAB_TABLE_GROUP = {
    ITEMS: {
        INDEX: TAB.ITEMS.INDEX,
        LAST: TAB.ITEMS.LAST
    },
}
var TEXT_PADDING = {
    LEFT: 5,
    RIGHT: -5,
    UP: 1,
    DOWN: 5
}

//--HEIGHT portrait 790,landscape 520
var PAGE_TYPE = {
    HEIGHT: 700,
    LANDSCAPE: {
        autoFirstPage: "false",
        layout: "landscape",
        size: "A4",
        margins: 10,
        top: 10, bottom: 10, left: 50, right: 10
    },
    PORTRAIT: {
        autoFirstPage: "false",
        layout: "portrait",
        size: "A4",
        margins: 10,
        top: 10, bottom: 10, left: 50, right: 10
    }
}

exports.FONT = FONT
exports.ROW = ROW
exports.TAB = TAB
exports.TAB_TABLE_GROUP = TAB_TABLE_GROUP
exports.PAGE_TYPE = PAGE_TYPE
exports.TEXT_PADDING = TEXT_PADDING