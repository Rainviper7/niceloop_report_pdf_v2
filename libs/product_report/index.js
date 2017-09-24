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

//----------main---
exports.Report = function (options, callback) {
    var _path = options.filePath,
        _data = options.data,
        filename = _path,
        data = _data,
        shopname = options.shopname
        ;

    var dailyReport = new pdf();

    var now = new Date(),
        datetime = moment(now).format("DD MMMM YYYY, HH:mm:ss"),
        report_type = "รายงานประจำวันที่ : " + moment(data.From).format("DD/MM/YYYY")
            + " " + moment(data.From).format("HH:mm") + " - " + moment(data.To).format("HH:mm")
        ;

    //----set font
    var fontpath = path.join(__dirname, 'fonts', 'ARIALUNI.ttf'),
        fontpath_bold = path.join(__dirname, 'fonts', 'arialbd.ttf'),
        fontpath_bold_bath = path.join(__dirname, 'fonts', 'cambriab.ttf')
        // fontpath_italic = path.join(__dirname, 'fonts', 'ariali.ttf')
        ;

    dailyReport.registerFont('font_style_normal', fontpath, '')
        .registerFont('font_style_bold', fontpath_bold, '')
        // .registerFont('font_style_italic', fontpath_italic, '')
        ;

    dailyReport.font('font_style_normal');

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

        dailyReport.pipe(fs.createWriteStream(filename));

        dailyReport.font('font_style_normal')
        drawHeader();
        drawBody();
        drawFooter();
        dailyReport.end();

    }

    function drawHeader() {

        var header_data = {
            shopname: shopname,
            report_type: report_type
        }
            ;

        _.forEach(header_data, function (value, index) {
            dailyReport.fontSize(C.FONT.SIZE.HEADER)
                .text(value, C.TAB.ITEM.INDEX, ROW_CURRENT, C.STYLES_FONT.HEADER);
            NewLine(C.FONT.SIZE.HEADER + TEXT_SPACE_LOWER);
        })

        NewLine(TEXT_SPACE_SMALL);

        addGennerateDate()

        dailyReport.fillColor('black');
        NewLine(TEXT_SPACE);
        NewLine(TEXT_SPACE);

        // --chart
        addChart();

        NewLine(TEXT_SPACE);

    }

    function drawBody() {
        console.log("- building pdf report ");

        //--item
        dailyReport.fontSize(C.FONT.SIZE.HEADER)
            .text("Products", C.TAB.ITEM.INDEX, ROW_CURRENT, C.STYLES_FONT.NORMAL)
            ;
        NewLine(TEXT_SPACE);

        CatalogFiltered = _.filter(data.Sales.Catalogs, function (c) {
            // return c.Amount != 0 && c.Quantity != 0;
            return c.Amount >= 0 && c.Quantity >= 0;
        });

        _.forEach(CatalogFiltered, function (itemgroup, i, l) {

            NewLine(TEXT_SPACE);

            addTableLine(C.TAB.ITEM
                .INDEX, ROW_CURRENT, C.TAB.ITEM
                    .LAST, ROW_CURRENT); //--row line

            _.forEach(C.TAB_TABLE_GROUP.ITEM, function (value, key) {
                addColumnLine(value)
            })

            addItemGroup(itemgroup);

            NewLine(TEXT_SPACE);

            itemfillter = _.filter(itemgroup.Items, function (it) {
                // return it.Amount != 0 && it.Quantity != 0;
                return it.Amount >= 0 && it.Quantity >= 0;

            })

            _.forEach(itemfillter, function (item, key) {

                if (((key + 1) % 2) == 1) {

                    hilight = true;

                }

                if (item.SubItems.length == 1) {
                    if (hilight) {
                        addHilight(ROW_CURRENT,C.TAB.ITEM, TEXT_SPACE)
                    }

                    addTableLine(C.TAB.ITEM
                        .INDEX, ROW_CURRENT, C.TAB.ITEM
                            .LAST, ROW_CURRENT); //--row line    

                    hilight = false;


                    _.forEach(C.TAB.ITEM, function (value, key) {
                        addColumnLine(value)
                    })

                    addItems(item, key);//--text

                    NewLine(TEXT_SPACE);

                }

                else {

                    if (hilight) {
                        addHilight(ROW_CURRENT,C.TAB.ITEM, TEXT_SPACE)
                    }
                    addTableLine(C.TAB.ITEM
                        .INDEX, ROW_CURRENT, C.TAB.ITEM
                            .LAST, ROW_CURRENT); //--row line

                    _.forEach(C.TAB.ITEM, function (value, key) {
                        addColumnLine(value)
                    });

                    addItems(item, key);//--text
                    NewLine(TEXT_SPACE);

                    subitemfillter = _.filter(item.SubItems, function (subit1) {
                        // return subit1.Amount != 0 && subit1.Quantity != 0;
                        return subit1.Amount >= 0 && subit1.Quantity >= 0;

                    })

                    _.forEach(subitemfillter, function (subitem) {

                        if (hilight) {
                            addHilight(ROW_CURRENT,C.TAB.ITEM, TEXT_SPACE)
                        }

                        _.forEach(C.TAB.ITEM, function (value, key) {
                            addColumnLine(value)
                        });

                        addSubItems(subitem);//--text
                        NewLine(TEXT_SPACE);

                    });

                    hilight = false;

                }

            });
            addTableLine(C.TAB.ITEM
                .INDEX, ROW_CURRENT, C.TAB.ITEM
                    .LAST, ROW_CURRENT); //--row line
            hilight = false;


        });

        NewLine(TEXT_SPACE);
        dailyReport.fontSize(C.FONT.SIZE.SMALL)
            .text("*ราคาในตารางหักส่วนลดสินค้าแล้ว",
            C.TAB.ITEM.NAME, ROW_CURRENT, C.STYLES_FONT.NORMAL)

        NewLine(TEXT_SPACE);
        NewLine(TEXT_SPACE);

        //-----topping----

        ToppingGroupsFiltered = _.filter(data.Sales.ToppingGroups, function (c) {
            // return c.Quantity != 0;
            return c.Quantity >= 0;

        });

        if (ToppingGroupsFiltered.length == 0) {

        }

        else {
            dailyReport.fontSize(C.FONT.SIZE.HEADER)
                .text("Topping Menu", C.TAB.ITEM.INDEX, ROW_CURRENT, C.STYLES_FONT.NORMAL);
                NewLine(TEXT_SPACE);               

            _.forEach(ToppingGroupsFiltered, function (expen1, key) {

                NewLine(TEXT_SPACE); 
                addToppingGroups(expen1);//--text

                _.forEach(C.TAB_TABLE_GROUP.TOPPING, function (value, key) {
                    addColumnLine(value)
                })

                addTableLine(C.TAB_TABLE_GROUP.TOPPING
                    .INDEX, ROW_CURRENT, C.TAB_TABLE_GROUP.TOPPING
                        .LAST, ROW_CURRENT); //--row line   
                NewLine(TEXT_SPACE);

                ToppingItemsFiltered = _.filter(expen1.Toppings, function (c) {
                    // return c.Quantity != 0;
                    return c.Quantity >= 0;
                });

                _.forEach(ToppingItemsFiltered, function (toppingitem, key) {

                    if (((key + 1) % 2) == 1) {

                        addHilight(ROW_CURRENT,C.TAB.TOPPING, TEXT_SPACE)

                    }

                    addToppingItems(toppingitem, key);//--text

                    _.forEach(C.TAB_TABLE_GROUP.TOPPING
                        , function (value, key) {
                            addColumnLine(value)
                        })
                    addTableLine(C.TAB_TABLE_GROUP.TOPPING
                        .INDEX, ROW_CURRENT, C.TAB_TABLE_GROUP.TOPPING
                            .LAST, ROW_CURRENT); //--row line   
                    NewLine(TEXT_SPACE);

                });
                addTableLine(C.TAB_TABLE_GROUP.TOPPING
                    .INDEX, ROW_CURRENT, C.TAB_TABLE_GROUP.TOPPING
                        .LAST, ROW_CURRENT); //--row line   
                NewLine(TEXT_SPACE);

            });
            dailyReport.fontSize(C.FONT.SIZE.SMALL)
                .text("*** Topping Menu แสดงเฉพาะรายการที่เคลือนไหว",
                C.TAB.ITEM.NAME, ROW_CURRENT, C.STYLES_FONT.NORMAL);


            NewLine(TEXT_SPACE);
            NewLine(TEXT_SPACE);

        }

        //----DeletedMenu

        DeleteGroupsFiltered = _.filter(data.Sales.DeletedMenu, function (c) {
            // return c.Amount != 0 && c.Quantity != 0;
            return c.Amount >= 0 && c.Quantity >= 0;

        });

        if (DeleteGroupsFiltered.length == 0) {

        }

        else {
            dailyReport.fontSize(C.FONT.SIZE.HEADER)
                .text("Deleted Menu",
                C.TAB.ITEM.INDEX, ROW_CURRENT, C.STYLES_FONT.NORMAL);

            NewLine(TEXT_SPACE);
            NewLine(TEXT_SPACE);


            _.forEach(DeleteGroupsFiltered, function (expen1, key) {

                addTableLine(C.TAB_TABLE_GROUP.TOPPING
                    .INDEX, ROW_CURRENT, C.TAB_TABLE_GROUP.TOPPING
                        .LAST, ROW_CURRENT); //--row line     

                addToppingGroups(expen1);

                _.forEach(C.TAB_TABLE_GROUP.TOPPING, function (value, key) {
                    addColumnLine(value)
                })

                NewLine(TEXT_SPACE);

                DeleteItemFiltered = _.filter(expen1.Toppings, function (c) {
                    // return c.Amount != 0 && c.Quantity != 0;
                    return c.Amount >= 0 && c.Quantity >= 0;

                });

                _.forEach(DeleteItemFiltered, function (toppingitem, key) {

                    if (((key + 1) % 2) == 1) {

                        addHilight(ROW_CURRENT,C.TAB_TABLE_GROUP.TOPPING, TEXT_SPACE)

                    }
                    
                    addToppingItems(toppingitem, key);//--text

                    addTableLine(C.TAB.TOPPING
                        .INDEX, ROW_CURRENT, C.TAB.TOPPING
                            .LAST, ROW_CURRENT); //--row line

                    _.forEach(C.TAB.TOPPING
                        , function (value, key) {
                            addColumnLine(value)
                        })

                    NewLine(TEXT_SPACE);

                    addTableLine(C.TAB.TOPPING
                        .INDEX, ROW_CURRENT, C.TAB.TOPPING
                            .LAST, ROW_CURRENT); //--row line        
                });

            });

            NewLine(TEXT_SPACE);
            dailyReport.fontSize(C.FONT.SIZE.SMALL)
                .text("*** Deleted Menu แสดงเฉพาะรายการที่เคลือนไหว",
                C.TAB.ITEM.NAME, ROW_CURRENT, C.STYLES_FONT.NORMAL)

            NewLine(TEXT_SPACE);

        }
        //-----Expenses
        ExpensesGroupFiltered = _.filter(data.Expenses, function (c) {
            // return c.Amount != 0;
            return c.Amount >= 0;
        });

        if (ExpensesGroupFiltered.length == 0) {

        }

        else {

            NewLine(TEXT_SPACE);

            dailyReport.fontSize(C.FONT.SIZE.HEADER)
                .text("Expenses",
                C.TAB.ITEM.INDEX, ROW_CURRENT, C.STYLES_FONT.NORMAL)
                .text("-฿ " + numberWithCommas(data.Expense),
                C.TAB.ITEM.INDEX, ROW_CURRENT, {
                    width: C.TAB.ITEM.LAST - C.TAB.ITEM.INDEX,
                    align: "right"
                })
                ;
            NewLine(TEXT_SPACE);


            _.forEach(ExpensesGroupFiltered, function (expgroug, key) {
                NewLine(TEXT_SPACE);

                addTableLine(C.TAB_TABLE_GROUP.EXPENSE
                    .INDEX, ROW_CURRENT, C.TAB_TABLE_GROUP.EXPENSE
                        .LAST, ROW_CURRENT); //--row line

                addExpensesGroups(expgroug);

                _.forEach(C.TAB_TABLE_GROUP.EXPENSE, function (value, key) {
                    addColumnLine(value)
                })

                NewLine(TEXT_SPACE);

                ExpensesItemFiltered = _.filter(expgroug.Items, function (c) {
                    return c.Amount != 0 && c.Quantity != 0;
                });

                _.forEach(ExpensesItemFiltered, function (expitem, key) {

                    if (((key + 1) % 2) == 1) {
                        addHilight(ROW_CURRENT,C.TAB.EXPENSE, TEXT_SPACE)     
                    }

                    addExpensesItems(expitem, key);//--text

                    _.forEach(C.TAB.EXPENSE
                        , function (value, key) {
                            addColumnLine(value)
                        })
                    addTableLine(C.TAB.EXPENSE
                        .INDEX, ROW_CURRENT, C.TAB.EXPENSE
                            .LAST, ROW_CURRENT); //--row line
                    NewLine(TEXT_SPACE);

                });

            });

            addTableLine(C.TAB.EXPENSE
                .INDEX, ROW_CURRENT, C.TAB.EXPENSE
                    .LAST, ROW_CURRENT); //--row line

            NewLine(TEXT_SPACE);
            dailyReport.fontSize(C.FONT.SIZE.SMALL)
                .text("*** Expenses แสดงเฉพาะรายการที่เคลือนไหว",
                C.TAB.ITEM.NAME, ROW_CURRENT, C.STYLES_FONT.NORMAL)

            NewLine(TEXT_SPACE);
            NewLine(TEXT_SPACE);


            //--footerGrandtotal
            dailyReport.fontSize(C.FONT.SIZE.HEADER)
                .text("ยอดสุทธิ",
                C.TAB.ITEM.INDEX, ROW_CURRENT, C.STYLES_FONT.NORMAL)

            footerGrandtotal = data.GrandTotal - data.Expense

            dailyReport.fontSize(C.FONT.SIZE.HEADER)
                .text("฿ " + numberWithCommas2(footerGrandtotal),
                C.TAB.ITEM.INDEX, ROW_CURRENT, {
                    width: C.TAB.ITEM.LAST - C.TAB.ITEM.INDEX,
                    align: "right"
                })

            NewLine(TEXT_SPACE);
            NewLine(TEXT_SPACE);
        }


    }

    function drawFooter() {

        addTableLine(C.TAB.ITEM
            .INDEX, ROW_CURRENT, C.TAB.ITEM
                .LAST, ROW_CURRENT); //--row line

        addGennerateDate();

        dailyReport.fillColor('black');

        NewLine(TEXT_SPACE);

    }

    function addChart() {
        row_chart_2 = ROW_CURRENT;

        dailyReport.rect(
            C.TAB.CHART.INDEX, row_chart_2, (C.TAB.CHART.LAST - C.TAB.CHART.INDEX),
            (TEXT_SPACE_BIG + TEXT_SPACE_UPPER) * 6).fill('#f0f0f0'); //--fix code
        dailyReport.fill('black');

        //-- addTotalchart();

        var data_chart = {
            total: "฿ " + numberWithCommas(data.Income),
            itemDiscount: "-฿ " + numberWithCommas(data.ItemDiscount),
            serviceCharge: "฿ " + numberWithCommas(data.ServiceCharge),
            additionalDiscount: "-฿ " + numberWithCommas(data.Discount),
            vat: "-฿ " + numberWithCommas(data.Vat),
            grandtotal: "฿ " + numberWithCommas(data.GrandTotal)
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
            dailyReport.fontSize(C.FONT.SIZE.BIG)
                .text(title_chart[title], C.TAB.CHART.NAME, ROW_CURRENT, C.STYLES_FONT.CHART.TITLE)
                .text(amount, C.TAB.CHART.AMOUNT, ROW_CURRENT, C.STYLES_FONT.CHART.AMOUNT);

            NewLine(TEXT_SPACE + TEXT_SPACE_UPPER);
            addDashLine(C.TAB.CHART.INDEX + 15, ROW_CURRENT, C.TAB.CHART.LAST - 15, ROW_CURRENT);//--fix code
        })

        dailyReport.fontSize(C.FONT.SIZE.NORMAL)
            .text("Bills : " + data.BillCount
            + "        Avg per bill : " + numberWithCommas(data.Income / data.BillCount),
            C.TAB.CHART_2.INDEX, row_chart_2, C.STYLES_FONT.CHART_2);
        row_chart_2 += TEXT_SPACE;

        dailyReport.fontSize(C.FONT.SIZE.NORMAL)
            .text("Shift :", C.TAB.CHART_2.INDEX, row_chart_2, C.STYLES_FONT.CHART_2);
        row_chart_2 += TEXT_SPACE;

        _.forEach(data.ShiftSummary, function (e, i, l) {

            dailyReport.fontSize(C.FONT.SIZE.NORMAL)
                .text("               " + e.Name
                + "        " + "฿ " + numberWithCommas(e.Amount) + " (" + e.Quantity + ")",
                C.TAB.CHART_2.INDEX, row_chart_2, C.STYLES_FONT.CHART_2);
            row_chart_2 += TEXT_SPACE;
        })

        dailyReport.fontSize(C.FONT.SIZE.NORMAL)
            .text("PaymentType :",
            C.TAB.CHART_2.INDEX, row_chart_2, C.STYLES_FONT.CHART_2);
        row_chart_2 += TEXT_SPACE;

        _.forEach(data.PaymentTypeSummary, function (e1, i1, l1) {

            dailyReport.fontSize(C.FONT.SIZE.NORMAL)
                .text("               " + e1.Name
                + "      ฿ " + numberWithCommas(e1.Amount) + " (" + e1.Quantity + ")",
                C.TAB.CHART_2.INDEX, row_chart_2, C.STYLES_FONT.CHART_2);
            row_chart_2 += TEXT_SPACE;

        })

        _.forEach(data.VoidBills, function (e, i, l) {
            dailyReport.fontSize(C.FONT.SIZE.NORMAL)
                .text("Void Bills : " + l.length
                + "        Amount : " + "฿ " + numberWithCommas(e.GrandTotal),
                C.TAB.CHART_2.INDEX, row_chart_2, C.STYLES_FONT.CHART_2)
            row_chart_2 += TEXT_SPACE;
        });

        if (row_chart_2 > ROW_CURRENT) {
            ROW_CURRENT = row_chart_2;
        }

    }

    function addGennerateDate() {
        dailyReport.fontSize(C.FONT.SIZE.NORMAL).fillColor('#333333')
            .text("Generated at : " + datetime
            , C.TAB.ITEM.INDEX, ROW_CURRENT, {
                width: C.TAB.ITEM.LAST - C.TAB.ITEM.INDEX,
                align: 'left'
            });
    }

    function addItemGroup(itemgroup) {
        dailyReport.font("font_style_bold").fontSize(C.FONT.SIZE.NORMAL)
            .text("Qty", C.TAB_TABLE_GROUP.ITEM.QUANTITY + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
            .text("Total", C.TAB_TABLE_GROUP.ITEM.AMOUNT + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
            .text("Percent", C.TAB_TABLE_GROUP.ITEM.PERCENT + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL);
        dailyReport.font("font_style_normal");
        NewLine(TEXT_SPACE);

        _.forEach(C.TAB_TABLE_GROUP.ITEM, function (value, key) {
            addColumnLine(value);
        });

        dailyReport.fontSize(C.FONT.SIZE.NORMAL)
            .text(itemgroup.Name, C.TAB_TABLE_GROUP.ITEM.INDEX + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
            .text(itemgroup.Quantity, C.TAB_TABLE_GROUP.ITEM.QUANTITY + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
            .text("฿ " + numberWithCommas(itemgroup.Amount.toFixed(2)), C.TAB_TABLE_GROUP.ITEM.AMOUNT + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.AMOUNT)
            .text(itemgroup.Percent + "%", C.TAB_TABLE_GROUP.ITEM.PERCENT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.PERCENT);

    }

    function addItems(item, key) {

        dailyReport.fontSize(C.FONT.SIZE.NORMAL)
            .text(key + 1 + ". ", C.TAB.ITEM.INDEX + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
            .text(item.Name, C.TAB.ITEM.NAME + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
            .text(item.Quantity, C.TAB.ITEM.QUANTITY + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
            .text("฿ " + numberWithCommas(item.Amount.toFixed(2)), C.TAB.ITEM.AMOUNT + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.AMOUNT)
            .text(item.Percent + "%", C.TAB.ITEM.PERCENT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.PERCENT)
            ;
    }

    function addSubItems(subitem) {

        dailyReport.fontSize(C.FONT.SIZE.NORMAL)
            .text("- " + subitem.Name, C.TAB.ITEM.NAME + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
            .text(subitem.Quantity, C.TAB.ITEM.QUANTITY + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
            .text("฿ " + numberWithCommas(subitem.Amount.toFixed(2)), C.TAB.ITEM.AMOUNT + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.AMOUNT)
            ;
    }

    function addToppingGroups(toppinggroup) {
        dailyReport.font("font_style_bold").fontSize(C.FONT.SIZE.NORMAL)
            .text(toppinggroup.Name, C.TAB_TABLE_GROUP.TOPPING.INDEX + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
            .text("Qty", C.TAB_TABLE_GROUP.TOPPING.QUANTITY + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
            ;
        dailyReport.font("font_style_normal");
    }

    function addToppingItems(item, key) {
        dailyReport.fontSize(C.FONT.SIZE.NORMAL)
            .text(key + 1 + ". ", C.TAB.TOPPING.INDEX + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
            .text(item.Name, C.TAB.TOPPING.NAME + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
            .text(item.Quantity, C.TAB.TOPPING.QUANTITY + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
            ;

    }

    function addExpensesGroups(Expensesgroup) {
        dailyReport.font("font_style_bold").fontSize(C.FONT.SIZE.NORMAL)
            .text("Amount", C.TAB_TABLE_GROUP.EXPENSE.AMOUNT + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
            .text("Percent", C.TAB_TABLE_GROUP.EXPENSE.PERCENT + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
            ;
        dailyReport.font("font_style_normal");

        _.forEach(C.TAB_TABLE_GROUP.EXPENSE, function (value, key) {
            addColumnLine(value)
        })

        NewLine(TEXT_SPACE);

        dailyReport.fontSize(C.FONT.SIZE.NORMAL)
            .text(Expensesgroup.Name, C.TAB.EXPENSE.INDEX + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
            .text("฿ " + numberWithCommas(Expensesgroup.Amount.toFixed(2)), C.TAB.EXPENSE.AMOUNT + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.AMOUNT)
            .text((Expensesgroup.Percent * 100).toFixed(2) + "%", C.TAB.EXPENSE.PERCENT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.PERCENT)
            ;
    }

    function addExpensesItems(item, key) {

        dailyReport.fontSize(C.FONT.SIZE.NORMAL)
            .text(key + 1 + ". ", C.TAB.EXPENSE.INDEX + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
            .text(item.Name, C.TAB.EXPENSE.NAME + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.NORMAL)
            .text("฿ " + numberWithCommas(item.Amount.toFixed(2)), C.TAB.EXPENSE.AMOUNT + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.AMOUNT)
            .text((item.Percent * 100).toFixed(2) + "%", C.TAB.EXPENSE.PERCENT, ROW_CURRENT + TEXT_SPACE_UPPER, C.STYLES_FONT.PERCENT)
            ;

    }

    function checkPositionOutsideArea() {

        if (ROW_CURRENT > C.PAGE_TYPE.HEIGHT) {

            dailyReport.addPage();
            ROW_CURRENT = C.ROW.DEFAULT;

            if (hilight == true) {

                row_hilight = C.ROW.DEFAULT;

            }

        }

    }

    function addTableLine(sx, sy, ex, ey) {
        dailyReport.moveTo(sx, sy).lineTo(ex, ey).lineWidth(line_tick).strokeColor('gray').stroke();
    }

    function addDashLine(sx, sy, ex, ey) {
        dailyReport.moveTo(sx, sy).lineTo(ex, ey).lineWidth(line_tick).dash(5, { space: 5 }).strokeColor('drakgray').strokeOpacity(0.2).stroke().undash();
        dailyReport.strokeColor('black').strokeOpacity(1).lineWidth(1);
    }

    function NewLine(px) {
        ROW_CURRENT += px;
        checkPositionOutsideArea()
    }

    function addColumnLine(tab) {
        addTableLine(tab, ROW_CURRENT, tab, ROW_CURRENT + TEXT_SPACE);
    }

    function addHilight(position,tab, row_height) {

        dailyReport.rect(C.TAB.ITEM
            .INDEX, position, (tab.LAST - tab.INDEX), row_height).fill('#f0f0f0');

        dailyReport.fill('black');
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