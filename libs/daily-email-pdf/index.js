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

//----------main---
exports.Report = function (options, callback) {
    var _path = options.filePath,
        _data = options.data,
        filename = _path,
        data = _data,
        shopname = options.shopname
        ;
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
    var CatalogFiltered,
        itemfillter,
        subitemfillter,
        ToppingGroupsFiltered,
        ToppingItemsFiltered,
        DeleteGroupsFiltered,
        DeleteItemFiltered,
        ExpensesGroupFiltered,
        ExpensesItemFiltered,
        footerGrandtotal
        ;

    var ReportPdf = new pdf({
        size: "A4"
    });

    var now = new Date(),
        datetime = moment(now).format("DD MMMM YYYY, HH:mm:ss"),
        report_type = "รายงานประจำวันที่ : " + moment(data.From).format("DD/MM/YYYY")
            + " " + moment(data.From).format("HH:mm") + " - " + moment(data.To).format("HH:mm")
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
                .text(value, C.TAB.ITEMS.INDEX, ROW_CURRENT, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST));
            NewLine(C.FONT.SIZE.HEADER + TEXT_SPACE_LOWER);
        })

        NewLine(TEXT_SPACE_SMALL);

        utils.addGennerateDateFormat()

        ReportPdf.fillColor('black');
        NewLine(TEXT_SPACE);
        NewLine(TEXT_SPACE);

        // --chart
        addChart();

        NewLine(TEXT_SPACE);

    }

    function drawBody() {
        console.log("- building pdf report ");

        //--item
        ReportPdf.fontSize(C.FONT.SIZE.HEADER)
            .text("Products", C.TAB.ITEMS.INDEX, ROW_CURRENT, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
            ;
        NewLine(TEXT_SPACE);

        CatalogFiltered = _.filter(data.Sales.Catalogs, function (c) {
            return c.Amount != 0 && c.Quantity != 0;
            // return c.Amount >= 0 && c.Quantity >= 0;
        });

        _.forEach(CatalogFiltered, function (itemgroup, i, l) {

            NewLine(TEXT_SPACE);

            addLineLocal(ReportPdf, C.TAB_TABLE_GROUP.ITEMS); //--row line

            _.forEach(C.TAB_TABLE_GROUP.ITEMS, function (tabValue, tabName) {
                addColumnLine(ReportPdf, tabValue)
            })

            addItemGroup(itemgroup);

            NewLine(TEXT_SPACE);

            itemfillter = _.filter(itemgroup.Items, function (it) {
                return it.Amount != 0 && it.Quantity != 0;
                // return it.Amount >= 0 && it.Quantity >= 0;

            })

            _.forEach(itemfillter, function (item, key) {

                if (((key + 1) % 2) == 1) {

                    hilight = true;

                }

                if (item.SubItems.length == 1) {
                    if (hilight) {
                        utils.addHilight(ReportPdf, C.TAB.ITEMS, ROW_CURRENT, TEXT_SPACE)
                    }

                    addLineLocal(ReportPdf, C.TAB.ITEMS); //--row line
                    hilight = false;

                    _.forEach(C.TAB.ITEMS, function (tabValue, tabName) {
                        addColumnLine(ReportPdf, tabValue)
                    })

                    addItems(item, key);//--text

                    NewLine(TEXT_SPACE);

                }

                else {

                    if (hilight) {
                        utils.addHilight(ReportPdf, C.TAB.ITEMS, ROW_CURRENT, TEXT_SPACE)
                    }
                    addLineLocal(ReportPdf, C.TAB.ITEMS); //--row line

                    _.forEach(C.TAB.ITEMS, function (tabValue, tabName) {
                        addColumnLine(ReportPdf, tabValue)
                    })

                    addItems(item, key);//--text
                    NewLine(TEXT_SPACE);

                    subitemfillter = _.filter(item.SubItems, function (subit1) {
                        return subit1.Amount != 0 && subit1.Quantity != 0;
                        // return subit1.Amount >= 0 && subit1.Quantity >= 0;

                    })

                    _.forEach(subitemfillter, function (subitem) {

                        if (hilight) {
                            utils.addHilight(ReportPdf, C.TAB.ITEMS, ROW_CURRENT, TEXT_SPACE)
                        }

                        _.forEach(C.TAB.ITEMS, function (tabValue, tabName) {
                            addColumnLine(ReportPdf, tabValue)
                        })

                        addSubItems(subitem);//--text
                        NewLine(TEXT_SPACE);

                    });

                    hilight = false;

                }

            });
            addLineLocal(ReportPdf, C.TAB.ITEMS); //--row line
            hilight = false;


        });

        NewLine(TEXT_SPACE);
        ReportPdf.fontSize(C.FONT.SIZE.SMALL)
            .text("*ราคาในตารางหักส่วนลดสินค้าแล้ว",
                C.TAB.ITEMS.NAME, ROW_CURRENT, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))

        NewLine(TEXT_SPACE);
        NewLine(TEXT_SPACE);

        //-----topping----

        ToppingGroupsFiltered = _.filter(data.Sales.ToppingGroups, function (c) {
            return c.Quantity != 0;
            // return c.Quantity >= 0;

        });

        if (ToppingGroupsFiltered.length == 0) {

        }

        else {
            ReportPdf.fontSize(C.FONT.SIZE.HEADER)
                .text("Topping Menu", C.TAB.ITEMS.INDEX, ROW_CURRENT, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST));
            NewLine(TEXT_SPACE);

            _.forEach(ToppingGroupsFiltered, function (expen1, key) {

                NewLine(TEXT_SPACE);
                addToppingGroups(expen1);//--text

                _.forEach(C.TAB_TABLE_GROUP.TOPPING, function (tabValue, tabName) {
                    addColumnLine(ReportPdf, tabValue)
                })

                addLineLocal(ReportPdf, C.TAB_TABLE_GROUP.TOPPING); //--row line

                NewLine(TEXT_SPACE);

                ToppingItemsFiltered = _.filter(expen1.Toppings, function (c) {
                    return c.Quantity != 0;
                    // return c.Quantity >= 0;
                });

                _.forEach(ToppingItemsFiltered, function (toppingitem, key) {

                    if (((key + 1) % 2) == 1) {

                        utils.addHilight(ReportPdf, C.TAB.TOPPING, ROW_CURRENT, TEXT_SPACE)

                    }

                    addToppingItems(toppingitem, key);//--text

                    _.forEach(C.TAB_TABLE_GROUP.TOPPING, function (tabValue, tabName) {
                        addColumnLine(ReportPdf, tabValue)
                    })

                    addLineLocal(ReportPdf, C.TAB_TABLE_GROUP.TOPPING); //--row line

                    NewLine(TEXT_SPACE);

                });

                addLineLocal(ReportPdf, C.TAB_TABLE_GROUP.TOPPING); //--row line

                NewLine(TEXT_SPACE);

            });
            ReportPdf.fontSize(C.FONT.SIZE.SMALL)
                .text("*** Topping Menu แสดงเฉพาะรายการที่เคลือนไหว",
                    C.TAB.ITEMS.NAME, ROW_CURRENT, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST));


            NewLine(TEXT_SPACE);
            NewLine(TEXT_SPACE);

        }

        //----DeletedMenu

        DeleteGroupsFiltered = _.filter(data.Sales.DeletedMenu, function (c) {
            return c.Amount != 0 && c.Quantity != 0;
            // return c.Amount >= 0 && c.Quantity >= 0;

        });

        if (DeleteGroupsFiltered.length == 0) {

        }

        else {
            ReportPdf.fontSize(C.FONT.SIZE.HEADER)
                .text("Deleted Menu",
                    C.TAB.ITEMS.INDEX, ROW_CURRENT, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST));

            NewLine(TEXT_SPACE);
            NewLine(TEXT_SPACE);


            _.forEach(DeleteGroupsFiltered, function (expen1, key) {

                addLineLocal(ReportPdf, C.TAB_TABLE_GROUP.TOPPING); //--row line

                addToppingGroups(expen1);

                _.forEach(C.TAB_TABLE_GROUP.TOPPING, function (tabValue, tabName) {
                    addColumnLine(ReportPdf, tabValue)
                })

                NewLine(TEXT_SPACE);

                DeleteItemFiltered = _.filter(expen1.Toppings, function (c) {
                    return c.Amount != 0 && c.Quantity != 0;
                    // return c.Amount >= 0 && c.Quantity >= 0;

                });

                _.forEach(DeleteItemFiltered, function (toppingitem, key) {

                    if (((key + 1) % 2) == 1) {

                        utils.addHilight(ReportPdf, C.TAB_TABLE_GROUP.TOPPING, ROW_CURRENT, TEXT_SPACE)

                    }

                    addToppingItems(toppingitem, key);//--text

                    addLineLocal(ReportPdf, C.TAB.TOPPING); //--row line

                    _.forEach(C.TAB.TOPPING, function (tabValue, tabName) {
                        addColumnLine(ReportPdf, tabValue)
                    })

                    NewLine(TEXT_SPACE);

                    addLineLocal(ReportPdf, C.TAB.TOPPING); //--row line

                });

            });

            NewLine(TEXT_SPACE);
            ReportPdf.fontSize(C.FONT.SIZE.SMALL)
                .text("*** Deleted Menu แสดงเฉพาะรายการที่เคลือนไหว",
                    C.TAB.ITEMS.NAME, ROW_CURRENT, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))

            NewLine(TEXT_SPACE);

        }
        //-----Expenses
        ExpensesGroupFiltered = _.filter(data.Expenses, function (c) {
            return c.Amount != 0;
            // return c.Amount >= 0;
        });

        if (ExpensesGroupFiltered.length == 0) {

        }

        else {

            NewLine(TEXT_SPACE);

            ReportPdf.fontSize(C.FONT.SIZE.HEADER)
                .text("Expenses",
                    C.TAB.ITEMS.INDEX, ROW_CURRENT, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
                .text("-฿ " + utils.numberWithCommas(data.Expense),
                    C.TAB.ITEMS.INDEX, ROW_CURRENT, styles_font_right(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
                ;
            NewLine(TEXT_SPACE);


            _.forEach(ExpensesGroupFiltered, function (expgroug, key) {
                NewLine(TEXT_SPACE);

                addLineLocal(ReportPdf, C.TAB_TABLE_GROUP.EXPENSE); //--row line

                addExpensesGroups(expgroug);

                _.forEach(C.TAB_TABLE_GROUP.EXPENSE, function (tabValue, tabName) {
                    addColumnLine(ReportPdf, tabValue)
                })

                NewLine(TEXT_SPACE);

                ExpensesItemFiltered = _.filter(expgroug.Items, function (c) {
                    return c.Amount != 0 && c.Quantity != 0;
                    // return c.Amount >= 0 && c.Quantity >= 0;
                });

                _.forEach(ExpensesItemFiltered, function (expitem, key) {

                    if (((key + 1) % 2) == 1) {

                        utils.addHilight(ReportPdf, C.TAB.EXPENSE, ROW_CURRENT, TEXT_SPACE)
                    }

                    addExpensesItems(expitem, key);//--text

                    _.forEach(C.TAB_TABLE_GROUP.EXPENSE, function (tabValue, tabName) {
                        addColumnLine(ReportPdf, tabValue)
                    })

                    addLineLocal(ReportPdf, C.TAB_TABLE_GROUP.EXPENSE); //--row line

                    NewLine(TEXT_SPACE);

                });

            });

            addLineLocal(ReportPdf, C.TAB.EXPENSE); //--row line

            NewLine(TEXT_SPACE);
            ReportPdf.fontSize(C.FONT.SIZE.SMALL)
                .text("*** Expenses แสดงเฉพาะรายการที่เคลือนไหว",
                    C.TAB.ITEMS.NAME, ROW_CURRENT, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))

            NewLine(TEXT_SPACE);
            NewLine(TEXT_SPACE);


            //--footerGrandtotal
            ReportPdf.fontSize(C.FONT.SIZE.HEADER)
                .text("ยอดสุทธิ",
                    C.TAB.ITEMS.INDEX, ROW_CURRENT, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))

            footerGrandtotal = data.GrandTotal - data.Expense

            ReportPdf.fontSize(C.FONT.SIZE.HEADER)
                .text("฿ " + utils.numberWithCommas(footerGrandtotal),
                    C.TAB.ITEMS.INDEX, ROW_CURRENT, styles_font_right(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))

            NewLine(TEXT_SPACE);
            NewLine(TEXT_SPACE);
        }

    }

    function drawFooter() {

        addLineLocal(ReportPdf, C.TAB.ITEMS); //--row line

        utils.addGennerateDateFormat()

        ReportPdf.fillColor('black');

        NewLine(TEXT_SPACE);

    }

    function addChart() {
        row_chart_2 = ROW_CURRENT;

        ReportPdf.rect(
            C.TAB.CHART.INDEX, row_chart_2, (C.TAB.CHART.LAST - C.TAB.CHART.INDEX),
            (TEXT_SPACE_BIG + TEXT_SPACE_UPPER) * 6).fill('#f0f0f0'); //--fix code
        ReportPdf.fill('black');

        //-- addTotalchart();

        var data_chart = {
            total: "฿ " + utils.numberWithCommas(data.Income),
            itemDiscount: "-฿ " + utils.numberWithCommas(data.ItemDiscount),
            serviceCharge: "฿ " + utils.numberWithCommas(data.ServiceCharge),
            additionalDiscount: "-฿ " + utils.numberWithCommas(data.Discount),
            vat: "-฿ " + utils.numberWithCommas(data.Vat),
            grandtotal: "฿ " + utils.numberWithCommas(data.GrandTotal)
        },
            title_chart = {
                total: "Total :",
                itemDiscount: "Item Discount :",
                serviceCharge: "Service Charge :",
                additionalDiscount: "Additional Discount:",
                vat: "Vat :",
                grandtotal: "Grand Total :"
            }
            ;

        _.forEach(data_chart, function (amount, title) {
            ReportPdf.fontSize(C.FONT.SIZE.BIG)
                .text(title_chart[title], C.TAB.CHART.NAME, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.CHART.INDEX, C.TAB.CHART.AMOUNT))
                .text(amount, C.TAB.CHART.AMOUNT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_right(C.TAB.CHART.AMOUNT, C.TAB.CHART.LAST - 15));//--fix code

            NewLine(TEXT_SPACE + TEXT_SPACE_UPPER);
            utils.addDashLine(ReportPdf, ROW_CURRENT + TEXT_SPACE_UPPER, C.TAB.CHART.INDEX + 15, C.TAB.CHART.LAST - 15, ROW_CURRENT, ROW_CURRENT);//--fix code
        })

        ReportPdf.fontSize(C.FONT.SIZE.NORMAL)
            .text("Bills : " + data.BillCount
                + "        Avg per bill : " + utils.numberWithCommas(data.Income / data.BillCount),
                C.TAB.CHART_2.INDEX, row_chart_2, styles_font_left(C.TAB.CHART_2.INDEX, C.TAB.CHART_2.LAST));
        row_chart_2 += TEXT_SPACE;

        ReportPdf.fontSize(C.FONT.SIZE.NORMAL)
            .text("Shift :", C.TAB.CHART_2.INDEX, row_chart_2, styles_font_left(C.TAB.CHART_2.INDEX, C.TAB.CHART_2.LAST));
        row_chart_2 += TEXT_SPACE;

        _.forEach(data.ShiftSummary, function (e, i, l) {

            ReportPdf.fontSize(C.FONT.SIZE.NORMAL)
                .text("               " + e.Name
                    + "        " + "฿ " + utils.numberWithCommas(e.Amount) + " (" + e.Quantity + ")",
                    C.TAB.CHART_2.INDEX, row_chart_2, styles_font_left(C.TAB.CHART_2.INDEX, C.TAB.CHART_2.LAST));
            row_chart_2 += TEXT_SPACE;
        })

        ReportPdf.fontSize(C.FONT.SIZE.NORMAL)
            .text("PaymentType :",
                C.TAB.CHART_2.INDEX, row_chart_2, styles_font_left(C.TAB.CHART_2.INDEX, C.TAB.CHART_2.LAST));
        row_chart_2 += TEXT_SPACE;

        _.forEach(data.PaymentTypeSummary, function (e1, i1, l1) {

            ReportPdf.fontSize(C.FONT.SIZE.NORMAL)
                .text("               " + e1.Name
                    + "      ฿ " + utils.numberWithCommas(e1.Amount) + " (" + e1.Quantity + ")",
                    C.TAB.CHART_2.INDEX, row_chart_2, styles_font_left(C.TAB.CHART_2.INDEX, C.TAB.CHART_2.LAST));
            row_chart_2 += TEXT_SPACE;

        })

        _.forEach(data.VoidBills, function (e, i, l) {
            ReportPdf.fontSize(C.FONT.SIZE.NORMAL)
                .text("Void Bills : " + l.length
                    + "        Amount : " + "฿ " + utils.numberWithCommas(e.GrandTotal),
                    C.TAB.CHART_2.INDEX, row_chart_2, styles_font_left(C.TAB.CHART_2.INDEX, C.TAB.CHART_2.LAST))
            row_chart_2 += TEXT_SPACE;
        });

        if (row_chart_2 > ROW_CURRENT) {
            ROW_CURRENT = row_chart_2;
        }

    }

    function addItemGroup(itemgroup) {
        ReportPdf.font("font_style_bold").fontSize(C.FONT.SIZE.NORMAL)
            .text("Qty", C.TAB_TABLE_GROUP.ITEMS.QUANTITY + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
            .text("Total", C.TAB_TABLE_GROUP.ITEMS.AMOUNT + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
            .text("Percent", C.TAB_TABLE_GROUP.ITEMS.PERCENT + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST));
        ReportPdf.font("font_style_normal");
        NewLine(TEXT_SPACE);

        _.forEach(C.TAB_TABLE_GROUP.ITEMS, function (tabValue, tabName) {
            addColumnLine(ReportPdf, tabValue)
        })

        ReportPdf.fontSize(C.FONT.SIZE.NORMAL)
            .text(itemgroup.Name, C.TAB_TABLE_GROUP.ITEMS.INDEX + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
            .text(itemgroup.Quantity, C.TAB_TABLE_GROUP.ITEMS.QUANTITY + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
            .text("฿ " + utils.numberWithCommas(itemgroup.Amount.toFixed(2)), C.TAB_TABLE_GROUP.ITEMS.AMOUNT + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.AMOUNT, C.TAB.ITEMS.PERCENT))
            .text(itemgroup.Percent + "%", C.TAB_TABLE_GROUP.ITEMS.PERCENT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_right(C.TAB.ITEMS.PERCENT, C.TAB.ITEMS.LAST + C.TEXT_PADDING.RIGHT));

    }

    function addItems(item, key) {

        ReportPdf.fontSize(C.FONT.SIZE.NORMAL)
            .text(key + 1 + ". ", C.TAB.ITEMS.INDEX + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
            .text(item.Name, C.TAB.ITEMS.NAME + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
            .text(item.Quantity, C.TAB.ITEMS.QUANTITY + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
            .text("฿ " + utils.numberWithCommas(item.Amount.toFixed(2)), C.TAB.ITEMS.AMOUNT + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.AMOUNT, C.TAB.ITEMS.PERCENT))
            .text(item.Percent + "%", C.TAB.ITEMS.PERCENT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_right(C.TAB.ITEMS.PERCENT, C.TAB.ITEMS.LAST + C.TEXT_PADDING.RIGHT))
            ;
    }

    function addSubItems(subitem) {

        ReportPdf.fontSize(C.FONT.SIZE.NORMAL)
            .text("- " + subitem.Name, C.TAB.ITEMS.NAME + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
            .text(subitem.Quantity, C.TAB.ITEMS.QUANTITY + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
            .text("฿ " + utils.numberWithCommas(subitem.Amount.toFixed(2)), C.TAB.ITEMS.AMOUNT + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.AMOUNT, C.TAB.ITEMS.PERCENT))
            ;
    }

    function addToppingGroups(toppinggroup) {
        ReportPdf.font("font_style_bold").fontSize(C.FONT.SIZE.NORMAL)
            .text(toppinggroup.Name, C.TAB_TABLE_GROUP.TOPPING.INDEX + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
            .text("Qty", C.TAB_TABLE_GROUP.TOPPING.QUANTITY + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
            ;
        ReportPdf.font("font_style_normal");
    }

    function addToppingItems(item, key) {
        ReportPdf.fontSize(C.FONT.SIZE.NORMAL)
            .text(key + 1 + ". ", C.TAB.TOPPING.INDEX + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
            .text(item.Name, C.TAB.TOPPING.NAME + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
            .text(item.Quantity, C.TAB.TOPPING.QUANTITY + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
            ;
    }

    function addExpensesGroups(Expensesgroup) {
        ReportPdf.font("font_style_bold").fontSize(C.FONT.SIZE.NORMAL)
            .text("Amount", C.TAB_TABLE_GROUP.EXPENSE.AMOUNT + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
            .text("Percent", C.TAB_TABLE_GROUP.EXPENSE.PERCENT + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
            ;
        ReportPdf.font("font_style_normal");

        _.forEach(C.TAB_TABLE_GROUP.EXPENSE, function (tabValue, tabName) {
            addColumnLine(ReportPdf, tabValue)
        })

        NewLine(TEXT_SPACE);

        ReportPdf.fontSize(C.FONT.SIZE.NORMAL)
            .text(Expensesgroup.Name, C.TAB.EXPENSE.INDEX + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
            .text("฿ " + utils.numberWithCommas(Expensesgroup.Amount.toFixed(2)), C.TAB.EXPENSE.AMOUNT + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.AMOUNT, C.TAB.ITEMS.PERCENT))
            .text((Expensesgroup.Percent * 100).toFixed(2) + "%", C.TAB.EXPENSE.PERCENT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_right(C.TAB.ITEMS.PERCENT, C.TAB.ITEMS.LAST + C.TEXT_PADDING.RIGHT))
            ;
    }

    function addExpensesItems(item, key) {

        ReportPdf.fontSize(C.FONT.SIZE.NORMAL)
            .text(key + 1 + ". ", C.TAB.EXPENSE.INDEX + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
            .text(item.Name, C.TAB.EXPENSE.NAME + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
            .text("฿ " + utils.numberWithCommas(item.Amount.toFixed(2)), C.TAB.EXPENSE.AMOUNT + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.AMOUNT, C.TAB.ITEMS.PERCENT))
            .text((item.Percent * 100).toFixed(2) + "%", C.TAB.EXPENSE.PERCENT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_right(C.TAB.ITEMS.PERCENT, C.TAB.ITEMS.LAST + C.TEXT_PADDING.RIGHT))
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