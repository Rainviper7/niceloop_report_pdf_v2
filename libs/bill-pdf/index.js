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
var TEXT_SPACE_LOWER = 5,
    TEXT_SPACE_UPPER = 2,
    TEXT_SPACE_UPPER_TIME = 3,
    TEXT_SPACE_UPPER_SMALL = 3,
    TEXT_SPACE = C.FONT.SIZE.NORMAL + TEXT_SPACE_LOWER + 1,//--fix code
    TEXT_SPACE_NORMAL = C.FONT.SIZE.NORMAL,
    TEXT_SPACE_SMALL = C.FONT.SIZE.SMALL,
    ROW_CURRENT = C.ROW.DEFAULT,
    hilight = false,
    row_hilight = 0,
    line_tick = 0.4, //default 0.8
    report_type = "รายงานบิลการขาย",
    header_table = ["No.", "OderId", "Date", "Table", "Type", "Shift", "Cashier", "GranTotal", "SubTotal", "ServiceCharge", "Item    Discount", "Discount", "Vat"],
    header_table_pointer = ["INDEX", "ORDERID", "DATE", "REFER", "TYPE", "SHIFT", "CASHIER", "GRANDTOTAL", "SUBTOTAL", "SERVICE", "ITEMDISCOUNT", "DISCOUNT", "VAT"]//--fixcode
    ;

//--style
var TEXT_padding = {
    left: 5,
    right: -5
},
    SET_PAGE_LANDSCAPE = {
        layout: "landscape"
    },//--fixcode
    SET_HEADER_WIDTH =
        {
            width: 500,
            align: 'left'
        }//--fixcode
    ;

// function Report(pathPdf, data, shopname) {
exports.Report = function (options, callback) {
    var _path = options.filePath,
        _data = options.data,
        filename = _path,
        data = _data,
        shopname = options.shopname
        ;

    //-----
    var dailyReport = new pdf({
        autoFirstPage: false,
        size: "A4"
    });

    dailyReport.addPage(SET_PAGE_LANDSCAPE)

    var now = new Date(),
        datetime = moment(now).format("DD MMMM YYYY, HH:mm:ss")
        ;

    //----set font
    var fontpath = path.join(__dirname, 'fonts', 'droidsansth.ttf'),
        fontpath_bold = path.join(__dirname, 'fonts', 'arialbd.ttf'),
        fontpath_bold_bath = path.join(__dirname, 'fonts', 'cambriab.ttf'),
        fontpath_italic = path.join(__dirname, 'fonts', 'ariali.ttf')
        ;

    dailyReport.registerFont('font_style_normal', fontpath, '')
    dailyReport.registerFont('font_style_bold', fontpath_bold, '')
    dailyReport.registerFont('font_style_bold_bath', fontpath_bold_bath, '')
    dailyReport.registerFont('font_style_italic', fontpath_italic, '')


    dailyReport.font('font_style_bold')//--font_style
    dailyReport.font('font_style_normal')

    buildPdf();
    // return {
    //     buildPdf: buildPdf 
    // }//cloud

    function buildPdf() {

        console.log("--Report module, Start...");
        main();
        console.log("--Complete : " + filename);

        setTimeout(function () {
            callback(filename);
        }, 600);
    }

    //------------function
    function main() {

        dailyReport.pipe(fs.createWriteStream(filename));

        dailyReport.font('font_style_normal')
        drawHeader();
        drawBody();
        drawFooter();
        dailyReport.end();

    }

    function drawHeader() {

        dailyReport.fontSize(C.FONT.SIZE.HEADER)
            .text(shopname, C.TAB.TABLE_LANDSCAPE.INDEX, ROW_CURRENT, SET_HEADER_WIDTH);

        NewLine(C.FONT.SIZE.HEADER + TEXT_SPACE_LOWER);

        dailyReport.fontSize(C.FONT.SIZE.HEADER)
            .text(report_type, C.TAB.TABLE_LANDSCAPE.INDEX, ROW_CURRENT, SET_HEADER_WIDTH);

        NewLine(C.FONT.SIZE.HEADER + TEXT_SPACE);

        utils.addGennerateDate(pdfReport, C.TAB.TABLE_LANDSCAPE, ROW_CURRENT, C.FONT.SIZE.SMALL);

        dailyReport.fillColor('black');

        NewLine(TEXT_SPACE);

    }

    function drawBody() {
        console.log("- building bills report ");

        NewLine(TEXT_SPACE);

        utils.addTableLine(pdfReport, ROW_CURRENT, C.TAB.TABLE_LANDSCAPE.INDEX, C.TAB.TABLE_LANDSCAPE.LAST)

        //--column title
        _.forEach(header_table_pointer, function (text, index) {

            dailyReport.font('font_style_bold').fontSize(C.FONT.SIZE.NORMAL)
                .text(header_table[index], C.TAB.TABLE_LANDSCAPE[text] + TEXT_padding.left, ROW_CURRENT + 2, {
                    width: C.TAB.TABLE_LANDSCAPE[header_table_pointer[index + 1]]
                        - C.TAB.TABLE_LANDSCAPE[header_table_pointer[index]] + TEXT_padding.right,
                    align: 'left'
                })//--fix code

        })

        dailyReport.font('font_style_normal')


        _.forEach(C.TAB.TABLE_LANDSCAPE
            , function (value, key) {
                addColumnLine(value);
            })

        NewLine(TEXT_SPACE)

        _.forEach(C.TAB.TABLE_LANDSCAPE
            , function (value, key) {
                addColumnLine(value);
            })

        NewLine(TEXT_SPACE)

        utils.addTableLine(pdfReport, ROW_CURRENT, C.TAB.TABLE_LANDSCAPE.INDEX, C.TAB.TABLE_LANDSCAPE.LAST)

        //---detail data

        _.forEach(data, function (detail, index) {
            _.forEach(detail.Orders, function (record1, index1) {

                if (((index1 + 1) % 2) == 1) {

                    hilight = true
                }

                if (hilight) {
                    addHilight(ROW_CURRENT, TEXT_SPACE);

                    utils.addTableLine(pdfReport, ROW_CURRENT, C.TAB.TABLE_LANDSCAPE.INDEX, C.TAB.TABLE_LANDSCAPE.LAST)
                }


                addItem(record1, index1)


                _.forEach(C.TAB.TABLE_LANDSCAPE
                    , function (value, key) {
                        addColumnLine(value);
                    })

                NewLine(TEXT_SPACE)

                // if (false) {
                if (record1.Note) {
                    if (hilight) {
                        addHilight(ROW_CURRENT, TEXT_SPACE * lineCount(record1.Note));
                    }

                    addRemark(record1.Note)

                    //--dynamic remark newline
                    for (var i = 0; i < lineCount(record1.Note); i++) {
                        _.forEach(C.TAB.TABLE_LANDSCAPE
                            , function (value, key) {
                                addColumnLine(value);
                            })
                        NewLine(TEXT_SPACE)
                    }


                    utils.addTableLine(pdfReport, ROW_CURRENT, C.TAB.TABLE_LANDSCAPE.INDEX, C.TAB.TABLE_LANDSCAPE.LAST)
                }
                else {

                    utils.addTableLine(pdfReport, ROW_CURRENT, C.TAB.TABLE_LANDSCAPE.INDEX, C.TAB.TABLE_LANDSCAPE.LAST)

                }

                hilight = false

            })

        })

        utils.addTableLine(pdfReport, ROW_CURRENT, C.TAB.TABLE_LANDSCAPE.INDEX, C.TAB.TABLE_LANDSCAPE.LAST)
        NewLine(TEXT_SPACE)


    }

    function drawFooter() {

        //--footer

        utils.addTableLine(pdfReport, ROW_CURRENT, C.TAB.TABLE_LANDSCAPE.INDEX, C.TAB.TABLE_LANDSCAPE.LAST)

        utils.addGennerateDate(pdfReport, C.TAB.TABLE_LANDSCAPE, ROW_CURRENT, C.FONT.SIZE.SMALL);

        dailyReport.fillColor('black');

        NewLine(TEXT_SPACE);

    }

    function lineCount(str) {
        var remark_lenght = str.length * C.FONT.SIZE.SMALL
        var grandtotal_width = C.TAB.TABLE_LANDSCAPE.LAST - C.TAB.TABLE_LANDSCAPE.GRANDTOTAL
        var line_count = remark_lenght / grandtotal_width
        return Number(line_count.toFixed(0))
    }

    function lineCount2(str) {
        var remark_lenght = str.length * C.FONT.SIZE.NORMAL
        var type_width = C.TAB.TABLE_LANDSCAPE.SHIFT - C.TAB.TABLE_LANDSCAPE.TYPE
        var line_count = (remark_lenght / type_width)
        return Number(line_count.toFixed(0))
    }

    function addItem(record, index) {


        var t1 = "#" + record.OrderId,
            gtt1 = numberWithCommas2(record.GrandTotal.toFixed(2)),
            record_options = {
                width: C.TAB.TABLE_LANDSCAPE[header_table_pointer[index + 1]]
                    - C.TAB.TABLE_LANDSCAPE[header_table_pointer[index]],
                align: 'left'
            },
            record_options2 = {
                width: C.TAB.TABLE_LANDSCAPE[header_table_pointer[index + 1]]
                    - C.TAB.TABLE_LANDSCAPE[header_table_pointer[index]],
                align: 'right'
            }
            ;

        dailyReport.fontSize(C.FONT.SIZE.NORMAL)
            .text(record.Id, C.TAB.TABLE_LANDSCAPE.INDEX + TEXT_padding.left, ROW_CURRENT + TEXT_SPACE_UPPER, record_options)
            .text(t1, C.TAB.TABLE_LANDSCAPE.ORDERID + TEXT_padding.left, ROW_CURRENT + TEXT_SPACE_UPPER, record_options)
            ;
        dailyReport.font('font_style_bold').fontSize(C.FONT.SIZE.NORMAL).text(moment(record.OrderDate).format("HH:mm:ss "), C.TAB.TABLE_LANDSCAPE.DATE + TEXT_padding.left, ROW_CURRENT + TEXT_SPACE_UPPER_TIME, {
            width: C.TAB.TABLE_LANDSCAPE.REFER - C.TAB.TABLE_LANDSCAPE.DATE,
            align: 'left'
        })
            ;
        dailyReport.font('font_style_normal').fontSize(C.FONT.SIZE.NORMAL)
            .text("                " + moment(record.OrderDate).format("DD-MM"), C.TAB.TABLE_LANDSCAPE.DATE + TEXT_padding.left, ROW_CURRENT + TEXT_SPACE_UPPER, {
                width: C.TAB.TABLE_LANDSCAPE.REFER - C.TAB.TABLE_LANDSCAPE.DATE,
                align: 'left'
            })
            .text(record.Table, C.TAB.TABLE_LANDSCAPE.REFER + TEXT_padding.left, ROW_CURRENT + TEXT_SPACE_UPPER, {
                width: C.TAB.TABLE_LANDSCAPE.REFER - C.TAB.TABLE_LANDSCAPE.DATE,
                align: 'left'
            })

            .text(record.ShiftWork, C.TAB.TABLE_LANDSCAPE.SHIFT + TEXT_padding.left, ROW_CURRENT + TEXT_SPACE_UPPER, record_options)
            .text(record.User, C.TAB.TABLE_LANDSCAPE.CASHIER + TEXT_padding.left, ROW_CURRENT + TEXT_SPACE_UPPER, record_options)
            ;
        dailyReport.font('font_style_bold_bath').fontSize(C.FONT.SIZE.NORMAL).text("฿", C.TAB.TABLE_LANDSCAPE.GRANDTOTAL + TEXT_padding.left, ROW_CURRENT + TEXT_SPACE_UPPER, {
            width: C.TAB.TABLE_LANDSCAPE.SUBTOTAL - C.TAB.TABLE_LANDSCAPE.GRANDTOTAL,
            align: 'left'
        })
        dailyReport.font('font_style_bold').fontSize(C.FONT.SIZE.NORMAL).text("    " + gtt1, C.TAB.TABLE_LANDSCAPE.GRANDTOTAL + TEXT_padding.left, ROW_CURRENT + TEXT_SPACE_UPPER, {
            width: C.TAB.TABLE_LANDSCAPE.SUBTOTAL - C.TAB.TABLE_LANDSCAPE.GRANDTOTAL,
            align: 'left'
        })
            ;
        dailyReport.font('font_style_italic').fontSize(C.FONT.SIZE.SMALL).fillColor('#333333')
            .text(record.SubTotal.toFixed(2), C.TAB.TABLE_LANDSCAPE.SUBTOTAL + TEXT_padding.right, ROW_CURRENT + TEXT_SPACE_UPPER_SMALL, {
                width: C.TAB.TABLE_LANDSCAPE.SERVICE - C.TAB.TABLE_LANDSCAPE.SUBTOTAL,
                align: 'right'
            })
            .text(record.ServiceCharge, C.TAB.TABLE_LANDSCAPE.SERVICE + TEXT_padding.right, ROW_CURRENT + TEXT_SPACE_UPPER_SMALL, {
                width: C.TAB.TABLE_LANDSCAPE.ITEMDISCOUNT - C.TAB.TABLE_LANDSCAPE.SERVICE,
                align: 'right'
            })
            .text(record.ItemDiscount.toFixed(2), C.TAB.TABLE_LANDSCAPE.ITEMDISCOUNT + TEXT_padding.right, ROW_CURRENT + TEXT_SPACE_UPPER_SMALL, {
                width: C.TAB.TABLE_LANDSCAPE.DISCOUNT - C.TAB.TABLE_LANDSCAPE.ITEMDISCOUNT,
                align: 'right'
            })
            .text(record.Discount.toFixed(2), C.TAB.TABLE_LANDSCAPE.DISCOUNT + TEXT_padding.right, ROW_CURRENT + TEXT_SPACE_UPPER_SMALL, {
                width: C.TAB.TABLE_LANDSCAPE.VAT - C.TAB.TABLE_LANDSCAPE.DISCOUNT,
                align: 'right'
            })
            .text(record.Vat, C.TAB.TABLE_LANDSCAPE.VAT + TEXT_padding.right, ROW_CURRENT + TEXT_SPACE_UPPER_SMALL, {
                width: C.TAB.TABLE_LANDSCAPE.LAST - C.TAB.TABLE_LANDSCAPE.VAT,
                align: 'right'
            })
            ;
        dailyReport.font('font_style_normal').fillColor('black');

        dailyReport.fontSize(C.FONT.SIZE.NORMAL)
            .text(record.PaymentType, C.TAB.TABLE_LANDSCAPE.TYPE + TEXT_padding.left, ROW_CURRENT + TEXT_SPACE_UPPER, {
                width: C.TAB.TABLE_LANDSCAPE.SHIFT - C.TAB.TABLE_LANDSCAPE.TYPE,
                align: 'left'
            })
            ;                    //--dynamic remark newline
        for (var i = 0; i < lineCount2(record.PaymentType); i++) {
            _.forEach(C.TAB.TABLE_LANDSCAPE
                , function (value, key) {
                    addColumnLine(value);
                })

            NewLine(TEXT_SPACE_NORMAL)
        }

    }

    function addRemark(record) {
        //--fix code
        dailyReport.font('font_style_normal').fontSize(C.FONT.SIZE.SMALL).fillColor('#333333')
            .text(record, C.TAB.TABLE_LANDSCAPE.GRANDTOTAL + TEXT_padding.left, ROW_CURRENT + TEXT_SPACE_UPPER, {
                width: C.TAB.TABLE_LANDSCAPE.LAST - C.TAB.TABLE_LANDSCAPE.GRANDTOTAL,
                align: 'left'
            })

        dailyReport.font('font_style_normal').fillColor('black');

    }

    function checkPositionOutsideArea() {

        if (ROW_CURRENT > C.PAGE_TYPE.HEIGHT) {

            dailyReport.addPage(SET_PAGE_LANDSCAPE);
            ROW_CURRENT = C.ROW.DEFAULT;

            if (hilight == true) {

                row_hilight = C.ROW.DEFAULT;

            }

        }

    }

    function NewLine(px) {
        ROW_CURRENT += px;
        checkPositionOutsideArea()
    }

    function addColumnLine(tab) {
        addTableLine(tab, ROW_CURRENT, tab, ROW_CURRENT + TEXT_SPACE);
    }

    function addHilight(position, row_height) {

        dailyReport.rect(C.TAB.TABLE_LANDSCAPE
            .INDEX, position, (C.TAB.TABLE_LANDSCAPE.LAST - C.TAB.TABLE_LANDSCAPE.INDEX), row_height).fill('#F0F0F0');
        // '#F0F0F0'
        // '#ddd'
        dailyReport.fill('black');
    }

    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    //--fix code
    function numberWithCommas2(x) {
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    }

}
