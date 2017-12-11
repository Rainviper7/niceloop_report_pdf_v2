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
        NAME: 70,
        QUANTITY: 330,
        AMOUNT: 380,
        PERCENT: 470,
        LAST: 520
    },
    TOPPING: {
        INDEX: 50,
        NAME: 70,
        QUANTITY: 330,
        LAST: 380
    },
    DELETED: {
        INDEX: 50,
        NAME: 70,
        QUANTITY: 330,
        AMOUNT: 380,
        LAST: 470
    },
    EXPENSE: {
        INDEX: 50,
        NAME: 70,
        AMOUNT: 380,
        PERCENT: 470,
        LAST: 520
    },
    CHART: {
        INDEX: 60,
        NAME: 75,
        AMOUNT: 185,
        LAST: 280
    },
    CHART_2: {
        INDEX: 350,
        LAST: 500
    },
    TABLE_LANDSCAPE: {
        INDEX: 50,
        LAST: 740
    }
}
var TAB_TABLE_GROUP = {
    ITEMS: {
        INDEX: TAB.ITEMS.INDEX,
        QUANTITY: TAB.ITEMS.QUANTITY,
        AMOUNT: TAB.ITEMS.AMOUNT,
        PERCENT: TAB.ITEMS.PERCENT,
        LAST: TAB.ITEMS.LAST
    },
    TOPPING: {
        INDEX: TAB.TOPPING.INDEX,
        QUANTITY: TAB.TOPPING.QUANTITY,
        LAST: TAB.TOPPING.LAST
    },
    DELETED: {
        INDEX: TAB.DELETED.INDEX,
        QUANTITY: TAB.DELETED.QUANTITY,
        AMOUNT: TAB.ITEMS.AMOUNT,
        LAST: TAB.DELETED.LAST
    },
    EXPENSE: {
        INDEX: TAB.EXPENSE.INDEX,
        AMOUNT: TAB.EXPENSE.AMOUNT,
        PERCENT: TAB.EXPENSE.PERCENT,
        LAST: TAB.EXPENSE.LAST
    }
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
        margins: 10,
        top: 10, bottom: 10, left: 50, right: 10
    },
    PORTRAIT: {
        autoFirstPage: "false",
        layout: "portrait",
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