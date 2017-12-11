//----------import
const _ = require('lodash'),
    pdf = require('pdfkit'),
    fs = require('fs'),
    moment = require('moment'),
    path = require('path'),
    C = require('./constant'),
    utils = require('../utils')
    ;

exports.Report = function (options, callback) {
    var _path = options.filePath,
        _data = options.data,
        filename = _path,
        data = _data,
        shopname = options.shopname
        ;

    //---------constant
    var TEXT_SPACE = C.FONT.SIZE.NORMAL + C.TEXT_PADDING.DOWN + 1,//--fix code
        ROW_CURRENT = C.ROW.DEFAULT,
        hilight = false,
        row_hilight = 0
        ;

    var report_type = "รายงานบิลการขาย",
        header_table = ["No.", "OderId", "Date", "Table", "Type", "Shift", "Cashier", "GranTotal", "SubTotal", "Service Charge", "Item    Discount", "Discount", "Vat"],
        header_table_pointer = ["INDEX", "ORDERID", "DATE", "REFER", "TYPE", "SHIFT", "CASHIER", "GRANDTOTAL", "SUBTOTAL", "SERVICE", "ITEMDISCOUNT", "DISCOUNT", "VAT"]//--fixcode
        ;

    //-----
    var ReportPdf = new pdf(C.PAGE_TYPE.LANDSCAPE);

    var now = new Date(),
        datetime = moment(now).format("DD MMMM YYYY, HH:mm:ss")
        ;

    //----set font
    var fontpath = path.join(__dirname, 'fonts', 'droidsansth.ttf'),
        fontpath_bold = path.join(__dirname, 'fonts', 'arialbd.ttf'),
        fontpath_bold_bath = path.join(__dirname, 'fonts', 'cambriab.ttf'),
        fontpath_italic = path.join(__dirname, 'fonts', 'ariali.ttf')
        ;

    ReportPdf.registerFont('font_style_normal', fontpath, '')
    ReportPdf.registerFont('font_style_bold', fontpath_bold, '')
    ReportPdf.registerFont('font_style_bold_bath', fontpath_bold_bath, '')
    ReportPdf.registerFont('font_style_italic', fontpath_italic, '')


    ReportPdf.font('font_style_bold')//--font_style
    ReportPdf.font('font_style_normal')

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
        }, 600);
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

        ReportPdf.fontSize(C.FONT.SIZE.HEADER)
            .text(shopname, C.TAB.TABLE_LANDSCAPE.INDEX, ROW_CURRENT,
            styles_font_left(C.TAB.TABLE_LANDSCAPE.INDEX, C.TAB.TABLE_LANDSCAPE.LAST))
            ;
        NewLine(C.FONT.SIZE.HEADER + C.TEXT_PADDING.DOWN);

        ReportPdf.fontSize(C.FONT.SIZE.HEADER)
            .text(report_type, C.TAB.TABLE_LANDSCAPE.INDEX, ROW_CURRENT,
            styles_font_left(C.TAB.TABLE_LANDSCAPE.INDEX, C.TAB.TABLE_LANDSCAPE.LAST))
            ;
        NewLine(C.FONT.SIZE.HEADER + TEXT_SPACE);
        ReportPdf.fillColor('black');

        utils.addGennerateDate(ReportPdf, C.TAB.TABLE_LANDSCAPE, ROW_CURRENT, C.FONT.SIZE.SMALL);
        NewLine(TEXT_SPACE);

    }

    function drawBody() {
        console.log("- building bills report ");

        NewLine(TEXT_SPACE);

        addLineLocal(ReportPdf, C.TAB.TABLE_LANDSCAPE)

        //--column title
        _.forEach(header_table_pointer, function (text, index) {

            ReportPdf.font('font_style_bold').fontSize(C.FONT.SIZE.NORMAL)
                .text(header_table[index], C.TAB.TABLE_LANDSCAPE[text] + C.TEXT_PADDING.LEFT, ROW_CURRENT + 2,
                styles_font_left(C.TAB.TABLE_LANDSCAPE[header_table_pointer[index]] + C.TEXT_PADDING.RIGHT
                    , C.TAB.TABLE_LANDSCAPE[header_table_pointer[index + 1]]))

        })

        ReportPdf.font('font_style_normal')

        _.forEach(C.TAB.TABLE_LANDSCAPE, function (tabValue, tabName) {
            addColumnLine(ReportPdf, tabValue)
        })

        NewLine(TEXT_SPACE)

        _.forEach(C.TAB.TABLE_LANDSCAPE, function (tabValue, tabName) {
            addColumnLine(ReportPdf, tabValue)
        })

        NewLine(TEXT_SPACE)

        addLineLocal(ReportPdf, C.TAB.TABLE_LANDSCAPE)

        //---detail data

        _.forEach(data, function (detail, index) {
            _.forEach(detail.Orders, function (record1, index1) {

                if (((index1 + 1) % 2) == 1) {

                    hilight = true
                }

                if (hilight) {

                    utils.addHilight(ReportPdf, C.TAB.TABLE_LANDSCAPE, ROW_CURRENT, TEXT_SPACE)

                    addLineLocal(ReportPdf, C.TAB.TABLE_LANDSCAPE)
                }

                addItem(record1, index1)

                _.forEach(C.TAB.TABLE_LANDSCAPE, function (tabValue, tabName) {
                    addColumnLine(ReportPdf, tabValue)
                })

                NewLine(TEXT_SPACE)

                if (record1.Note) {
                    if (hilight) {

                        utils.addHilight(ReportPdf, C.TAB.TABLE_LANDSCAPE, ROW_CURRENT, TEXT_SPACE * lineCount(record1.Note))
                    }

                    addRemark(record1.Note)

                    //--dynamic remark newline
                    for (var i = 0; i < lineCount(record1.Note); i++) {

                        _.forEach(C.TAB.TABLE_LANDSCAPE, function (tabValue, tabName) {
                            addColumnLine(ReportPdf, tabValue)
                        })
                        NewLine(TEXT_SPACE)
                    }

                    addLineLocal(ReportPdf, C.TAB.TABLE_LANDSCAPE)
                }
                else {

                    addLineLocal(ReportPdf, C.TAB.TABLE_LANDSCAPE)
                }

                hilight = false
            })

        })

        addLineLocal(ReportPdf, C.TAB.TABLE_LANDSCAPE)
        NewLine(TEXT_SPACE)
    }

    function drawFooter() {
        //--footer
        addLineLocal(ReportPdf, C.TAB.TABLE_LANDSCAPE)
        utils.addGennerateDate(ReportPdf, C.TAB.TABLE_LANDSCAPE, ROW_CURRENT, C.FONT.SIZE.SMALL);
        ReportPdf.fillColor('black');
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

        var order_text = "#" + record.OrderId,
            gtt_text = utils.numberWithCommas(record.GrandTotal.toFixed(2)),

            TAB_RECORD = {
                LAST: C.TAB.TABLE_LANDSCAPE[header_table_pointer[index + 1]],
                INDEX: C.TAB.TABLE_LANDSCAPE[header_table_pointer[index]]
            }
            ;

        ReportPdf.fontSize(C.FONT.SIZE.NORMAL)
            .text(record.Id, C.TAB.TABLE_LANDSCAPE.INDEX + C.TEXT_PADDING.LEFT, ROW_CURRENT + C.TEXT_PADDING.UP,
            styles_font_left(TAB_RECORD.INDEX, TAB_RECORD.LAST))
            .text(order_text, C.TAB.TABLE_LANDSCAPE.ORDERID + C.TEXT_PADDING.LEFT, ROW_CURRENT + C.TEXT_PADDING.UP,
            styles_font_left(TAB_RECORD.INDEX, TAB_RECORD.LAST))
            ;
        ReportPdf.font('font_style_bold').fontSize(C.FONT.SIZE.NORMAL)
            .text(moment(record.OrderDate).format("HH:mm:ss "), C.TAB.TABLE_LANDSCAPE.DATE + C.TEXT_PADDING.LEFT, ROW_CURRENT + C.TEXT_PADDING.UPPER_TIME,
            styles_font_left(C.TAB.TABLE_LANDSCAPE.DATE, C.TAB.TABLE_LANDSCAPE.REFER))
            ;
        ReportPdf.font('font_style_normal').fontSize(C.FONT.SIZE.NORMAL)
            .text("                " + moment(record.OrderDate).format("DD-MM"), C.TAB.TABLE_LANDSCAPE.DATE + C.TEXT_PADDING.LEFT, ROW_CURRENT + C.TEXT_PADDING.UP,
            styles_font_left(C.TAB.TABLE_LANDSCAPE.DATE, C.TAB.TABLE_LANDSCAPE.REFER))

            .text(record.Table, C.TAB.TABLE_LANDSCAPE.REFER + C.TEXT_PADDING.LEFT, ROW_CURRENT + C.TEXT_PADDING.UP,
            styles_font_left(C.TAB.TABLE_LANDSCAPE.DATE, C.TAB.TABLE_LANDSCAPE.REFER))

            .text(record.ShiftWork, C.TAB.TABLE_LANDSCAPE.SHIFT + C.TEXT_PADDING.LEFT, ROW_CURRENT + C.TEXT_PADDING.UP,
            styles_font_left(TAB_RECORD.INDEX, TAB_RECORD.LAST))

            .text(record.User, C.TAB.TABLE_LANDSCAPE.CASHIER + C.TEXT_PADDING.LEFT, ROW_CURRENT + C.TEXT_PADDING.UP,
            styles_font_left(TAB_RECORD.INDEX, TAB_RECORD.LAST))
            ;
        ReportPdf.font('font_style_bold_bath').fontSize(C.FONT.SIZE.NORMAL)
            .text("฿", C.TAB.TABLE_LANDSCAPE.GRANDTOTAL + C.TEXT_PADDING.LEFT, ROW_CURRENT + C.TEXT_PADDING.UP,
            styles_font_left(C.TAB.TABLE_LANDSCAPE.GRANDTOTAL, C.TAB.TABLE_LANDSCAPE.SUBTOTAL))

        ReportPdf.font('font_style_bold').fontSize(C.FONT.SIZE.NORMAL)
            .text("    " + gtt_text, C.TAB.TABLE_LANDSCAPE.GRANDTOTAL + C.TEXT_PADDING.LEFT, ROW_CURRENT + C.TEXT_PADDING.UP,
            styles_font_left(C.TAB.TABLE_LANDSCAPE.GRANDTOTAL, C.TAB.TABLE_LANDSCAPE.SUBTOTAL))
            ;
        ReportPdf.font('font_style_italic').fontSize(C.FONT.SIZE.SMALL).fillColor('#333333')
            .text(record.SubTotal.toFixed(2), C.TAB.TABLE_LANDSCAPE.SUBTOTAL + C.TEXT_PADDING.RIGHT, ROW_CURRENT + C.TEXT_PADDING.UPPER_SMALL,
            styles_font_right(C.TAB.TABLE_LANDSCAPE.SUBTOTAL, C.TAB.TABLE_LANDSCAPE.SERVICE))

            .text(record.ServiceCharge, C.TAB.TABLE_LANDSCAPE.SERVICE + C.TEXT_PADDING.RIGHT, ROW_CURRENT + C.TEXT_PADDING.UPPER_SMALL,
            styles_font_right(C.TAB.TABLE_LANDSCAPE.SERVICE, C.TAB.TABLE_LANDSCAPE.ITEMDISCOUNT))

            .text(record.ItemDiscount.toFixed(2), C.TAB.TABLE_LANDSCAPE.ITEMDISCOUNT + C.TEXT_PADDING.RIGHT, ROW_CURRENT + C.TEXT_PADDING.UPPER_SMALL,
            styles_font_right(C.TAB.TABLE_LANDSCAPE.ITEMDISCOUNT, C.TAB.TABLE_LANDSCAPE.DISCOUNT))

            .text(record.Discount.toFixed(2), C.TAB.TABLE_LANDSCAPE.DISCOUNT + C.TEXT_PADDING.RIGHT, ROW_CURRENT + C.TEXT_PADDING.UPPER_SMALL,
            styles_font_right(C.TAB.TABLE_LANDSCAPE.DISCOUNT, C.TAB.TABLE_LANDSCAPE.VAT))

            .text(record.Vat, C.TAB.TABLE_LANDSCAPE.VAT + C.TEXT_PADDING.RIGHT, ROW_CURRENT + C.TEXT_PADDING.UPPER_SMALL,
            styles_font_right(C.TAB.TABLE_LANDSCAPE.VAT, C.TAB.TABLE_LANDSCAPE.LAST))
            ;

        ReportPdf.font('font_style_normal').fillColor('black');

        ReportPdf.fontSize(C.FONT.SIZE.NORMAL)
            .text(record.PaymentType, C.TAB.TABLE_LANDSCAPE.TYPE + C.TEXT_PADDING.LEFT, ROW_CURRENT + C.TEXT_PADDING.UP,
            styles_font_left(C.TAB.TABLE_LANDSCAPE.TYPE, C.TAB.TABLE_LANDSCAPE.SHIFT))
            ;
        //--dynamic remark newline
        for (var i = 0; i < lineCount2(record.PaymentType); i++) {
            _.forEach(C.TAB.TABLE_LANDSCAPE, function (tabValue, tabName) {
                addColumnLine(ReportPdf, tabValue)
            })

            NewLine(TEXT_SPACE)
        }

    }

    function addRemark(record) {
        //--fix code
        ReportPdf.font('font_style_normal').fontSize(C.FONT.SIZE.SMALL).fillColor('#333333')
            .text(record, C.TAB.TABLE_LANDSCAPE.GRANDTOTAL + C.TEXT_PADDING.LEFT, ROW_CURRENT + C.TEXT_PADDING.UP,
            styles_font_left(C.TAB.TABLE_LANDSCAPE.GRANDTOTAL, C.TAB.TABLE_LANDSCAPE.LAST))

        ReportPdf.font('font_style_normal').fillColor('black');

    }

    function checkPositionOutsideArea() {

        if (ROW_CURRENT > C.PAGE_TYPE.HEIGHT) {

            ReportPdf.addPage(C.PAGE_TYPE.LANDSCAPE);
            ROW_CURRENT = C.ROW.DEFAULT;

            if (hilight == true) {

                row_hilight = C.ROW.DEFAULT;

            }

        }

    }

    function addLineLocal(pdfReport, tab) {
        utils.addTableLine(pdfReport, ROW_CURRENT, tab.INDEX, tab.LAST)
    }

    function NewLine(px) {
        ROW_CURRENT += px;
        checkPositionOutsideArea()
    }

    function addColumnLine(pdfReport, tab) {
        utils.addTableLine(pdfReport, ROW_CURRENT, tab, tab, ROW_CURRENT, ROW_CURRENT + TEXT_SPACE)
    }

    function styles_font_left(tab_start, tab_end) {
        return {
            width: tab_end - tab_start,
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
