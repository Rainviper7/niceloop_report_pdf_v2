
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
        TIME:80,
        REFER:155,
        USER:190,
        QUANTITY:250,
        ITEM:280,
        AMOUNT:400,
        COMMENT:460,
        LAST: 550
    },
    TABLE_LANDSCAPE: {
        INDEX: 50,
        LAST: 740
    }
}
var TAB_TABLE_GROUP = {
    ITEM: {
        INDEX: TAB.ITEMS.INDEX,
        TIME: TAB.ITEMS.TIME,
        REFER: TAB.ITEMS.REFER,
        USER: TAB.ITEMS.USER,
        QUANTITY: TAB.ITEMS.QUANTITY,
        ITEM: TAB.ITEMS.ITEM,
        AMOUNT: TAB.ITEMS.AMOUNT,
        COMMENT:TAB.ITEMS.COMMENT,
        LAST:TAB.ITEMS.LAST
    },
}
var TEXT_PADDING = {
    LEFT: 5,
    RIGHT: -5,
    UP:2,
    DOWN:5
}

//--HEIGHT portrait 790,landscape 520
var PAGE_TYPE = {
    HEIGHT: 690,
    MAGIN: {
        margins: 10,
        top: 10, bottom: 10, left: 50, right: 50
    }
}

// var STYLES_FONT = {
//     NORMAL: {
//         align: 'left'
//     },
//     ITEM:{
//         width:TAB.ITEMS.AMOUNT-TAB.ITEMS.ITEM+TEXT_PADDING.RIGHT,
//         align: 'left'
//     },
//     AMOUNT:{
//         width:TAB.ITEMS.COMMENT-TAB.ITEMS.AMOUNT,
//         align: 'right'
//     },
//     COMMENT:{
//         width:TAB.ITEMS.LAST-TAB.ITEMS.COMMENT+TEXT_PADDING.RIGHT,
//         align: 'left'
//     },

//     HEADER: {
//         width: TAB.ITEMS.LAST - TAB.ITEMS.INDEX,
//         align: 'left'
//     },
//     HILIGHT: {

//     }

   
// }

exports.FONT = FONT
exports.ROW = ROW
exports.TAB = TAB
// exports.STYLES_FONT = STYLES_FONT
exports.TAB_TABLE_GROUP = TAB_TABLE_GROUP
exports.PAGE_TYPE = PAGE_TYPE
exports.TEXT_PADDING = TEXT_PADDING