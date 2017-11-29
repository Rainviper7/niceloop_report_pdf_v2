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
        BILLS: 150,
        TOTAL: 240,
        PAYMENTTYPE: 310,
        SUBTOTAL: 430,
        ITEMDISCOUNT: 500,
        SERVICE: 580,
        DISCOUNT: 650,
        VAT: 700,
        LAST: 740
    },
}

var TABLE_LANDSCAPE = {
    INDEX: TAB.ITEMS.INDEX,
    BILLS: TAB.ITEMS.BILLS,
    TOTAL: TAB.ITEMS.TOTAL,
    PAYMENTTYPE: TAB.ITEMS.PAYMENTTYPE,
    SUBTOTAL: TAB.ITEMS.SUBTOTAL,
    ITEMDISCOUNT: TAB.ITEMS.ITEMDISCOUNT,
    SERVICE: TAB.ITEMS.SERVICE,
    DISCOUNT: TAB.ITEMS.DISCOUNT,
    VAT: TAB.ITEMS.VAT,
    LAST: TAB.ITEMS.LAST
}

var TAB_TABLE_GROUP = {
    ITEM: {
        INDEX: TAB.ITEMS.INDEX,
        BILLS: TAB.ITEMS.BILLS,
        TOTAL: TAB.ITEMS.TOTAL,
        PAYMENTTYPE: TAB.ITEMS.PAYMENTTYPE,
        SUBTOTAL: TAB.ITEMS.SUBTOTAL,
        ITEMDISCOUNT: TAB.ITEMS.ITEMDISCOUNT,
        SERVICE: TAB.ITEMS.SERVICE,
        DISCOUNT: TAB.ITEMS.DISCOUNT,
        VAT: TAB.ITEMS.VAT,
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
    HEIGHT: 530,
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

var STYLES_FONT = {
    NORMAL: {
        align: 'left'
    },
    HEADER: {
        width: TAB.ITEMS.LAST - TAB.ITEMS.INDEX,
        align: 'left'
    }
}

exports.FONT = FONT
exports.ROW = ROW
exports.COLUMN = COLUMN
exports.TAB = TAB
exports.STYLES_FONT = STYLES_FONT
exports.TABLE_LANDSCAPE = TABLE_LANDSCAPE
exports.TAB_TABLE_GROUP = TAB_TABLE_GROUP
exports.PAGE_TYPE = PAGE_TYPE
exports.TEXT_PADDING = TEXT_PADDING