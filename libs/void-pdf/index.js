//----------import
const _ = require('lodash'),
    pdf = require('pdfkit'),
    fs = require('fs'),
    moment = require('moment'),
    path = require('path'),
    C = require('./constant'),
    utils = require('../utils')
    ;

//---------constant
//---[610,790]
var TEXT_SPACE_LOWER = C.TEXT_PADDING.DOWN,
    TEXT_SPACE_UPPER = C.TEXT_PADDING.UP,
    TEXT_SPACE = C.FONT.SIZE.NORMAL + TEXT_SPACE_LOWER,
    TEXT_SPACE_SMALL = C.FONT.SIZE.SMALL,
    ROW_CURRENT = C.ROW.DEFAULT,
    isHilight = false,
    row_hilight = 0
    ;


//--fillter

//----------main---
exports.Report = function (options, callback) {
    var _path = options.filePath,
        _data = options.data,
        filename = _path,
        data = _data,
        shopname = options.shopname,
        cb = callback
        ;

    var ReportPdf = new pdf(C.PAGE_TYPE.PORTRAIT);

    var now = new Date(),
        datetime = moment(now).format("DD MMMM YYYY, HH:mm:ss"),
        report_type = "รายงานยกเลิกสินค้า"
        ;
    //--style
    var text_layout = {
        index: {
            title: "No.",
            position: C.TAB.ITEMS.INDEX + C.TEXT_PADDING.LEFT
        },
        time: {
            title: "Time",
            position: C.TAB.ITEMS.TIME + C.TEXT_PADDING.LEFT
        },
        refer: {
            title: "Refer",
            position: C.TAB.ITEMS.REFER + C.TEXT_PADDING.LEFT
        },
        user: {
            title: "ApproveBy",
            position: C.TAB.ITEMS.USER + C.TEXT_PADDING.LEFT
        },
        quantity: {
            title: "Qty",
            position: C.TAB.ITEMS.QUANTITY + C.TEXT_PADDING.LEFT
        },
        item: {
            title: "Items",
            position: C.TAB.ITEMS.ITEM + C.TEXT_PADDING.LEFT
        },
        amount: {
            title: "Price",
            position: C.TAB.ITEMS.AMOUNT + C.TEXT_PADDING.LEFT
        },
        comment: {
            title: "Reason",
            position: C.TAB.ITEMS.COMMENT + C.TEXT_PADDING.LEFT
        }
    }

    //----set font
    var fontpath = path.join(__dirname, 'fonts', 'droidsansth.ttf'),
        fontpath_bold = path.join(__dirname, 'fonts', 'arialbd.ttf'),
        fontpath_bold_bath = path.join(__dirname, 'fonts', 'cambriab.ttf')
        ;

    ReportPdf.registerFont('font_style_normal', fontpath, '')
        .registerFont('font_style_bold', fontpath_bold, '')
        ;

    ReportPdf.font('font_style_normal');

    if (process.env.DEV_MODE == 'true') {

        buildPdf();
    }
    else {

        return {
            buildPdf: buildPdf
        } //--cloud
    }

    function buildPdf() {

        console.log("--Report module, Start...");
        main();
        console.log("--Complete : " + filename);

        setTimeout(function () {
            callback(filename);
        }, 1500);

    }

    //------------function
    function main() {

        ReportPdf.pipe(fs.createWriteStream(filename));

        ReportPdf.font('font_style_normal')
        drawHeader();
        drawBody();
        drawFooter();
        ReportPdf.end();

    }

    function drawHeader() {

        var header_data = [
            shopname, report_type
        ];

        _.forEach(header_data, function (value, index) {
            ReportPdf.fontSize(C.FONT.SIZE.HEADER)
                .text(value, C.TAB.ITEMS.INDEX, ROW_CURRENT, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST));
            NewLine(C.FONT.SIZE.HEADER + TEXT_SPACE_LOWER);
        })

        NewLine(TEXT_SPACE_SMALL);

        utils.addGennerateDate(ReportPdf, C.TAB.ITEMS, ROW_CURRENT, C.FONT.SIZE.SMALL);

        ReportPdf.fillColor('black');
        NewLine(TEXT_SPACE);
        NewLine(TEXT_SPACE);
    }

    function drawBody() {

        addLineLocal(ReportPdf, C.TAB_TABLE_GROUP.ITEMS)

        addItemGroup(text_layout)

        _.forEach(C.TAB_TABLE_GROUP.ITEMS, function (tabValue, tabName) {
            addColumnLine(ReportPdf, tabValue)
        })

        NewLine(TEXT_SPACE)

        _.forEach(data.Voids, function (record, index) {
            //--add hilight item
            if (((index + 1) % 2) == 1) {

                utils.addHilight(ReportPdf, C.TAB_TABLE_GROUP.ITEMS, ROW_CURRENT, TEXT_SPACE)
            }

            addLineLocal(ReportPdf, C.TAB_TABLE_GROUP.ITEMS)

            addItems(record, index)

            _.forEach(C.TAB_TABLE_GROUP.ITEMS, function (tabValue, tabName) {
                addColumnLine(ReportPdf, tabValue)
            })

            NewLine(TEXT_SPACE)

            addLineLocal(ReportPdf, C.TAB_TABLE_GROUP.ITEMS)

        })

        addLineLocal(ReportPdf, C.TAB_TABLE_GROUP.ITEMS)

        NewLine(TEXT_SPACE)
    }

    function drawFooter() {

        addLineLocal(ReportPdf, C.TAB.ITEMS)
        utils.addGennerateDate(ReportPdf, C.TAB.ITEMS, ROW_CURRENT, C.FONT.SIZE.SMALL);
        ReportPdf.fillColor('black');

        NewLine(TEXT_SPACE);

    }

    function addItemGroup(itemgroup) {
        ReportPdf.font("font_style_bold").fontSize(C.FONT.SIZE.NORMAL)

        _.forEach(itemgroup, function (item, tab) {
            ReportPdf.fontSize(C.FONT.SIZE.NORMAL)
                .text(item.title, item.position, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST));
        })

        ReportPdf.font("font_style_normal");
    }

    function addItems(item, index) {

        var item_layout = {
            index: {
                title: index + 1 + ". ",
                position: C.TAB.ITEMS.INDEX + C.TEXT_PADDING.LEFT,
                style: styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.TIME)
            },
            time: {
                title: item.Date + "  " + item.Time,
                position: C.TAB.ITEMS.TIME + C.TEXT_PADDING.LEFT,
                style: styles_font_left(C.TAB.ITEMS.TIME, C.TAB.ITEMS.REFER)
            },
            refer: {
                title: item.Refer,
                position: C.TAB.ITEMS.REFER + C.TEXT_PADDING.LEFT,
                style: styles_font_left(C.TAB.ITEMS.REFER, C.TAB.ITEMS.USER)
            },
            user: {
                title: item.User,
                position: C.TAB.ITEMS.USER + C.TEXT_PADDING.LEFT,
                style: styles_font_left(C.TAB.ITEMS.USER, C.TAB.ITEMS.QUANTITY)
            },
            quantity: {
                title: item.Qty,
                position: C.TAB.ITEMS.QUANTITY + C.TEXT_PADDING.LEFT,
                style: styles_font_left(C.TAB.ITEMS.QUANTITY, C.TAB.ITEMS.ITEMS)
            },
            item: {
                title: item.Item,
                position: C.TAB.ITEMS.ITEM + C.TEXT_PADDING.LEFT,
                width: C.TAB.ITEMS.AMOUNT - C.TAB.ITEMS.ITEM,
                style: styles_font_left(C.TAB.ITEMS.ITEM, C.TAB.ITEMS.AMOUNT)

            },
            amount: {
                title: "฿ " + utils.numberWithCommas(item.Amount),
                position: C.TAB.ITEMS.AMOUNT + C.TEXT_PADDING.RIGHT,
                style: styles_font_right(C.TAB.ITEMS.AMOUNT, C.TAB.ITEMS.COMMENT)
            },
            comment: {
                title: item.Comment,
                position: C.TAB.ITEMS.COMMENT + C.TEXT_PADDING.LEFT,
                width: C.TAB.ITEMS.LAST - C.TAB.ITEMS.AMOUNT,
                style: styles_font_left(C.TAB.ITEMS.AMOUNT, C.TAB.ITEMS.LAST)
            }
        }

        _.forEach(item_layout, function (text_item, title_name) {
            ReportPdf.fontSize(C.FONT.SIZE.SMALL)
                .text(text_item.title, text_item.position, ROW_CURRENT + TEXT_SPACE_UPPER, text_item.style)
        })

        //--dynamic newline 
        // --fix code
        var dynamic_newline_item = false;
        for (var i = 0; i < lineCount(item.Item, item_layout.item.width + C.TEXT_PADDING.RIGHT); i++) {

            _.forEach(C.TAB.ITEMS, function (tabValue, tabName) {
                addColumnLine(ReportPdf, tabValue)
            })

            dynamic_newline_item = true
            NewLine(TEXT_SPACE)
        }
        //--dynamic newline
        if (dynamic_newline_item) {
            for (var i = 0; i < lineCount(item.Comment, item_layout.comment.width + C.TEXT_PADDING.RIGHT); i++) {

                _.forEach(C.TAB.ITEMS, function (tabValue, tabName) {
                    addColumnLine(ReportPdf, tabValue)
                })

                NewLine(TEXT_SPACE)
            }
        }
        dynamic_newline_item = false
    }
    //--dynamic lenght text
    //--fix code
    function lineCount(str, type_width) {
        var line_count = 0;
        var remark_lenght = str.length * (C.FONT.SIZE.SMALL / 2.1)
        if (remark_lenght > type_width) {
            line_count = (remark_lenght / type_width)
        }
        return Number(line_count.toFixed(0))
    }

    function checkPositionOutsideArea() {

        if (ROW_CURRENT > C.PAGE_TYPE.HEIGHT) {

            ReportPdf.addPage(C.PAGE_TYPE.PORTRAIT);
            ROW_CURRENT = C.ROW.DEFAULT;

            if (isHilight == true) {

                row_hilight = C.ROW.DEFAULT;

            }

        }

    }

    function NewLine(px) {

        ROW_CURRENT += px;
        checkPositionOutsideArea();
    }

    function addColumnLine(pdfReport, tab) {

        utils.addTableLine(pdfReport, ROW_CURRENT, tab, tab, ROW_CURRENT, ROW_CURRENT + TEXT_SPACE)
    }

    function addLineLocal(pdfReport, tab) {
        utils.addTableLine(pdfReport, ROW_CURRENT, tab.INDEX, tab.LAST)
    }

    function styles_font_left(tab_start, tab_end) {
        return {
            width: tab_end + C.TEXT_PADDING.RIGHT - tab_start,
            align: 'left'
        }
    }

    function styles_font_right(tab_start, tab_end) {
        return {
            width: tab_end - tab_start,
            align: 'right'
        }
    }

}