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
var TEXT_SPACE_LOWER = C.TEXT_PADDING.DOWN,
    TEXT_SPACE_UPPER = C.TEXT_PADDING.UP,
    TEXT_SPACE = C.FONT.SIZE.NORMAL + TEXT_SPACE_LOWER,
    TEXT_SPACE_SMALL = C.FONT.SIZE.SMALL,

    ROW_CURRENT = C.ROW.DEFAULT,

    isHilight = false,
    row_hilight = 0
    ;
//--fillter

//----------main---
exports.Report = function (options, cb) {
    var _path = options.filePath,
        _data = options.data,
        filename = _path,
        data = _data,
        shopname = options.shopname,
        callback = cb
        ;

    var pdfReport = new pdf({ autoFirstPage: false });

    pdfReport.addPage(C.PAGE_TYPE.LANDSCAPE)

    var now = new Date(),
        report_type = "รายงานการขาย",
        date_search = moment(options.from).format("DD/MM/YYYY") + " - " + moment(options.to).format("DD/MM/YYYY")
        ;

    var text_layout = {
        date: {
            title: "Date",
            position: C.TAB_TABLE_GROUP.ITEM.INDEX
        },
        bills: {
            title: "Bills(Avg.)",
            position: C.TAB_TABLE_GROUP.ITEM.BILLS
        },
        total: {
            title: "GrandTotal",
            position: C.TAB_TABLE_GROUP.ITEM.TOTAL
        },
        paytype: {
            title: "Payment Type",
            position: C.TAB_TABLE_GROUP.ITEM.PAYMENTTYPE

        },
        subtotal: {
            title: "SubTotal",
            position: C.TAB_TABLE_GROUP.ITEM.SUBTOTAL

        },
        itemdiscount: {
            title: "ItemDistcount",
            position: C.TAB_TABLE_GROUP.ITEM.ITEMDISCOUNT

        },
        service: {
            title: "Service ch.",
            position: C.TAB_TABLE_GROUP.ITEM.SERVICE

        },
        discount: {
            title: "Discount",
            position: C.TAB_TABLE_GROUP.ITEM.DISCOUNT

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

    pdfReport.registerFont('font_style_normal', fontpath, '')
        .registerFont('font_style_bold', fontpath_bold, '')
        ;

    pdfReport.font('font_style_normal');

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
            report_type,
            date_search
        ];

        _.forEach(header_data, function (info, index) {
            pdfReport.fontSize(C.FONT.SIZE.HEADER)
                .text(info, C.TAB.ITEMS.INDEX, ROW_CURRENT, C.STYLES_FONT.HEADER);
            NewLine(C.FONT.SIZE.HEADER + TEXT_SPACE_LOWER);
        })

        NewLine(TEXT_SPACE_SMALL);

        utils.addGennerateDate(pdfReport, C.TAB.ITEMS, ROW_CURRENT, C.FONT.SIZE.SMALL);

        pdfReport.fillColor('black');
        NewLine(TEXT_SPACE);
        NewLine(TEXT_SPACE);
    }



    function drawBody() {

        addLineLocal();

        addItemGroup(text_layout)

        _.forEach(C.TAB.ITEMS, function (tab, key) {
            addColumnLine(tab);
        });

        NewLine(TEXT_SPACE)
        
        addLineLocal() 
        
        _.forEach(data, function (record, index) {

            _.forEach(record, function (detail, index2) {

                addItems(detail, index2)

            })
        })
        addLineLocal()
        NewLine(TEXT_SPACE)
    }

    function drawFooter() {

        addLineLocal() 
        utils.addGennerateDate(pdfReport, C.TAB.ITEMS, ROW_CURRENT, C.FONT.SIZE.SMALL);

        pdfReport.fillColor('black');

        NewLine(TEXT_SPACE);

    }

    function addItemGroup(layout) {
        pdfReport.font('font_style_bold').fontSize(C.FONT.SIZE.NORMAL)
        _.forEach(layout, function (titlename, key) {

            pdfReport.fontSize(C.FONT.SIZE.NORMAL)
                .text(titlename.title, titlename.position + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB_TABLE_GROUP.ITEM.INDEX, C.TAB_TABLE_GROUP.ITEM.LAST));
        })
        pdfReport.font('font_style_normal')
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

        pdfReport.font('font_style_normal').fontSize(C.FONT.SIZE.SMALL)
        pdfReport.text(dateLong, C.TABLE_LANDSCAPE.INDEX + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))

        if (record.Bills == 0) {

            var detail_bill = {
                bills: {
                    amount:utils.numberWithCommas(record.Bills),
                    position: C.TABLE_LANDSCAPE.ITEM.BILLS+ C.TEXT_PADDING.LEFT
                },
                total: {
                    amount:"-",
                    position: C.TABLE_LANDSCAPE.ITEM.TOTAL+ C.TEXT_PADDING.LEFT
                },
                paytype: {
                    amount:"-",
                    position: C.TABLE_LANDSCAPE.ITEM.PAYMENTTYPE+ C.TEXT_PADDING.LEFT
                },
                subtotal: {
                    amount:"-",
                    position: C.TABLE_LANDSCAPE.ITEM.SUBTOTAL+ C.TEXT_PADDING.LEFT
                },
                itemdiscount: {
                    amount:"-",
                    position: C.TABLE_LANDSCAPE.ITEM.ITEMDISCOUNT+ C.TEXT_PADDING.LEFT
                },
                service: {
                    amount:"-",
                    position: C.TABLE_LANDSCAPE.ITEM.SERVICE+ C.TEXT_PADDING.LEFT
                },
                discount: {
                    amount:"-",
                    position: C.TABLE_LANDSCAPE.ITEM.DISCOUNT+ C.TEXT_PADDING.LEFT
                },
                vat: {
                    amount:"-",
                    position: C.TABLE_LANDSCAPE.VAT+ C.TEXT_PADDING.LEFT
                }
            };

            _.forEach(detail_bill,function(value,key){
                pdfReport.text(value.amount, value.position, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
            })
           

            _.forEach(C.TAB.ITEMS, function (tab, key) {
                addColumnLine(tab);
            });

            NewLine(TEXT_SPACE)
            addLineLocal() 
           
        }
        else {

            var avgbills = record.GrandTotal / record.Bills
            pdfReport.text(utils.numberWithCommas(record.Bills) + " (฿ " + utils.numberWithCommas(avgbills.toFixed(2)) + ")", C.TABLE_LANDSCAPE.BILLS + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))

            pdfReport.text("฿ " + utils.numberWithCommas(record.GrandTotal.toFixed(2)), C.TABLE_LANDSCAPE.TOTAL + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))

            //--paymentType อยู่ล่าง

            pdfReport.text("฿ " + utils.numberWithCommas(record.SubTotal.toFixed(2)), C.TABLE_LANDSCAPE.SUBTOTAL + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))

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
                    pdfReport.text("-", disc_name.position, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST));
                } else {
                    pdfReport.text(disc_name.amount, disc_name.position, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST));
                }

            });

            //บางวันไม่มี payment list เพราะไม่ได้ขาย
            var countPayment = _.reduce(record.PaymentList, (acc, e) => {
                return acc + 1
            }, 0);
            if (countPayment >= 1) {
                _.forEach(record.PaymentList, function (paytype) {

                    var pt_list = paytype.name + "  ฿ " + utils.numberWithCommas(paytype.amount.toFixed(2)) + " (" + paytype.bills + ")"
                    pdfReport.text(pt_list, C.TABLE_LANDSCAPE.PAYMENTTYPE + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))

                    _.forEach(C.TAB.ITEMS, function (tab, key) {
                        addColumnLine(tab);
                    });
                    NewLine(TEXT_SPACE)
                })
                addLineLocal() 

            }

            else {
                _.forEach(C.TAB.ITEMS, function (tab, key) {
                    addColumnLine(tab);
                });

                NewLine(TEXT_SPACE)
                addLineLocal() 
               
            }

        }

        pdfReport.font('font_style_normal').fillColor('black');

    }


    function checkPositionOutsideArea() {

        if (ROW_CURRENT > C.PAGE_TYPE.HEIGHT) {

            pdfReport.addPage(C.PAGE_TYPE.LANDSCAPE);
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

    function addColumnLine(tab) {

        utils.addTableLine(pdfReport, ROW_CURRENT, tab, tab, ROW_CURRENT, ROW_CURRENT + TEXT_SPACE)
    }

    function addLineLocal() {
        utils.addTableLine(pdfReport, ROW_CURRENT, C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST)

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