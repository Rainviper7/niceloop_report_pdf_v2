
var FONT = {
    NAME: 'Arial',
    ITALIC:'',
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
    TABLE: {
        INDEX: 50,
        ORDERID:80,
        DATE:120,
        REFER:190,
        TYPE:230,
        SHIFT:270,
        CASHIER:310,
        GRANDTOTAL:350,
        SERVICE:400,
        ITEMDISCOUNT:440,
        DISCOUNT:485,
        VAT:530,
        LAST: 560
    },
    TABLE_LANDSCAPE: {
        INDEX: 50,
        ORDERID:80,
        DATE:130,
        REFER:210,
        TYPE:240,
        SHIFT:335,
        CASHIER:375,
        GRANDTOTAL:455,
        SUBTOTAL:530,
        SERVICE:580,
        ITEMDISCOUNT:620,
        DISCOUNT:665,
        VAT:710,
        LAST: 740
    }

}
//--HEIGHT portrait 790,landscape 610
var PAGE_TYPE={
        HEIGHT: 520,
        MAGIN:{
            margins: 10,
            top: 10, bottom: 10, left: 50, right: 50
        }
}

var STYLES_FONT = {
    COLOR :{
        LIGHT_GRAY:{ 
            font: { 
                color: "#a0a0a0" 
            } 
        }
    },
    NORMAL: {
        font: {
            name: FONT.NAME,
            size: FONT.SIZE.NORMAL
        },
        alignment: {
            horizontal: 'left'
        }
    },
    NORMAL_RIGHT: {
        font: {
            name: FONT.NAME,
            size: FONT.SIZE.NORMAL
        },
        alignment: {
            horizontal: 'right'
        }
    },

    INDEX: {
        font: {
            name: FONT.NAME,
            size: FONT.SIZE.NORMAL
        },
        alignment: {
            horizontal: 'left'
        },
        numberFormat: '#.'
    },

    BOLD: {
        font: {
            name: FONT.NAME,
            size: FONT.SIZE.NORMAL,
            bold: true
        },
        alignment: {
            horizontal: 'left'
        }
    },

    AMOUNT: {
        font: {
            name: FONT.NAME,
            size: FONT.SIZE.CATALOG,
            bold: true
        },
        alignment: {
            horizontal: 'left'
        }
    },

    HEADER: {
        font: {
            name: FONT.NAME,
            size: FONT.SIZE.HEADER
        }
    },

    CATALOG_BOLD: {
        font: {
            name: FONT.NAME,
            size: FONT.SIZE.CATALOG,
            bold: true
        },
        alignment: {
            horizontal: 'left'
        }
    },

    SMALL: {
        font: {
            name: FONT.NAME,
            size: FONT.SIZE.SMALL
        }
    },

    BIG: {
        font: {
            name: FONT.NAME,
            size: FONT.SIZE.BIG
        }
    },

    NUMBER_AMOUT: {
        numberFormat: "฿ #,##0.00"
    },

    PERCENT: { //normal_right
        alignment:
        {
            horizontal: 'right'
        }
    },

    HILIGHT: {
        fill: { // §18.8.20 fill (Fill)
            type: "pattern", // Currently only "pattern" is implimented. Non-implimented option is "gradient"
            patternType: "solid", //§18.18.55 ST_PatternType (Pattern Type)
            bgColor: "white", // HTML style hex value. optional. defaults to black
            // fgColor: "#C0C0C0" // lightgray
            fgColor: "#F0F0F0" // lightgray
        }
    },

    SUM:{
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
        border: { // §18.8.4 border (Border)
            left: {
                style: "thin", //§18.18.3 ST_BorderStyle (Border Line Styles) ["none", "thin", "medium", "dashed", "dotted", "thick", "double", "hair", "mediumDashed", "dashDot", "mediumDashDot", "dashDotDot", "mediumDashDotDot", "slantDashDot"]
                color: "#000000" // HTML style hex value
            }
        }
    },

    UNDERLINE: {
        border: { // §18.8.4 border (Border)
            bottom: {
                style: "thin", //§18.18.3 ST_BorderStyle (Border Line Styles) ["none", "thin", "medium", "dashed", "dotted", "thick", "double", "hair", "mediumDashed", "dashDot", "mediumDashDot", "dashDotDot", "mediumDashDotDot", "slantDashDot"]
                color: "#000000" // HTML style hex value
            }
        }
    },

    UPPERLINE: {
        border: { // §18.8.4 border (Border)
            top: {
                style: "thin", //§18.18.3 ST_BorderStyle (Border Line Styles) ["none", "thin", "medium", "dashed", "dotted", "thick", "double", "hair", "mediumDashed", "dashDot", "mediumDashDot", "dashDotDot", "mediumDashDotDot", "slantDashDot"]
                color: "#000000" // HTML style hex value
            }
        }
    },

    DOUBLELINE: {
        border: { // §18.8.4 border (Border)
            bottom: {
                style: "double", //§18.18.3 ST_BorderStyle (Border Line Styles) ["none", "thin", "medium", "dashed", "dotted", "thick", "double", "hair", "mediumDashed", "dashDot", "mediumDashDot", "dashDotDot", "mediumDashDotDot", "slantDashDot"]
                color: "#000000" // HTML style hex value
            }
        }
    },

    DASHLINE: {
        border: { // §18.8.4 border (Border)
            bottom: {
                style: "dashed", //§18.18.3 ST_BorderStyle (Border Line Styles) ["none", "thin", "medium", "dashed", "dotted", "thick", "double", "hair", "mediumDashed", "dashDot", "mediumDashDot", "dashDotDot", "mediumDashDotDot", "slantDashDot"]
                color: "#A0A0A0" // HTML style hex value
            }
        }
    }


}

exports.FONT = FONT
exports.ROW = ROW
exports.COLUMN = COLUMN
exports.TAB = TAB
exports.STYLES_FONT = STYLES_FONT
exports.STYLES_BORDER = STYLES_BORDER
exports.PAGE_TYPE=PAGE_TYPE