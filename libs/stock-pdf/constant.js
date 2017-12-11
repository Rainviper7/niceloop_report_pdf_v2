
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
        NAME: 80,
        BEGIN: 270,
        ADD: 310,
        SOLD: 350,
        ADJUST: 380,
        WITHDRAW: 420,
        RETURN: 470,
        END: 510,
        LAST: 550
    },
    TABLE_LANDSCAPE: {
        INDEX: 50,
        LAST: 740
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