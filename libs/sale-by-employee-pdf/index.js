//----------import
const _ = require('lodash'),
    pdf = require('pdfkit'),
    fs = require('fs'),
    moment = require('moment'),
    path = require('path'),
    C = require('./constant')
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

var title_group = {
    index: "No.",
    type: "Type",
    quantity: "Qty",
    item: "Product",
    amount: "Amount",
},
    position_tab = {
        index: C.TAB.ITEM.INDEX,
        type: C.TAB.ITEM.TYPE,
        quantity: C.TAB.ITEM.QUANTITY,
        item: C.TAB.ITEM.ITEM,
        amount: C.TAB.ITEM.AMOUNT,
    },
    summary_result={}
    ;


//--fillter

//----------main---
exports.Report = function (options, callback) {
    var _path = options.filePath,
        _data = options.data,
        filename = _path,
        data = _data.data,
        shopname = options.shopname
        ;

    var pdfReport = new pdf();

    var now = new Date(),
        datetime = moment(now).format("DD MMMM YYYY, HH:mm:ss"),
        report_type = "รายงานการขายแยกตามรายชื่อพนักงาน"
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

        var header_data = {
            shopname: shopname,
            report_type: report_type
        }
            ;

        _.forEach(header_data, function (value, index) {
            pdfReport.fontSize(C.FONT.SIZE.HEADER)
                .text(value, C.TAB.ITEM.INDEX, ROW_CURRENT, C.STYLES_FONT.HEADER);
            NewLine(C.FONT.SIZE.HEADER + TEXT_SPACE_LOWER);
        })

        NewLine(TEXT_SPACE_SMALL);

        addGennerateDate()

        pdfReport.fillColor('black');

        NewLine(TEXT_SPACE);
        NewLine(TEXT_SPACE);


         summary_result = _.reduce(data.Items, (acc, record) => {
            if (acc[record.User]) {
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

            }
            else {
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

            }
            return acc
        }, {})

        //--summart_chart
        pdfReport.fontSize(C.FONT.SIZE.HEADER)
            .text("Summary", C.TAB.ITEM.INDEX, ROW_CURRENT, C.STYLES_FONT.HEADER);           
        NewLine(C.FONT.SIZE.HEADER + TEXT_SPACE);

        pdfReport.fontSize(C.FONT.SIZE.NORMAL)
        pdfReport.text("Food", C.TAB.SUMMARY_CHART.FOOD + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
        pdfReport.text("Drink", C.TAB.SUMMARY_CHART.DRINK + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
        pdfReport.text("Dessert", C.TAB.SUMMARY_CHART.DESSERT + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
        pdfReport.text("Other", C.TAB.SUMMARY_CHART.OTHER + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)

        _.forEach(C.TAB.SUMMARY_CHART, function (value, key) {
            addColumnLine(value);
        });

        addTableLine(C.TAB.SUMMARY_CHART
            .INDEX, ROW_CURRENT, C.TAB.SUMMARY_CHART
                .LAST, ROW_CURRENT); //--row line

        NewLine(TEXT_SPACE)

        _.forEach(summary_result, (rec, user) => {
            addSummaryChart(rec, user)

            _.forEach(C.TAB.SUMMARY_CHART, function (value, key) {
                addColumnLine(value);
            });

            addTableLine(C.TAB.SUMMARY_CHART
                .INDEX, ROW_CURRENT, C.TAB.SUMMARY_CHART
                    .LAST, ROW_CURRENT); //--row line

            NewLine(TEXT_SPACE)
        })
        addTableLine(C.TAB.SUMMARY_CHART
            .INDEX, ROW_CURRENT, C.TAB.SUMMARY_CHART
                .LAST, ROW_CURRENT); //--row line

        NewLine(TEXT_SPACE);
        NewLine(TEXT_SPACE);
    }
    function drawBody() {
        //--summart_chart
        pdfReport.fontSize(C.FONT.SIZE.HEADER)
        .text("Detail", C.TAB.ITEM.INDEX, ROW_CURRENT, C.STYLES_FONT.HEADER);           
    NewLine(C.FONT.SIZE.HEADER + TEXT_SPACE);

        addTableLine(C.TAB.ITEM
            .INDEX, ROW_CURRENT, C.TAB.ITEM
                .LAST, ROW_CURRENT); //--row line
                
                let group_user =_.groupBy(data.Items,function(value,key){
                    return value.User
                })

        _.forEach(group_user, function (record, user) {

            addItemGroup(user, title_group)

            _.forEach(C.TAB.ITEM, function (value, key) {

                addColumnLine(value);
            });
            addTableLine(C.TAB.ITEM
                .INDEX, ROW_CURRENT, C.TAB.ITEM
                    .LAST, ROW_CURRENT); //--row line

            NewLine(TEXT_SPACE)

            _.forEach(record, function (value2, index) {

                    addItems(value2, index)

                    _.forEach(C.TAB.ITEM, function (value, key) {
                        addColumnLine(value);
                    });
                    addTableLine(C.TAB.ITEM
                        .INDEX, ROW_CURRENT, C.TAB.ITEM
                            .LAST, ROW_CURRENT); //--row line

                    NewLine(TEXT_SPACE)
            
            })

            var sum_qty=_.sumBy(record,function(value,key){
                return value.Qty
            })
            var sum_amount=_.sumBy(record,function(value,key){
                return value.Amount
            })
                addTotalItem(sum_qty, sum_amount) //--fix code

            

            _.forEach(C.TAB.ITEM, function (value, key) {

                addColumnLine(value);
            });

            addTableLine(C.TAB.ITEM
                .INDEX, ROW_CURRENT, C.TAB.ITEM
                    .LAST, ROW_CURRENT); //--row line

            NewLine(TEXT_SPACE)

            addTableLine(C.TAB.ITEM
                .INDEX, ROW_CURRENT, C.TAB.ITEM
                    .LAST, ROW_CURRENT); //--row line

            NewLine(TEXT_SPACE)
        })

        NewLine(TEXT_SPACE)

    }

    function drawFooter() {

        addTableLine(C.TAB.ITEM
            .INDEX, ROW_CURRENT, C.TAB.ITEM
                .LAST, ROW_CURRENT); //--row line

        addGennerateDate();

        pdfReport.fillColor('black');

        NewLine(TEXT_SPACE);

    }

    function addGennerateDate() {
        pdfReport.fontSize(C.FONT.SIZE.SMALL).fillColor('#333333')
            .text("Generated at : " + datetime
            , C.TAB.ITEM.INDEX, ROW_CURRENT, {
                width: C.TAB.ITEM.LAST - C.TAB.ITEM.INDEX,
                align: 'left'
            });
    }
    function addSummaryChart(income, user) {
        pdfReport.font("font_style_normal").fontSize(C.FONT.SIZE.SMALL)
        pdfReport.text(user, C.TAB.SUMMARY_CHART.INDEX + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
        pdfReport.text(numberWithCommas(income["Food"].Amount.toFixed(2)) + " (" + income["Food"].Qty + ")", C.TAB.SUMMARY_CHART.FOOD + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
        pdfReport.text(numberWithCommas(income["Drink"].Amount.toFixed(2)) + " (" + income["Drink"].Qty + ")", C.TAB.SUMMARY_CHART.DRINK + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
        pdfReport.text(numberWithCommas(income["Dessert"].Amount.toFixed(2)) + " (" + income["Dessert"].Qty + ")", C.TAB.SUMMARY_CHART.DESSERT + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
        pdfReport.text(numberWithCommas(income["Other"].Amount.toFixed(2)) + " (" + income["Other"].Qty + ")", C.TAB.SUMMARY_CHART.OTHER + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
    }

    function addItemGroup(name, itemgroup) {

        pdfReport.font("font_style_bold").fontSize(C.FONT.SIZE.NORMAL)
            .text(name, C.TAB_TABLE_GROUP.ITEM.INDEX + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
            ;

        _.forEach(C.TAB_TABLE_GROUP.ITEM, function (value, key) {
            addColumnLine(value);
        });

        addTableLine(C.TAB.ITEM
            .INDEX, ROW_CURRENT, C.TAB.ITEM
                .LAST, ROW_CURRENT); //--row line

        NewLine(TEXT_SPACE)

        _.forEach(itemgroup, function (title, tab) {
            pdfReport.fontSize(C.FONT.SIZE.NORMAL)
                .text(title, position_tab[tab] + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL);
        })
        pdfReport.font("font_style_normal")

    }

    function addItems(item, key) {

        pdfReport.font("font_style_normal").fontSize(C.FONT.SIZE.SMALL)
        pdfReport.text(key+1, C.TAB.ITEM.INDEX + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
        pdfReport.text(item.Type, C.TAB.ITEM.TYPE + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
        pdfReport.text(item.Name, C.TAB.ITEM.ITEM + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
        pdfReport.text(item.Qty, C.TAB.ITEM.QUANTITY + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
        pdfReport.text("฿ " + numberWithCommas(item.Amount.toFixed(2)), C.TAB.ITEM.AMOUNT + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
    }


    function addTotalItem(quantity, amount) {
        pdfReport.font("font_style_bold").fontSize(C.FONT.SIZE.SMALL)
        pdfReport.text("Total: ", C.TAB.ITEM.INDEX + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
        pdfReport.text(numberWithCommas(quantity), C.TAB.ITEM.QUANTITY + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
        pdfReport.text(numberWithCommas(amount.toFixed(2)), C.TAB.ITEM.AMOUNT + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
    }




    function checkPositionOutsideArea() {

        if (ROW_CURRENT > C.PAGE_TYPE.HEIGHT) {

            pdfReport.addPage();
            ROW_CURRENT = C.ROW.DEFAULT;

            if (hilight == true) {

                row_hilight = C.ROW.DEFAULT;

            }

        }

    }

    function addTableLine(sx, sy, ex, ey) {
        pdfReport.moveTo(sx, sy).lineTo(ex, ey).lineWidth(line_tick).strokeColor('gray').stroke();
    }

    function addDashLine(sx, sy, ex, ey) {
        pdfReport.moveTo(sx, sy).lineTo(ex, ey).lineWidth(line_tick).dash(5, { space: 5 }).strokeColor('drakgray').strokeOpacity(0.2).stroke().undash();
        pdfReport.strokeColor('black').strokeOpacity(1).lineWidth(1);
    }

    function NewLine(px) {
        ROW_CURRENT += px;
        checkPositionOutsideArea()
    }

    function addColumnLine(tab) {
        addTableLine(tab, ROW_CURRENT, tab, ROW_CURRENT + TEXT_SPACE);
    }

    function addHilight(position, tab, row_height) {

        pdfReport.rect(C.TAB.ITEM
            .INDEX, position, (tab.LAST - tab.INDEX), row_height).fill('#f0f0f0');

        pdfReport.fill('black');
    }

    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    function numberWithCommas2(x) {
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    }

}