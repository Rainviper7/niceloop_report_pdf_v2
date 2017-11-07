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


//--fillter

//----------main---
exports.Report = function (options, callback) {
    var _path = options.filePath,
        _data = options.data,
        filename = _path,
        data = _data,
        data_activity = data.data.Activity,
        shopname = options.shopname
        ;

    var pdfReport = new pdf();

    var now = new Date(),
        datetime = moment(now).format("DD MMMM YYYY, HH:mm:ss"),
        report_type = "รายงานยอดขายตามช่วงเวลา"
        ;

    //----set font
    var fontpath = path.join(__dirname, 'fonts', C.FONT.NAME),
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
    }

    function drawBody() {
        var title_group = {
            index: "",
            time: "Hour",
            add: "Add",
            void:"Void",
            payment:"Payment"
        },
        position_tab={
            index: C.TAB.ITEM.INDEX,
            time: C.TAB.ITEM.TIME,
            add:C.TAB.ITEM.ADD,
            void:C.TAB.ITEM.VOID,
            payment:C.TAB.ITEM.PAYMENT
 
        };
        addTableLine(C.TAB.ITEM
            .INDEX, ROW_CURRENT, C.TAB.ITEM
                .LAST, ROW_CURRENT); //--row line

        _.forEach(C.TAB_TABLE_GROUP.ITEM, function (value, key) {
            addColumnLine(value);
        });
            pdfReport.fontSize(C.FONT.SIZE.NORMAL)
                .text("Time",C.TAB_TABLE_GROUP.ITEM.TIME + C.TEXT_PADDING.LEFT,ROW_CURRENT+TEXT_SPACE_UPPER,C.STYLES_FONT.NORMAL)
                .text("Overall",C.TAB_TABLE_GROUP.ITEM.DAY + C.TEXT_PADDING.LEFT,ROW_CURRENT+TEXT_SPACE_UPPER,C.STYLES_FONT.NORMAL);

        NewLine(TEXT_SPACE)

            addTableLine(C.TAB.ITEM
                .INDEX, ROW_CURRENT, C.TAB.ITEM
                    .LAST, ROW_CURRENT); //--row line

            _.forEach(title_group,function(title,tab){
                pdfReport.fontSize(C.FONT.SIZE.NORMAL)
                            .text(title,position_tab[tab]+C.TEXT_PADDING.LEFT,ROW_CURRENT+TEXT_SPACE_UPPER,C.STYLES_FONT.NORMAL);
            })
            
            _.forEach(C.TAB.ITEM, function (value, key) {
                addColumnLine(value);
            });

            NewLine(TEXT_SPACE)

            //------------sort by date-----------
            var sort_record =_.sortBy(data_activity,function(record,index){
                return record.date
            })
            var group_record =_.groupBy(sort_record,function(record1,date){
                return record1.date
            })
            _.forEach(group_record,function(record,index){
                pdfReport.fontSize(C.FONT.SIZE.SMALL)
                    .text(record.timestamp,C.TAB.ITEM.TIME + C.TEXT_PADDING.LEFT,ROW_CURRENT+TEXT_SPACE_UPPER,C.STYLES_FONT.NORMAL)
                    .text(record.date,C.TAB.ITEM.ADD + C.TEXT_PADDING.LEFT,ROW_CURRENT+TEXT_SPACE_UPPER,C.STYLES_FONT.NORMAL)
                    .text(record.id,C.TAB.ITEM.VOID + C.TEXT_PADDING.LEFT,ROW_CURRENT+TEXT_SPACE_UPPER,C.STYLES_FONT.NORMAL)

                    _.forEach(C.TAB.ITEM, function (value, key) {
                        addColumnLine(value);
                    });

                    addTableLine(C.TAB.ITEM
                        .INDEX, ROW_CURRENT, C.TAB.ITEM
                            .LAST, ROW_CURRENT); //--row line

                NewLine(TEXT_SPACE)
            })

            //------------------------

            addTableLine(C.TAB.ITEM
                .INDEX, ROW_CURRENT, C.TAB.ITEM
                    .LAST, ROW_CURRENT); //--row line

            NewLine(TEXT_SPACE)
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
        pdfReport.fontSize(C.FONT.SIZE.NORMAL).fillColor('#333333')
            .text("Generated at : " + datetime
            , C.TAB.ITEM.INDEX, ROW_CURRENT, {
                width: C.TAB.ITEM.LAST - C.TAB.ITEM.INDEX,
                align: 'left'
            });
    }

    function addItemGroup(itemgroup) {
        pdfReport.font("font_style_bold").fontSize(C.FONT.SIZE.NORMAL)
            .text("Qty", C.TAB_TABLE_GROUP.ITEM.TIME + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
            .text("Total", C.TAB_TABLE_GROUP.ITEM.AMOUNT + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
            .text("Percent", C.TAB_TABLE_GROUP.ITEM.PERCENT + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL);
        pdfReport.font("font_style_normal");
        NewLine(TEXT_SPACE);

        _.forEach(C.TAB_TABLE_GROUP.ITEM, function (value, key) {
            addColumnLine(value);
        });

        pdfReport.fontSize(C.FONT.SIZE.NORMAL)
            .text(itemgroup.Name, C.TAB_TABLE_GROUP.ITEM.INDEX + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
            .text(itemgroup.Quantity, C.TAB_TABLE_GROUP.ITEM.TIME + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
            .text("฿ " + numberWithCommas(itemgroup.Amount.toFixed(2)), C.TAB_TABLE_GROUP.ITEM.AMOUNT + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.AMOUNT)
            .text(itemgroup.Percent + "%", C.TAB_TABLE_GROUP.ITEM.PERCENT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.PERCENT);

    }

    function addItems(item, key) {

        pdfReport.fontSize(C.FONT.SIZE.NORMAL)
            .text(key + 1 + ". ", C.TAB.ITEM.INDEX + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
            .text(item.Name, C.TAB.ITEM.NAME + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
            .text(item.Quantity, C.TAB.ITEM.QUANTITY + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
            .text("฿ " + numberWithCommas(item.Amount.toFixed(2)), C.TAB.ITEM.AMOUNT + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.AMOUNT)
            .text(item.Percent + "%", C.TAB.ITEM.PERCENT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.PERCENT)
            ;
    }

    function addSubItems(subitem) {

        pdfReport.fontSize(C.FONT.SIZE.NORMAL)
            .text("- " + subitem.Name, C.TAB.ITEM.NAME + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
            .text(subitem.Quantity, C.TAB.ITEM.QUANTITY + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
            .text("฿ " + numberWithCommas(subitem.Amount.toFixed(2)), C.TAB.ITEM.AMOUNT + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.AMOUNT)
            ;
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

    function addHilight(position,tab, row_height) {

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