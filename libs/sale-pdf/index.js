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
exports.Report = function (options, cb) {
    var _path = options.filePath,
        _data = options.data,
        filename = _path,
        data = _data,
        shopname = options.shopname,
        callback = cb
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

    var ReportPdf = new pdf({
        autoFirstPage: false,
        size: "A4"
    });

    ReportPdf.addPage(C.PAGE_TYPE.LANDSCAPE)

    var now = new Date(),
        report_type = "รายงานการขาย",
        date_search = moment(options.from).format("DD/MM/YYYY") + " - " + moment(options.to).format("DD/MM/YYYY")
        ;

    var text_layout = {
        date: {
            title: "Date",
            position: C.TAB_TABLE_GROUP.ITEMS.INDEX
        },
        bills: {
            title: "Bills(Avg.)",
            position: C.TAB_TABLE_GROUP.ITEMS.BILLS
        },
        total: {
            title: "GrandTotal",
            position: C.TAB_TABLE_GROUP.ITEMS.TOTAL
        },
        paytype: {
            title: "Payment Type",
            position: C.TAB_TABLE_GROUP.ITEMS.PAYMENTTYPE

        },
        subtotal: {
            title: "SubTotal",
            position: C.TAB_TABLE_GROUP.ITEMS.SUBTOTAL

        },
        itemdiscount: {
            title: "ItemDistcount",
            position: C.TAB_TABLE_GROUP.ITEMS.ITEMDISCOUNT

        },
        service: {
            title: "Service ch.",
            position: C.TAB_TABLE_GROUP.ITEMS.SERVICE

        },
        discount: {
            title: "Discount",
            position: C.TAB_TABLE_GROUP.ITEMS.DISCOUNT

        },
        vat: {
            title: "Vat",
            position: C.TAB.ITEMS.VAT
        }
    };

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
            cb(filename);
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
            report_type,
            date_search
        ];

        _.forEach(header_data, function (info, index) {
            ReportPdf.fontSize(C.FONT.SIZE.HEADER)
                .text(info, C.TAB.ITEMS.INDEX, ROW_CURRENT, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST));
            NewLine(C.FONT.SIZE.HEADER + TEXT_SPACE_LOWER);
        })

        NewLine(TEXT_SPACE_SMALL);

        utils.addGennerateDate(ReportPdf, C.TAB.ITEMS, ROW_CURRENT, C.FONT.SIZE.SMALL);

        ReportPdf.fillColor('black');
        NewLine(TEXT_SPACE);
        NewLine(TEXT_SPACE);
    }

    function drawBody() {

        addLineLocal(ReportPdf, C.TAB.ITEMS)

        addItemGroup(text_layout)

        _.forEach(C.TAB.ITEMS, function (tabValue, tabName) {
            addColumnLine(ReportPdf, tabValue)
        })

        NewLine(TEXT_SPACE)

        addLineLocal(ReportPdf, C.TAB.ITEMS)

        _.forEach(data, function (record, index) {

            _.forEach(record, function (detail, index2) {

                addItems(detail, index2)

            })
        })
        addLineLocal(ReportPdf, C.TAB.ITEMS)
        NewLine(TEXT_SPACE)
    }

    function drawFooter() {

        addLineLocal(ReportPdf, C.TAB.ITEMS)
        utils.addGennerateDate(ReportPdf, C.TAB.ITEMS, ROW_CURRENT, C.FONT.SIZE.SMALL);

        ReportPdf.fillColor('black');

        NewLine(TEXT_SPACE);

    }

    function addItemGroup(layout) {
        ReportPdf.font('font_style_bold').fontSize(C.FONT.SIZE.NORMAL)
        _.forEach(layout, function (titlename, key) {

            ReportPdf.fontSize(C.FONT.SIZE.NORMAL)
                .text(titlename.title, titlename.position + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB_TABLE_GROUP.ITEMS.INDEX, C.TAB_TABLE_GROUP.ITEMS.LAST));
        })
        ReportPdf.font('font_style_normal')
    }


    function addItems(record, index) {
        if (index == 'all') {
            var dateLong;
            var time = moment(options.to).diff(moment(options.from), 'days'),
                avg = record.GrandTotal / time + 1
            dateLong = "avg. ฿ " + utils.numberWithCommas(avg.toFixed(2)) + " /day";

        } else {
            var dateLong = moment(record.Date).format("DD MMMM YYYY ddd");
        }

        ReportPdf.font('font_style_normal').fontSize(C.FONT.SIZE.SMALL)
        ReportPdf.text(dateLong, C.TABLE_LANDSCAPE.INDEX + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))

        if (record.Bills == 0) {

            var detail_bill = {
                bills: {
                    amount: utils.numberWithCommas(record.Bills),
                    position: C.TABLE_LANDSCAPE.BILLS + C.TEXT_PADDING.LEFT
                },
                total: {
                    amount: "-",
                    position: C.TABLE_LANDSCAPE.TOTAL + C.TEXT_PADDING.LEFT
                },
                paytype: {
                    amount: "-",
                    position: C.TABLE_LANDSCAPE.PAYMENTTYPE + C.TEXT_PADDING.LEFT
                },
                subtotal: {
                    amount: "-",
                    position: C.TABLE_LANDSCAPE.SUBTOTAL + C.TEXT_PADDING.LEFT
                },
                itemdiscount: {
                    amount: "-",
                    position: C.TABLE_LANDSCAPE.ITEMDISCOUNT + C.TEXT_PADDING.LEFT
                },
                service: {
                    amount: "-",
                    position: C.TABLE_LANDSCAPE.SERVICE + C.TEXT_PADDING.LEFT
                },
                discount: {
                    amount: "-",
                    position: C.TABLE_LANDSCAPE.DISCOUNT + C.TEXT_PADDING.LEFT
                },
                vat: {
                    amount: "-",
                    position: C.TABLE_LANDSCAPE.VAT + C.TEXT_PADDING.LEFT
                }
            };

            _.forEach(detail_bill, function (value, key) {
                ReportPdf.text(value.amount, value.position, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
            })


            _.forEach(C.TAB.ITEMS, function (tabValue, tabName) {
                addColumnLine(ReportPdf, tabValue)
            })

            NewLine(TEXT_SPACE)
            addLineLocal(ReportPdf, C.TAB.ITEMS)

        }
        else {

            var avgbills = record.GrandTotal / record.Bills
            ReportPdf.text(utils.numberWithCommas(record.Bills) + " (฿ " + utils.numberWithCommas(avgbills.toFixed(2)) + ")", C.TABLE_LANDSCAPE.BILLS + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))

            ReportPdf.text("฿ " + utils.numberWithCommas(record.GrandTotal.toFixed(2)), C.TABLE_LANDSCAPE.TOTAL + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))

            //--paymentType อยู่ล่าง

            ReportPdf.text("฿ " + utils.numberWithCommas(record.SubTotal.toFixed(2)), C.TABLE_LANDSCAPE.SUBTOTAL + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))

            //----ไม่มีส่วนลด จะเป็น "-" --
            var discount_layout = {
                itemdiscount: {
                    amount: "฿ " + utils.numberWithCommas(record.ItemDiscount.toFixed(2)),
                    position: C.TABLE_LANDSCAPE.ITEMDISCOUNT + C.TEXT_PADDING.LEFT
                },
                service: {
                    amount: "฿ " + utils.numberWithCommas(record.ServiceCharge.toFixed(2)),
                    position: C.TABLE_LANDSCAPE.SERVICE + C.TEXT_PADDING.LEFT
                },
                discount: {
                    amount: "฿ " + utils.numberWithCommas(record.Discount.toFixed(2)),
                    position: C.TABLE_LANDSCAPE.DISCOUNT + C.TEXT_PADDING.LEFT
                },
                vat: {
                    amount: record.Vat.toFixed(2),
                    position: C.TABLE_LANDSCAPE.VAT + C.TEXT_PADDING.LEFT
                }
            }
            //--fix code
            _.forEach(discount_layout, function (disc_name, key) {
                if (disc_name.amount == "฿ 0.00" || disc_name.amount == "0.00") {
                    ReportPdf.text("-", disc_name.position, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST));
                } else {
                    ReportPdf.text(disc_name.amount, disc_name.position, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST));
                }

            });

            //บางวันไม่มี payment list เพราะไม่ได้ขาย
            var countPayment = _.reduce(record.PaymentList, (acc, e) => {
                return acc + 1
            }, 0);

            if (countPayment >= 1) {
                _.forEach(record.PaymentList, function (paytype) {

                    var pt_list = paytype.name + "  ฿ " + utils.numberWithCommas(paytype.amount.toFixed(2)) + " (" + paytype.bills + ")"
                    ReportPdf.text(pt_list, C.TABLE_LANDSCAPE.PAYMENTTYPE + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))

                    _.forEach(C.TAB.ITEMS, function (tabValue, tabName) {
                        addColumnLine(ReportPdf, tabValue)
                    })
                    NewLine(TEXT_SPACE)
                })
                addLineLocal(ReportPdf, C.TAB.ITEMS)

            }

            else {
                _.forEach(C.TAB.ITEMS, function (tabValue, tabName) {
                    addColumnLine(ReportPdf, tabValue)
                })

                NewLine(TEXT_SPACE)
                addLineLocal(ReportPdf, C.TAB.ITEMS)

            }

        }

        ReportPdf.font('font_style_normal').fillColor('black');

    }

    function checkPositionOutsideArea() {

        if (ROW_CURRENT > C.PAGE_TYPE.HEIGHT) {

            ReportPdf.addPage(C.PAGE_TYPE.LANDSCAPE);
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

    function addLineLocal(pdfReport, tab) {
        utils.addTableLine(pdfReport, ROW_CURRENT, tab.INDEX, tab.LAST)
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