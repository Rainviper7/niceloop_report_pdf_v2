//----------import
const _ = require('lodash'),
    pdf = require('pdfkit'),
    fs = require('fs'),
    moment = require('moment'),
    path = require('path'),
    C = require('./constant')
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


//--fillter

//----------main---
exports.Report = function (options, callback) {
    var _path = options.filePath,
        _data = options.data,
        filename = _path,
        data = _data,
        shopname = options.shopname,
        callback = callback
        ;

    var pdfReport = new pdf({
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

    pdfReport.registerFont('font_style_normal', fontpath, '')
        .registerFont('font_style_bold', fontpath_bold, '')
        ;

    pdfReport.font('font_style_normal');

    buildPdf();

    // return {
    //     buildPdf: buildPdf
    // } //--cloud

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

        pdfReport.pipe(fs.createWriteStream(filename));

        pdfReport.font('font_style_normal')
        drawHeader();
        drawBody();
        drawFooter();
        pdfReport.end();

    }

    function drawHeader() {

        var header_data = [
            shopname,
            report_type
        ]
            ;

        _.forEach(header_data, function (value, index) {
            pdfReport.fontSize(C.FONT.SIZE.HEADER)
                .text(value, C.TAB.ITEMS.INDEX, ROW_CURRENT, C.STYLES_FONT.HEADER);
            NewLine(C.FONT.SIZE.HEADER + TEXT_SPACE_LOWER);
        })

        NewLine(TEXT_SPACE_SMALL);

        utils.addGennerateDate(pdfReport, ROW_CURRENT, C.FONT.SIZE.SMALL, "#aa0000")

        pdfReport.fillColor('black');
        NewLine(TEXT_SPACE);

    }

    function drawBody() {

        var stockGroupfiller = _.groupBy(data.data.Stock, function (item1) {
            return item1.GroupName
        })

        _.forEach(stockGroupfiller, function (stockList, groupName) {

            addTableLine(); //--row line

            _.forEach(C.TAB_TABLE_GROUP.ITEM, function (value, key) {
                addColumnLine(value);
            });

            addItemGroup(groupName);

            addTableLine(); //--row line

            _.forEach(C.TAB.ITEMS, function (value, key) {
                addColumnLine(value);
            });

            NewLine(TEXT_SPACE)

            addTableLine() //--row line

            _.forEach(stockList, function (stockItem, indexStock) {

                addItems(stockItem, indexStock)

                _.forEach(C.TAB.ITEMS, function (value, key) {
                    addColumnLine(value);
                });

                addTableLine(); //--row line

                NewLine(TEXT_SPACE)
            })
            addTableLine(C.TAB.ITEMS
                .INDEX, ROW_CURRENT, C.TAB.ITEMS
                    .LAST, ROW_CURRENT); //--row line
            NewLine(TEXT_SPACE)
        })

    }

    function drawFooter() {

        // addTableLine(C.TAB.ITEMS
        //     .INDEX, ROW_CURRENT, C.TAB.ITEMS
        //         .LAST, ROW_CURRENT); //--row line

        utils.addTableLine(pdfReport, ROW_CURRENT)


        // addGennerateDate();
        utils.addGennerateDate(pdfReport, ROW_CURRENT, C.FONT.SIZE.SMALL, "#aa0000")
        NewLine(TEXT_SPACE)

        pdfReport.fontSize(C.FONT.SIZE.NORMAL).text(utils.addGennerateDateFormat())

        pdfReport.fillColor('black');

        NewLine(TEXT_SPACE);

    }

    function addGennerateDate() {
        pdfReport.fontSize(C.FONT.SIZE.NORMAL).fillColor('#333333')
            .text("Generated at : " + datetime
            , C.TAB.ITEMS.INDEX, ROW_CURRENT, {
                width: C.TAB.ITEMS.LAST - C.TAB.ITEMS.INDEX,
                align: 'left'
            });
    }

    function addItemGroup(itemgroup) {
        pdfReport.font("font_style_bold").fontSize(C.FONT.SIZE.NORMAL)

        pdfReport.text(itemgroup, C.TAB_TABLE_GROUP.ITEM.INDEX + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
            ;

        NewLine(TEXT_SPACE)

        _.forEach(title_group, function (title, tab) {
            pdfReport.fontSize(C.FONT.SIZE.SMALL)
                .text(title, position_tab[tab] + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL);
        })


        pdfReport.font("font_style_normal");

    }

    function addItems(item, key) {


        pdfReport.fontSize(C.FONT.SIZE.SMALL)
            .text(key + 1 + ". ", C.TAB.ITEMS.INDEX + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
            .text(item.Name + " [" + item.Unit + "]", C.TAB.ITEMS.NAME + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
            .text(utils.numberWithCommas(item.Begin), C.TAB.ITEMS.BEGIN + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
            .text(utils.numberWithCommas(item.Add), C.TAB.ITEMS.ADD + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
            .text(utils.numberWithCommas(item.Sold), C.TAB.ITEMS.SOLD + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
            .text(utils.numberWithCommas(item.Adjust), C.TAB.ITEMS.ADJUST + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
            .text(utils.numberWithCommas(item.Withdraw), C.TAB.ITEMS.WITHDRAW + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
            .text(utils.numberWithCommas(item.Return), C.TAB.ITEMS.RETURN + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
            .text(utils.numberWithCommas(item.End), C.TAB.ITEMS.END + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)

            ;
    }

    function checkPositionOutsideArea() {

        if (ROW_CURRENT > C.PAGE_TYPE.HEIGHT) {

            pdfReport.addPage({ autoFirstPage: false });
            ROW_CURRENT = C.ROW.DEFAULT;

            if (hilight == true) {

                row_hilight = C.ROW.DEFAULT;

            }

        }

    }

    function addTableLine(sx, sy, ex, ey) {

        var _default = {
            sx: sx || C.TAB.ITEMS.INDEX,
            sy: sy || ROW_CURRENT,
            ex: ex || C.TAB.ITEMS.LAST,
            ey: ey || ROW_CURRENT
        }


        pdfReport.moveTo(_default.sx, _default.sy).lineTo(_default.ex, _default.ey).lineWidth(LINE_TICK).strokeColor('gray').stroke();
    }

    function addDashLine(sx, sy, ex, ey) {
        pdfReport.moveTo(sx, sy).lineTo(ex, ey).lineWidth(LINE_TICK).dash(5, { space: 5 }).strokeColor('drakgray').strokeOpacity(0.2).stroke().undash();
        pdfReport.strokeColor('black').strokeOpacity(1).lineWidth(1);
    }

    function NewLine(px) {
        checkPositionOutsideArea()
        ROW_CURRENT += px;

    }

    function addColumnLine(tab) {
        addTableLine(tab, ROW_CURRENT, tab, ROW_CURRENT + TEXT_SPACE);
    }

    function addHilight(position, tab, row_height) {

        pdfReport.rect(C.TAB.ITEMS
            .INDEX, position, (tab.LAST - tab.INDEX), row_height).fill('#f0f0f0');

        pdfReport.fill('black');
    }

    // function numberWithCommas(x) {
    //     return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    // }

    // function numberWithCommas2(x) {
    //     var parts = x.toString().split(".");
    //     parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    //     return parts.join(".");
    // }

}