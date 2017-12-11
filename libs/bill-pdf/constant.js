
var FONT = {
    SIZE: {
        HEADER: 14,
        BIG: 11,
        CATALOG: 9.5,
        NORMAL: 9,
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
    TABLE: {
        INDEX: 50,
        ORDERID: 80,
        DATE: 120,
        REFER: 190,
        TYPE: 230,
        SHIFT: 270,
        CASHIER: 310,
        GRANDTOTAL: 350,
        SERVICE: 400,
        ITEMDISCOUNT: 440,
        DISCOUNT: 485,
        VAT: 530,
        LAST: 560
    },
    TABLE_LANDSCAPE: {
        INDEX: 50,
        ORDERID: 80,
        DATE: 130,
        REFER: 210,
        TYPE: 240,
        SHIFT: 335,
        CASHIER: 375,
        GRANDTOTAL: 455,
        SUBTOTAL: 530,
        SERVICE: 580,
        ITEMDISCOUNT: 620,
        DISCOUNT: 665,
        VAT: 710,
        LAST: 790
    }

}
var TEXT_PADDING = {
    LEFT: 5,
    RIGHT: -5,
    UP: 2,
    DOWN: 5,
    UPPER_TIME: 3,
    UPPER_SMALL: 3
}

//--size A4 HEIGHT paper: portrait 840,landscape 520
var PAGE_TYPE = {
    HEIGHT: 520,
    LANDSCAPE: {
        size: "A4",
        autoFirstPage: "false",
        layout: "landscape",
        margins: 10,
        top: 10, bottom: 10, left: 50, right: 10
    },
    PORTRAIT: {
        size: "A4",
        autoFirstPage: "false",
        layout: "portrait",
        margins: 10,
        top: 10, bottom: 10, left: 50, right: 10
    }
}

exports.FONT = FONT
exports.ROW = ROW
exports.TAB = TAB
exports.PAGE_TYPE = PAGE_TYPE
exports.TEXT_PADDING = TEXT_PADDING