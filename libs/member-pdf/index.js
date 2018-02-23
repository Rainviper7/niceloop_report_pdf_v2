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
var TEXT_SPACE_LOWER = 5,
    TEXT_SPACE_UPPER = 2,
    TEXT_SPACE = C.FONT.SIZE.NORMAL + TEXT_SPACE_LOWER,
    TEXT_SPACE_BIG = C.FONT.SIZE.BIG + TEXT_SPACE_LOWER,
    TEXT_SPACE_SMALL = C.FONT.SIZE.SMALL,
    ROW_CURRENT = C.ROW.DEFAULT,
    hilight = false,
    row_hilight = 0,
    row_chart_2 = 0,
    line_tick = 0.4 //default 0.8
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

    var ReportPdf = new pdf({
        size: "A4"
    });

    var now = new Date(),
        datetime = moment(now).format("DD MMMM YYYY, HH:mm:ss"),
        report_type = "รายงานลูกค้าสมาชิก"
        ;

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

        var header_data = {
            shopname: shopname,
            report_type: report_type
        }
            ;

        _.forEach(header_data, function (value, index) {
            ReportPdf.fontSize(C.FONT.SIZE.HEADER)
                .text(value, C.TAB.ITEMS.INDEX, ROW_CURRENT, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.TEL));
            NewLine(C.FONT.SIZE.HEADER + TEXT_SPACE_LOWER);
        })

        NewLine(TEXT_SPACE_SMALL);

        utils.addGennerateDate(ReportPdf, C.TAB.ITEMS, ROW_CURRENT, C.FONT.SIZE.SMALL);

        ReportPdf.fillColor('black');
        NewLine(TEXT_SPACE);
        NewLine(TEXT_SPACE);
    }

    function drawBody() {
        var title_member = {
            index: "No.",
            customerid: "customer_ID",
            firstname: "Firstname",
            lastname: "Lastname",
            tel: "Tel.",
            gender: "Gender",
            birthday: "Birthday"
        },
            position_tab = {
                index: C.TAB.ITEMS.INDEX,
                customerid: C.TAB.ITEMS.CUSTOMERID,
                firstname: C.TAB.ITEMS.FIRSTNAME,
                lastname: C.TAB.ITEMS.LASTNAME,
                tel: C.TAB.ITEMS.TEL,
                gender: C.TAB.ITEMS.GENDER,
                birthday: C.TAB.ITEMS.BIRTHDAY
            };

        addLineLocal(ReportPdf, C.TAB.ITEMS); //--row line

        _.forEach(title_member, function (title, tab) {
            ReportPdf.fontSize(C.FONT.SIZE.NORMAL)
                .text(title, position_tab[tab] + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST));
        })

        _.forEach(C.TAB.ITEMS, function (tabValue, tabName) {
            addColumnLine(ReportPdf, tabValue)
        })

        NewLine(TEXT_SPACE)
        addLineLocal(ReportPdf, C.TAB.ITEMS); //--row line


        _.forEach(data.Member, function (member, index) {
            addItems(member, index);

            _.forEach(C.TAB.ITEMS, function (tabValue, tabName) {
                addColumnLine(ReportPdf, tabValue)
            })

            NewLine(TEXT_SPACE)
            addLineLocal(ReportPdf, C.TAB.ITEMS); //--row line
        })

        NewLine(TEXT_SPACE)
    }

    function drawFooter() {

        addLineLocal(ReportPdf, C.TAB.ITEMS); //--row line

        utils.addGennerateDate(ReportPdf, C.TAB.ITEMS, ROW_CURRENT, C.FONT.SIZE.SMALL);

        ReportPdf.fillColor('black');

        NewLine(TEXT_SPACE);

    }

    function addItems(item, key) {

        ReportPdf.fontSize(C.FONT.SIZE.NORMAL)
            .text(key + 1 + ". ", C.TAB.ITEMS.INDEX + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.CUSTOMERID))
            .text(item.CustomerId, C.TAB.ITEMS.CUSTOMERID + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.CUSTOMERID, C.TAB.ITEMS.FIRSTNAME))
            .text(item.FirstName, C.TAB.ITEMS.FIRSTNAME + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.FIRSTNAME, C.TAB.ITEMS.LASTNAME))
            .text(item.LastName, C.TAB.ITEMS.LASTNAME + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.LASTNAME, C.TAB.ITEMS.TEL))
            .text(item.Tel, C.TAB.ITEMS.TEL + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.TEL, C.TAB.ITEMS.GENDER))
            .text(item.Gender, C.TAB.ITEMS.GENDER + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.GENDER, C.TAB.ITEMS.BIRTHDAY))
            .text(item.BirthDay, C.TAB.ITEMS.BIRTHDAY + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.BIRTHDAY, C.TAB.ITEMS.LAST))
            ;
    }

    function checkPositionOutsideArea() {

        if (ROW_CURRENT > C.PAGE_TYPE.HEIGHT) {

            ReportPdf.addPage({ autoFirstPage: false });
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
        checkPositionOutsideArea()
        ROW_CURRENT += px;

    }

    function addColumnLine(pdfReport, tab) {
        utils.addTableLine(pdfReport, ROW_CURRENT, tab, tab, ROW_CURRENT, (ROW_CURRENT + TEXT_SPACE))
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