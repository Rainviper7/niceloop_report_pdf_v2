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
    LINE_TICK = 0.4 //default 0.8
    ;
//--style
var title_group = {
    index: "No.",
    name: "Name",
    begin: "Begin",
    add: "Add",
    sold: "Sold",
    adjust: "Adjust",
    withdraw: "Withdraw",
    return: "Return",
    end: "End"
},
    position_tab = {
        index: C.TAB.ITEMS.INDEX,
        name: C.TAB.ITEMS.NAME,
        begin: C.TAB.ITEMS.BEGIN,
        add: C.TAB.ITEMS.ADD,
        sold: C.TAB.ITEMS.SOLD,
        adjust: C.TAB.ITEMS.ADJUST,
        withdraw: C.TAB.ITEMS.WITHDRAW,
        return: C.TAB.ITEMS.RETURN,
        end: C.TAB.ITEMS.END
    };

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
        report_type = "รายงานสต็อกสินค้า"
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

        var header_data = [
            shopname,
            report_type
        ];

        _.forEach(header_data, function (value, index) {
            ReportPdf.fontSize(C.FONT.SIZE.HEADER)
                .text(value, C.TAB.ITEMS.INDEX, ROW_CURRENT, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST));
            NewLine(C.FONT.SIZE.HEADER + TEXT_SPACE_LOWER);
        })

        NewLine(TEXT_SPACE_SMALL);

        utils.addGennerateDate(ReportPdf, C.TAB.ITEMS, ROW_CURRENT, C.FONT.SIZE.SMALL, "#333333")

        ReportPdf.fillColor('black');
        NewLine(TEXT_SPACE);

    }

    function drawBody() {

        var stockGroupfiller = _.groupBy(data.data.Stock, function (item) {
            return item.GroupName
        })

        _.forEach(stockGroupfiller, function (stockList, groupName) {

            addLineLocal(ReportPdf, C.TAB_TABLE_GROUP.ITEMS); //--row line

            _.forEach(C.TAB_TABLE_GROUP.ITEMS, function (tabValue, tabName) {
                addColumnLine(ReportPdf, tabValue)
            })

            addItemGroup(groupName);

            addLineLocal(ReportPdf, C.TAB_TABLE_GROUP.ITEMS); //--row line

            _.forEach(C.TAB.ITEMS, function (tabValue, tabName) {
                addColumnLine(ReportPdf, tabValue)
            })

            NewLine(TEXT_SPACE)

            addLineLocal(ReportPdf, C.TAB.ITEMS) //--row line

            _.forEach(stockList, function (stockItem, indexStock) {

                //--add hilight item
                if (((indexStock + 1) % 2) == 1) {

                    utils.addHilight(ReportPdf, C.TAB.ITEMS, ROW_CURRENT, TEXT_SPACE)
                }

                addItems(stockItem, indexStock)

                _.forEach(C.TAB.ITEMS, function (tabValue, tabName) {
                    addColumnLine(ReportPdf, tabValue)
                })
                addLineLocal(ReportPdf, C.TAB.ITEMS); //--row line
                NewLine(TEXT_SPACE)
            })

            addLineLocal(ReportPdf, C.TAB.ITEMS); //--row line
            NewLine(TEXT_SPACE)
        })

    }

    function drawFooter() {

        utils.addTableLine(ReportPdf, ROW_CURRENT)


        // addGennerateDate();
        utils.addGennerateDate(ReportPdf, C.TAB.ITEMS, ROW_CURRENT, C.FONT.SIZE.SMALL, "#333333")
        NewLine(TEXT_SPACE)

        ReportPdf.fontSize(C.FONT.SIZE.NORMAL).text(utils.addGennerateDateFormat())

        ReportPdf.fillColor('black');

        NewLine(TEXT_SPACE);

    }



    function addItemGroup(itemgroup) {
        ReportPdf.font("font_style_bold").fontSize(C.FONT.SIZE.NORMAL)

        ReportPdf.text(itemgroup, C.TAB_TABLE_GROUP.ITEMS.INDEX + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST));
        NewLine(TEXT_SPACE)

        _.forEach(title_group, function (title, tab) {
            ReportPdf.fontSize(C.FONT.SIZE.SMALL)
                .text(title, position_tab[tab] + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST));
        })


        ReportPdf.font("font_style_normal");

    }

    function addItems(item, index) {


        ReportPdf.fontSize(C.FONT.SIZE.SMALL)
            .text(index + 1 + ". ", C.TAB.ITEMS.INDEX + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
            .text(item.Name + " [" + item.Unit + "]", C.TAB.ITEMS.NAME + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
            .text(utils.numberWithCommas(item.Begin), C.TAB.ITEMS.BEGIN + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
            .text(utils.numberWithCommas(item.Add), C.TAB.ITEMS.ADD + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
            .text(utils.numberWithCommas(item.Sold), C.TAB.ITEMS.SOLD + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
            .text(utils.numberWithCommas(item.Adjust), C.TAB.ITEMS.ADJUST + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
            .text(utils.numberWithCommas(item.Withdraw), C.TAB.ITEMS.WITHDRAW + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
            .text(utils.numberWithCommas(item.Return), C.TAB.ITEMS.RETURN + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
            .text(utils.numberWithCommas(item.End), C.TAB.ITEMS.END + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))

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