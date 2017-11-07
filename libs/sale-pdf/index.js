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
        shopname = options.shopname
        ;

    var pdfReport = new pdf({ autoFirstPage: false });

    pdfReport.addPage(C.PAGE_TYPE.LANDSCAPE)

    var now = new Date(),
        datetime = moment(now).format("DD MMMM YYYY, HH:mm:ss"),
        report_type = "รายงานการขาย"
        ;
    var date_search = moment(options.from).format("DD/MM/YYYY") + " - " + moment(options.to).format("DD/MM/YYYY")
        ;
    var title_group = {
        date: "Date",
        bills: "Bills (Avg.)",
        total: "GrandTotal",
        paytype:"Payment Type",
        subtotal: "SubTotal",
        itemdiscount: "ItemDistcount",
        service: "Service ch.",
        discount: "Discount",
        vat: "Vat"
    },

        position_tab = {
            date: C.TAB_TABLE_GROUP.ITEM.INDEX,
            bills: C.TAB_TABLE_GROUP.ITEM.BILLS,
            total: C.TAB_TABLE_GROUP.ITEM.TOTAL,
            paytype:C.TAB_TABLE_GROUP.ITEM.PAYMENTTYPE,
            subtotal: C.TAB_TABLE_GROUP.ITEM.SUBTOTAL,
            itemdiscount: C.TAB_TABLE_GROUP.ITEM.ITEMDISCOUNT,
            service: C.TAB_TABLE_GROUP.ITEM.SERVICE,
            discount: C.TAB_TABLE_GROUP.ITEM.DISCOUNT,
            vat: C.TAB.ITEM.VAT
        };

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
            report_type: report_type,
            date: date_search
        }
            ;

        _.forEach(header_data, function (value, index) {
            pdfReport.fontSize(C.FONT.SIZE.HEADER)
                .text(value, C.TAB.ITEM.INDEX, ROW_CURRENT, C.STYLES_FONT.HEADER);
            NewLine(C.FONT.SIZE.HEADER + TEXT_SPACE_LOWER);
        })
  
        NewLine(TEXT_SPACE_SMALL);

        utils.addGennerateDate(pdfReport,ROW_CURRENT,C.FONT.SIZE.SMALL);

        pdfReport.fillColor('black');
        NewLine(TEXT_SPACE);
        NewLine(TEXT_SPACE);
    }

    function drawBody() {

        addTableLine(C.TAB.ITEM
            .INDEX, ROW_CURRENT, C.TAB.ITEM
                .LAST, ROW_CURRENT); //--row line

        addItemGroup(title_group)

        _.forEach(C.TAB.ITEM, function (value, key) {
            addColumnLine(value);
        });

        NewLine(TEXT_SPACE)
        
        addTableLine(C.TAB.ITEM
            .INDEX, ROW_CURRENT, C.TAB.ITEM
                .LAST, ROW_CURRENT); //--row line

        _.forEach(data, function (record, index) {
            _.forEach(record, function (detail, index2) {
                addItems(detail, index2)



            })
        })

        addTableLine(C.TAB.ITEM
            .INDEX, ROW_CURRENT, C.TAB.ITEM
                .LAST, ROW_CURRENT); //--row line

        NewLine(TEXT_SPACE)
    }

    function drawFooter() {

        addTableLine(C.TAB.ITEM
            .INDEX, ROW_CURRENT, C.TAB.ITEM
                .LAST, ROW_CURRENT); //--row line

        utils.addGennerateDate(pdfReport,ROW_CURRENT,C.FONT.SIZE.SMALL);

        pdfReport.fillColor('black');

        NewLine(TEXT_SPACE);

    }

    // function addGennerateDate() {
    //     pdfReport.fontSize(C.FONT.SIZE.NORMAL).fillColor('#333333')
    //         .text("Generated at : " + datetime
    //         , C.TAB.ITEM.INDEX, ROW_CURRENT, {
    //             width: C.TAB.ITEM.LAST - C.TAB.ITEM.INDEX,
    //             align: 'left'
    //         });
    // }

    function addItemGroup(titlename) {
        pdfReport.font('font_style_bold').fontSize(C.FONT.SIZE.NORMAL)
        _.forEach(titlename, function (title, tab) {
            pdfReport.fontSize(C.FONT.SIZE.NORMAL)
                .text(title, position_tab[tab] + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL);
        })
        pdfReport.font('font_style_normal')
    }


    function addItems(record, index) {
        if (index == 'all') {
            var dateLong;
            var time = moment(options.to).diff(moment(options.from), 'days'),
                avg = record.GrandTotal / time+1
                dateLong = "avg. ฿ " + numberWithCommas2(avg.toFixed(2)) + " /day";

        } else {
            var dateLong = moment(record.Date).format("DD MMMM YYYY ddd");
        }

        pdfReport.font('font_style_normal').fontSize(C.FONT.SIZE.SMALL)
        pdfReport.text(dateLong, C.TABLE_LANDSCAPE.INDEX + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)

        if (record.Bills == 0) {

            pdfReport.text(numberWithCommas(record.Bills), C.TABLE_LANDSCAPE.BILLS + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
                .text("-", C.TABLE_LANDSCAPE.TOTAL + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
                .text("-", C.TABLE_LANDSCAPE.PAYMENTTYPE + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
                .text("-", C.TABLE_LANDSCAPE.SUBTOTAL + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
                .text("-", C.TABLE_LANDSCAPE.ITEMDISCOUNT + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
                .text("-", C.TABLE_LANDSCAPE.SERVICE + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
                .text("-", C.TABLE_LANDSCAPE.DISCOUNT + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
                .text("-", C.TABLE_LANDSCAPE.VAT + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
                ;

                _.forEach(C.TAB.ITEM, function (value, key) {
                    addColumnLine(value);
                });

                NewLine(TEXT_SPACE)

                addTableLine(C.TAB.ITEM
                    .INDEX, ROW_CURRENT, C.TAB.ITEM
                        .LAST, ROW_CURRENT); //--row line
        }
        else {

            var avgbills = record.GrandTotal / record.Bills
            pdfReport.text(numberWithCommas(record.Bills) + " (฿ " + numberWithCommas2(avgbills.toFixed(2)) + ")", C.TABLE_LANDSCAPE.BILLS + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)

            pdfReport.text("฿ " + numberWithCommas(record.GrandTotal.toFixed(2)), C.TABLE_LANDSCAPE.TOTAL + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
            
            //--paymentType อยู่ล่าง

            pdfReport.text("฿ " + numberWithCommas(record.SubTotal.toFixed(2)), C.TABLE_LANDSCAPE.SUBTOTAL + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
           
            var discount_value={
               itemdiscount:record.ItemDiscount,
               service:record.ServiceCharge,
               discount:record.Discount,
               vat:record.Vat
           },
           discount_tab={
            itemdiscount:C.TABLE_LANDSCAPE.ITEMDISCOUNT+ C.TEXT_PADDING.LEFT,
            service:C.TABLE_LANDSCAPE.SERVICE+ C.TEXT_PADDING.LEFT,
            discount:C.TABLE_LANDSCAPE.DISCOUNT+ C.TEXT_PADDING.LEFT,
            vat:C.TABLE_LANDSCAPE.VAT+ C.TEXT_PADDING.LEFT
           }

           _.forEach(discount_value, function (value, tab) {
               if (value == 0) {
                   pdfReport.text("-", discount_tab[tab], ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL);
               } else {
                   if (tab == "vat") {
                       pdfReport.text(value.toFixed(2), discount_tab[tab], ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL);
                   } else {
                       pdfReport.text("฿ " + numberWithCommas(value.toFixed(2)), discount_tab[tab], ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL);
                   }
               }
      
           })
                ;

            //บางวันไม่มี payment list เพราะไม่ได้ขาย
            var pt_list = 0;
            let countPayment = _.reduce(record.PaymentList, (acc, e) => { return acc + 1 }, 0);
            if (countPayment >= 1) {
                _.forEach(record.PaymentList, function (paytype) {

                    pt_list = paytype.name + "  ฿ " + numberWithCommas(paytype.amount.toFixed(2)) + " (" + paytype.bills + ")"
                    pdfReport.text(pt_list, C.TABLE_LANDSCAPE.PAYMENTTYPE + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)

                    _.forEach(C.TAB.ITEM, function (value, key) {
                        addColumnLine(value);
                    });
                    NewLine(TEXT_SPACE)
                })
                addTableLine(C.TAB.ITEM
                    .INDEX, ROW_CURRENT, C.TAB.ITEM
                        .LAST, ROW_CURRENT); //--row line
            }

            else {
                _.forEach(C.TAB.ITEM, function (value, key) {
                    addColumnLine(value);
                });

                NewLine(TEXT_SPACE)

                addTableLine(C.TAB.ITEM
                    .INDEX, ROW_CURRENT, C.TAB.ITEM
                        .LAST, ROW_CURRENT); //--row line
            }

        }

        pdfReport.font('font_style_normal').fillColor('black');

    }


    function checkPositionOutsideArea() {

        if (ROW_CURRENT > C.PAGE_TYPE.HEIGHT) {

            pdfReport.addPage(C.PAGE_TYPE.LANDSCAPE);
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