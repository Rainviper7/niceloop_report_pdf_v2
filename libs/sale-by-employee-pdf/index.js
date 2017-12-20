//----------import
const _ = require('lodash'),
    pdf = require('pdfkit'),
    fs = require('fs'),
    moment = require('moment'),
    path = require('path'),
    C = require('./constant'),
    utils = require('../utils')
    ;

//----------main---
exports.Report = function (options, callback) {
    var _path = options.filePath,
        _data = options.data,
        filename = _path,
        data = _data.data,
        shopname = options.shopname,
        cb = callback
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
        line_tick = 0.4 //default 0.8
        ;

    var title_group = {
        index: "No.",
        type: "Type",
        quantity: "Qty",
        item: "Product",
        amount: "Amount",
    },
        position_tab = {
            index: C.TAB.ITEMS.INDEX,
            type: C.TAB.ITEMS.TYPE,
            quantity: C.TAB.ITEMS.QUANTITY,
            item: C.TAB.ITEMS.ITEM,
            amount: C.TAB.ITEMS.AMOUNT,
        },
        summary_result = {}
        ;

    var ReportPdf = new pdf();

    var now = new Date(),
        datetime = moment(now).format("DD MMMM YYYY, HH:mm:ss"),
        report_type = "รายงานการขายแยกตามรายชื่อพนักงาน"
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

        var header_data = {
            shopname: shopname,
            report_type: report_type
        }
            ;

        _.forEach(header_data, function (header, keyname) {
            ReportPdf.fontSize(C.FONT.SIZE.HEADER)
                .text(header, C.TAB.ITEMS.INDEX, ROW_CURRENT, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST));
            NewLine(C.FONT.SIZE.HEADER + TEXT_SPACE_LOWER);
        })

        NewLine(TEXT_SPACE_SMALL);

        utils.addGennerateDate(ReportPdf, C.TAB.ITEMS, ROW_CURRENT)

        ReportPdf.fillColor('black');

        NewLine(TEXT_SPACE);
        NewLine(TEXT_SPACE);


        summary_result = _.reduce(data.Items, (acc, record) => {

            if (acc[record.User] == undefined) {
                acc[record.User] = {
                    Food: {
                        Qty: 0,
                        Amount: 0
                    },
                    Drink: {
                        Qty: 0,
                        Amount: 0
                    },
                    Dessert: {
                        Qty: 0,
                        Amount: 0
                    },
                    Other: {
                        Qty: 0,
                        Amount: 0
                    },
                }
            }
            switch (record.Type) {
                case "Food":
                    acc[record.User].Food.Qty += 1
                    acc[record.User].Food.Amount += record.Amount
                    break;
                case "Drink":
                    acc[record.User].Drink.Qty += 1
                    acc[record.User].Drink.Amount += record.Amount
                    break;
                case "Dessert":
                    acc[record.User].Dessert.Qty += 1
                    acc[record.User].Dessert.Amount += record.Amount
                    break;
                case "Other":
                    acc[record.User].Other.Qty += 1
                    acc[record.User].Other.Amount += record.Amount
                    break;
            }

            return acc
        }, {})

        //--summart_chart
        ReportPdf.fontSize(C.FONT.SIZE.HEADER)
            .text("Summary", C.TAB.ITEMS.INDEX, ROW_CURRENT, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST));
        NewLine(C.FONT.SIZE.HEADER + TEXT_SPACE);

        ReportPdf.fontSize(C.FONT.SIZE.NORMAL)
        ReportPdf.text("Food", C.TAB.SUMMARY_CHART.FOOD + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
        ReportPdf.text("Drink", C.TAB.SUMMARY_CHART.DRINK + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
        ReportPdf.text("Dessert", C.TAB.SUMMARY_CHART.DESSERT + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
        ReportPdf.text("Other", C.TAB.SUMMARY_CHART.OTHER + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))

        _.forEach(C.TAB.SUMMARY_CHART, function (tabValue, tabName) {
            addColumnLine(ReportPdf, tabValue)
        })

        addLineLocal(ReportPdf, C.TAB.SUMMARY_CHART)

        NewLine(TEXT_SPACE)

        _.forEach(summary_result, (rec, user) => {
            addSummaryChart(rec, user)

            _.forEach(C.TAB.SUMMARY_CHART, function (tabValue, tabName) {
                addColumnLine(ReportPdf, tabValue)
            })

            addLineLocal(ReportPdf, C.TAB.SUMMARY_CHART)

            NewLine(TEXT_SPACE)
        })

        addLineLocal(ReportPdf, C.TAB.SUMMARY_CHART)

        NewLine(TEXT_SPACE);
        NewLine(TEXT_SPACE);
    }
    function drawBody() {
        //--summart_chart
        ReportPdf.fontSize(C.FONT.SIZE.HEADER)
            .text("Detail", C.TAB.ITEMS.INDEX, ROW_CURRENT, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST));
        NewLine(C.FONT.SIZE.HEADER + TEXT_SPACE);

        addLineLocal(ReportPdf, C.TAB.ITEMS)

        let group_user = _.groupBy(data.Items, function (employee, key) {
            return employee.User
        })

        _.forEach(group_user, function (record, user) {

            addItemGroup(user, title_group)

            _.forEach(C.TAB.ITEMS, function (tabValue, tabName) {
                addColumnLine(ReportPdf, tabValue)
            })

            addLineLocal(ReportPdf, C.TAB.ITEMS)

            NewLine(TEXT_SPACE)

            //--detail_chart
            _.forEach(record, function (details, index) {

                if (((index + 1) % 2) == 1) {

                    utils.addHilight(ReportPdf, C.TAB.ITEMS, ROW_CURRENT, TEXT_SPACE)

                }

                addItems(details, index)

                _.forEach(C.TAB.ITEMS, function (tabValue, tabName) {
                    addColumnLine(ReportPdf, tabValue)
                })

                addLineLocal(ReportPdf, C.TAB.ITEMS)

                NewLine(TEXT_SPACE)

            })

            var sum_qty = _.sumBy(record, function (item_details, key) {
                return item_details.Qty
            })
            var sum_amount = _.sumBy(record, function (item_details, key) {
                return item_details.Amount
            })

            addTotalItem(sum_qty, sum_amount) //--fix code

            _.forEach(C.TAB.ITEMS, function (tabValue, tabName) {
                addColumnLine(ReportPdf, tabValue)
            })

            addLineLocal(ReportPdf, C.TAB.ITEMS)
            NewLine(TEXT_SPACE)

            addLineLocal(ReportPdf, C.TAB.ITEMS)
            NewLine(TEXT_SPACE)
        })

        NewLine(TEXT_SPACE)

    }

    function drawFooter() {

        addLineLocal(ReportPdf, C.TAB.ITEMS)

        utils.addGennerateDate(ReportPdf, C.TAB.ITEMS, ROW_CURRENT)

        ReportPdf.fillColor('black');

        NewLine(TEXT_SPACE);

    }

    function addSummaryChart(income, user) {
        ReportPdf.font("font_style_normal").fontSize(C.FONT.SIZE.SMALL)
        ReportPdf.text(user, C.TAB.SUMMARY_CHART.INDEX + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
        ReportPdf.text(utils.numberWithCommas(income["Food"].Amount.toFixed(2)) + " (" + income["Food"].Qty + ")", C.TAB.SUMMARY_CHART.FOOD + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
        ReportPdf.text(utils.numberWithCommas(income["Drink"].Amount.toFixed(2)) + " (" + income["Drink"].Qty + ")", C.TAB.SUMMARY_CHART.DRINK + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
        ReportPdf.text(utils.numberWithCommas(income["Dessert"].Amount.toFixed(2)) + " (" + income["Dessert"].Qty + ")", C.TAB.SUMMARY_CHART.DESSERT + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
        ReportPdf.text(utils.numberWithCommas(income["Other"].Amount.toFixed(2)) + " (" + income["Other"].Qty + ")", C.TAB.SUMMARY_CHART.OTHER + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
    }

    function addItemGroup(name, itemgroup) {

        ReportPdf.font("font_style_bold").fontSize(C.FONT.SIZE.NORMAL)
            .text(name, C.TAB_TABLE_GROUP.ITEMS.INDEX + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
            ;

        _.forEach(C.TAB_TABLE_GROUP.ITEMS, function (tabValue, tabName) {
            addColumnLine(ReportPdf, tabValue)
        })

        addLineLocal(ReportPdf, C.TAB.ITEMS)

        NewLine(TEXT_SPACE)

        _.forEach(itemgroup, function (title, tab) {
            ReportPdf.fontSize(C.FONT.SIZE.NORMAL)
                .text(title, position_tab[tab] + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST));
        })
        ReportPdf.font("font_style_normal")

    }

    function addItems(item, key) {

        ReportPdf.font("font_style_normal").fontSize(C.FONT.SIZE.SMALL)
        ReportPdf.text(key + 1, C.TAB.ITEMS.INDEX + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
        ReportPdf.text(item.Type, C.TAB.ITEMS.TYPE + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
        ReportPdf.text(item.Name, C.TAB.ITEMS.ITEM + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
        ReportPdf.text(item.Qty, C.TAB.ITEMS.QUANTITY + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
        ReportPdf.text("฿ " + utils.numberWithCommas(item.Amount.toFixed(2)), C.TAB.ITEMS.AMOUNT + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
    }

    function addTotalItem(quantity, amount) {
        ReportPdf.font("font_style_bold").fontSize(C.FONT.SIZE.SMALL)
        ReportPdf.text("Total: ", C.TAB.ITEMS.INDEX + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
        ReportPdf.text(utils.numberWithCommas(quantity), C.TAB.ITEMS.QUANTITY + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
        ReportPdf.text(utils.numberWithCommas(amount.toFixed(2)), C.TAB.ITEMS.AMOUNT + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
    }

    function checkPositionOutsideArea() {

        if (ROW_CURRENT > C.PAGE_TYPE.HEIGHT) {

            ReportPdf.addPage();
            ROW_CURRENT = C.ROW.DEFAULT;

            if (hilight == true) {

                row_hilight = C.ROW.DEFAULT;

            }

        }

    }

    function addLineLocal(pdfReport, tab) {
        utils.addTableLine(pdfReport, ROW_CURRENT, tab.INDEX, tab.LAST)
    }

    function addDashLineLocal(pdfReport) {
        utils.addDashLine(pdfReport, ROW_CURRENT, C.TAB.CHART.INDEX + 15, C.TAB.CHART.LAST - 15)//--fix code
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

    function styles_deleted(tab_start, tab_end) {
        return {
            width: tab_end - tab_start,
            align: 'left',
            strike: "true"
        }
    }

} 