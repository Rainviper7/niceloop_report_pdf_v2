
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
    DEFAULT: 50,
    HEIGHT: 13
}

//----------table_layout
var TAB = {
    ITEMS: {
        INDEX: 50,
        TIME: 80,
        REFER: 160,
        USER: 200,
        QUANTITY: 270,
        ITEM: 300,
        AMOUNT: 420,
        REASON: 470,
        LAST: 550
    }
}
var TAB_TABLE_GROUP = {
    ITEMS: {
        INDEX: TAB.ITEMS.INDEX,
        QUANTITY: TAB.ITEMS.QUANTITY,
        AMOUNT: TAB.ITEMS.AMOUNT,
        PERCENT: TAB.ITEMS.PERCENT,
        LAST: TAB.ITEMS.LAST
    }
}
var TEXT_PADDING = {
    LEFT: 5,
    RIGHT: -5,
    UP: 2,
    DOWN: 5
}

//--HEIGHT portrait 790,landscape 520
var PAGE_TYPE = {
    HEIGHT: 690,
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