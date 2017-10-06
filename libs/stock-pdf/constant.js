
var FONT = {
    NAME: '',
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

var COLUMN = {
    width: {
        INDEX: 3,
        NAME: 21,
        COUNT: 6,
        AMOUNT: 15
    }

}

//----------table_layout
var TAB = {
    ITEM: {
        INDEX: 50,
        NAME:80,
        BEGIN:270,
        ADD:310,
        SOLD:350,
        ADJUST:380,
        WITHDRAW:420,
        RETURN:470,
        END:510,
        LAST: 550
    },
    TABLE_LANDSCAPE: {
        INDEX: 50,
        LAST: 740
    }
}
var TAB_TABLE_GROUP = {
    ITEM: {
        INDEX: TAB.ITEM.INDEX,
        LAST:TAB.ITEM.LAST
    },
}
var TEXT_PADDING = {
    LEFT: 5,
    RIGHT: -5
}

//--HEIGHT portrait 790,landscape 520
var PAGE_TYPE = {
    HEIGHT: 690,
    MAGIN: {
        margins: 10,
        top: 10, bottom: 10, left: 50, right: 50
    }
}

var STYLES_FONT = {
    COLOR: {
        LIGHT_GRAY: {
            font: {
                color: "#a0a0a0"
            }
        }
    },
    NORMAL: {
        align: 'left'
    },
    HEADER: {
        width: TAB.ITEM.LAST - TAB.ITEM.INDEX,
        align: 'left'
    },
    HILIGHT: {

    },

    SUM: {
        font: {
            name: FONT.NAME,
            size: FONT.SIZE.BIG,
            bold: true
        },
        fill: { // §18.8.20 fill (Fill)
            type: "pattern", // Currently only "pattern" is implimented. Non-implimented option is "gradient"
            patternType: "solid", //§18.18.55 ST_PatternType (Pattern Type)
            //bgColor: "yellow", // HTML style hex value. optional. defaults to black
            fgColor: "yellow"
        }
    }
}


var STYLES_BORDER = {

    COLUMN: {

    },

    UNDERLINE: {

    },

    UPPERLINE: {

    },

    DOUBLELINE: {

    },

    DASHLINE: {

    }


}

exports.FONT = FONT
exports.ROW = ROW
exports.COLUMN = COLUMN
exports.TAB = TAB
exports.STYLES_FONT = STYLES_FONT
// exports.STYLES_BORDER = STYLES_BORDER
exports.TAB_TABLE_GROUP = TAB_TABLE_GROUP
exports.PAGE_TYPE = PAGE_TYPE
exports.TEXT_PADDING = TEXT_PADDING