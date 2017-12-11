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
        data = _data,
        shopname = options.shopname,
        cb = callback,
        rowChart = 0
        ;

    //---------constant
    var TEXT_SPACE_LOWER = C.TEXT_PADDING.DOWN,
        TEXT_SPACE_UPPER = C.TEXT_PADDING.UP,
        TEXT_SPACE_UPPER_HEADER = 2,
        TEXT_SPACE = C.FONT.SIZE.NORMAL + TEXT_SPACE_LOWER,
        TEXT_SPACE_BIG = C.FONT.SIZE.BIG + TEXT_SPACE_LOWER,
        TEXT_SPACE_SMALL = C.FONT.SIZE.SMALL,
        ROW_CURRENT = C.ROW.DEFAULT,
        hilight = false,
        row_hilight = 0
        ;

    //-- build file
    var ReportPdf = new pdf({ size: "A4" });

    var now = new Date(),
        report_type = "รายงานยอดขายสินค้าตามกลุ่ม ",
        time_search = "Report : " + moment(data.From).format("DD/MM/YYYY") + " - " + moment(data.To).format("DD/MM/YYYY")
        ;

    //----set font
    var fontpath = path.join(__dirname, 'fonts', 'droidsansth.ttf'),
        fontpath_bold = path.join(__dirname, 'fonts', 'arialbd.ttf'),
        fontpath_bold_bath = path.join(__dirname, 'fonts', 'cambriab.ttf')
        ;

    ReportPdf.registerFont('font_style_normal', fontpath, '')
        .registerFont('font_style_bold', fontpath_bold, '')
        .registerFont('font_style_bold_bath', fontpath_bold_bath, '')
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

        var header_data = [shopname, report_type, time_search]

        _.forEach(header_data, function (title, index) {
            ReportPdf.fontSize(C.FONT.SIZE.HEADER)
                .text(title, C.TAB.ITEMS.INDEX, ROW_CURRENT, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST));
            NewLine(C.FONT.SIZE.HEADER + TEXT_SPACE_LOWER);
        })
        NewLine(TEXT_SPACE_SMALL);

        utils.addGennerateDate(ReportPdf, C.TAB.ITEMS, ROW_CURRENT)
        ReportPdf.fillColor('black');
        NewLine(TEXT_SPACE);
        NewLine(TEXT_SPACE);

        // --draw chart
        addSummaryChart();
        addDetailChart();

        //--check row after draw chart              
        if (rowChart > ROW_CURRENT) {
            ROW_CURRENT = rowChart;
        }

        NewLine(TEXT_SPACE);

    }

    function drawBody() {
        console.log("- building pdf report ");

        //--item
        ReportPdf.fontSize(C.FONT.SIZE.HEADER)
            .text("Products", C.TAB.ITEMS.INDEX, ROW_CURRENT, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
            ;
        NewLine(TEXT_SPACE);

        var CatalogFiltered = _.filter(data.Sales.Catalogs, function (c) {
            return c.Amount != 0 || c.Quantity != 0;
        });

        _.forEach(CatalogFiltered, function (itemgroup, i, l) {

            NewLine(TEXT_SPACE);

            addLineLocal(ReportPdf, C.TAB_TABLE_GROUP.ITEMS)

            _.forEach(C.TAB_TABLE_GROUP.ITEMS, function (tabValue, tabName) {
                addColumnLine(ReportPdf, tabValue)
            })

            addItemGroup(itemgroup);

            NewLine(TEXT_SPACE);

            var itemFilltered = _.filter(itemgroup.Items, function (it) {
                return it.Amount != 0 || it.Quantity != 0;
            })

            _.forEach(itemFilltered, function (item, index) {

                if (((index + 1) % 2) == 1) {

                    hilight = true;

                }

                if (item.SubItems.length == 1) {
                    if (hilight) {

                        utils.addHilight(ReportPdf, C.TAB.ITEMS, ROW_CURRENT, TEXT_SPACE)

                    }

                    addLineLocal(ReportPdf, C.TAB.ITEMS)

                    hilight = false;


                    _.forEach(C.TAB.ITEMS, function (tabValue, tabName) {
                        addColumnLine(ReportPdf, tabValue)
                    })

                    addItems(item, index);//--text
                    NewLine(TEXT_SPACE);

                }

                else {
                    // render suittems
                    if (hilight) {

                        utils.addHilight(ReportPdf, C.TAB.ITEMS, ROW_CURRENT, TEXT_SPACE)
                    }
                    addLineLocal(ReportPdf, C.TAB.ITEMS)

                    _.forEach(C.TAB.ITEMS, function (tabValue, tabName) {
                        addColumnLine(ReportPdf, tabValue)
                    })

                    addItems(item, index);//--text
                    NewLine(TEXT_SPACE);

                    var subItemFilltered = _.filter(item.SubItems, function (subit1) {
                        return subit1.Amount != 0 || subit1.Quantity != 0;
                    })

                    _.forEach(subItemFilltered, function (subitem) {

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
            addLineLocal(ReportPdf, C.TAB.ITEMS)
            hilight = false;


        });

        NewLine(TEXT_SPACE);
        ReportPdf.fontSize(C.FONT.SIZE.SMALL)
            .text("*ราคาในตารางหักส่วนลดสินค้าแล้ว",
            C.TAB.ITEMS.NAME, ROW_CURRENT, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))

        NewLine(TEXT_SPACE);
        NewLine(TEXT_SPACE);

        //-----topping----

        var ToppingGroupsFiltered = _.filter(data.Sales.ToppingGroups, function (c) {
            return c.Quantity != 0;
        });

        if (ToppingGroupsFiltered.length == 0) {

        }

        else {
            ReportPdf.fontSize(C.FONT.SIZE.HEADER)
                .text("Topping Menu", C.TAB.ITEMS.INDEX, ROW_CURRENT, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST));
            NewLine(TEXT_SPACE);

            _.forEach(ToppingGroupsFiltered, function (expen1, index) {

                NewLine(TEXT_SPACE);
                addToppingGroups(expen1);//--text

                _.forEach(C.TAB_TABLE_GROUP.TOPPING, function (tabValue, tabName) {
                    addColumnLine(ReportPdf, tabValue)
                })

                addLineLocal(ReportPdf, C.TAB_TABLE_GROUP.TOPPING)

                NewLine(TEXT_SPACE);

                var ToppingItemsFiltered = _.filter(expen1.Toppings, function (c) {
                    return c.Quantity != 0;
                });

                _.forEach(ToppingItemsFiltered, function (toppingitem, index) {

                    if (((index + 1) % 2) == 1) {

                        utils.addHilight(ReportPdf, C.TAB.TOPPING, ROW_CURRENT, TEXT_SPACE)

                    }

                    addToppingItems(toppingitem, index);//--text

                    _.forEach(C.TAB.TOPPING, function (tabValue, tabName) {
                        addColumnLine(ReportPdf, tabValue)
                    })

                    addLineLocal(ReportPdf, C.TAB_TABLE_GROUP.TOPPING)

                    NewLine(TEXT_SPACE);

                });
                addLineLocal(ReportPdf, C.TAB_TABLE_GROUP.TOPPING)
                NewLine(TEXT_SPACE);


            });
            ReportPdf.fontSize(C.FONT.SIZE.SMALL)
                .text("*** Topping Menu แสดงเฉพาะรายการที่เคลือนไหว",
                C.TAB.ITEMS.NAME, ROW_CURRENT, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST));


            NewLine(TEXT_SPACE);
            NewLine(TEXT_SPACE);

        }

        //----DeletedMenu

        var DeleteGroupsFiltered = _.filter(data.Sales.DeletedMenu, function (c) {
            return c.Amount != 0 || c.Quantity != 0;
        });

        if (DeleteGroupsFiltered.length == 0) {

        }

        else {
            ReportPdf.fontSize(C.FONT.SIZE.HEADER)
                .text("Deleted Menu",
                C.TAB.ITEMS.INDEX, ROW_CURRENT, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST));

            NewLine(TEXT_SPACE);
            NewLine(TEXT_SPACE);


            _.forEach(DeleteGroupsFiltered, function (expen1, index) {

                addLineLocal(ReportPdf, C.TAB_TABLE_GROUP.DELETED)

                addDeletedGroups(expen1);

                _.forEach(C.TAB_TABLE_GROUP.DELETED, function (tabValue, tabName) {
                    addColumnLine(ReportPdf, tabValue)
                })

                NewLine(TEXT_SPACE);

                var DeleteItemFiltered = _.filter(expen1.Toppings, function (c) {
                    return c.Amount != 0 && c.Quantity != 0;
                });

                _.forEach(DeleteItemFiltered, function (toppingitem, index) {

                    if (((index + 1) % 2) == 1) {

                        utils.addHilight(ReportPdf, C.TAB_TABLE_GROUP.DELETED, ROW_CURRENT, TEXT_SPACE)

                    }

                    addDeletedItems(toppingitem, index);//--text

                    addLineLocal(ReportPdf, C.TAB_TABLE_GROUP.DELETED)

                    _.forEach(C.TAB.DELETED, function (tabValue, tabName) {
                        addColumnLine(ReportPdf, tabValue)
                    })

                    NewLine(TEXT_SPACE);

                    addLineLocal(ReportPdf, C.TAB_TABLE_GROUP.DELETED)
                });

                NewLine(TEXT_SPACE);

            });


            ReportPdf.fontSize(C.FONT.SIZE.SMALL)
                .text("*** Deleted Menu แสดงเฉพาะรายการที่เคลือนไหว",
                C.TAB.ITEMS.NAME, ROW_CURRENT, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))

            NewLine(TEXT_SPACE);
            NewLine(TEXT_SPACE);

        }

    }

    function drawFooter() {

        addLineLocal(ReportPdf, C.TAB.ITEMS)
        utils.addGennerateDate(ReportPdf, C.TAB.ITEMS, ROW_CURRENT);
        ReportPdf.fillColor('black');

        NewLine(TEXT_SPACE);

        ReportPdf.fontSize(C.FONT.SIZE.SMALL)
            .text("*หมายเหตุ : ข้อมูลสินค้าที่แสดงยังไม่(รวม/หัก) Service, ส่วนลดท้ายบิล, Vat.", C.TAB.ITEMS.INDEX, ROW_CURRENT, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST));
        NewLine(TEXT_SPACE);

    }

    function addSummaryChart(row_SummaryChart) {
        rowChart = ROW_CURRENT;

        //--draw chart background
        ReportPdf.rect(
            C.TAB.CHART.INDEX, rowChart, (C.TAB.CHART.LAST - C.TAB.CHART.INDEX),
            (TEXT_SPACE_BIG + TEXT_SPACE_UPPER) * 3).fill('#f0f0f0'); //--fix code
        ReportPdf.fill('black');

        NewLine(TEXT_SPACE);


        //-- add Totalchart data;
        var data_chart = {
            total: {
                title: "Total :",
                amount: "฿ " + utils.numberWithCommas(data.Sales.Amount.toFixed(2)),
            },
            qty: {
                title: "Qty :",
                amount: data.Sales.Quantity
            }
        }
            ;

        _.forEach(data_chart, function (detail, key) {
            ReportPdf.fontSize(C.FONT.SIZE.BIG)
                .text(detail.title, C.TAB.CHART.NAME, ROW_CURRENT, styles_font_left(C.TAB.CHART.INDEX, C.TAB.CHART.AMOUNT))
                .text(detail.amount, C.TAB.CHART.AMOUNT, ROW_CURRENT, styles_font_right(C.TAB.CHART.AMOUNT, C.TAB.CHART.LAST - 15));  //--fix code

            NewLine(TEXT_SPACE + TEXT_SPACE_UPPER);
            addDashLineLocal(ReportPdf)
        })

        NewLine(TEXT_SPACE_SMALL);

        ReportPdf.fontSize(C.FONT.SIZE.SMALL)
            .text("*หมายเหตุ : ข้อมูลสินค้าที่แสดงยังไม่(รวม/หัก) Service, ส่วนลดท้ายบิล, Vat.",
            C.TAB.ITEMS.INDEX, ROW_CURRENT, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST));
        NewLine(TEXT_SPACE);

    }

    function addDetailChart() {
        //--detail chart
        ;
        var detail_chart = _.reduce(data.Sales.Catalogs, function (acc, groupObj, indexKey) {

            if (acc[groupObj.Type] == undefined) {
                acc[groupObj.Type] = {
                    Amount: groupObj.Amount
                }
            } else {
                acc[groupObj.Type].Amount += groupObj.Amount
            }
            return acc;
        }, {})

        if (detail_chart["Food"]) {
            ReportPdf.fontSize(C.FONT.SIZE.NORMAL)
                .text("Food : " + "[" + (detail_chart['Food'].Amount / data.Sales.Amount * 100).toFixed(2) + "%] : " + utils.numberWithCommas(detail_chart['Food'].Amount.toFixed(2)),
                C.TAB.CHART_2.INDEX, rowChart, styles_font_left(C.TAB.CHART_2.INDEX, C.TAB.CHART_2.Last))
            rowChart += TEXT_SPACE;
        } else {
            ReportPdf.fontSize(C.FONT.SIZE.NORMAL)
                .text("Food : " + "[0%] : " + 0,
                C.TAB.CHART_2.INDEX, rowChart, styles_font_left(C.TAB.CHART_2.INDEX, C.TAB.CHART_2.Last))
            rowChart += TEXT_SPACE;
        }

        if (detail_chart["Drink"]) {
            ReportPdf.fontSize(C.FONT.SIZE.NORMAL)
                .text("Drink : " + "[" + (detail_chart['Drink'].Amount / data.Sales.Amount * 100).toFixed(2) + "%] : " + utils.numberWithCommas(detail_chart['Drink'].Amount.toFixed(2)),
                C.TAB.CHART_2.INDEX, rowChart, styles_font_left(C.TAB.CHART_2.INDEX, C.TAB.CHART_2.Last))
            rowChart += TEXT_SPACE;
        } else {
            ReportPdf.fontSize(C.FONT.SIZE.NORMAL)
                .text("Drink : " + "[0%] : " + 0,
                C.TAB.CHART_2.INDEX, rowChart, styles_font_left(C.TAB.CHART_2.INDEX, C.TAB.CHART_2.Last))
            rowChart += TEXT_SPACE;
        }

        if (detail_chart["Dessert"]) {
            ReportPdf.fontSize(C.FONT.SIZE.NORMAL)
                .text("Dessert : " + "[" + (detail_chart['Dessert'].Amount / data.Sales.Amount * 100).toFixed(2) + "%] : " + utils.numberWithCommas(detail_chart['Dessert'].Amount.toFixed(2)),
                C.TAB.CHART_2.INDEX, rowChart, styles_font_left(C.TAB.CHART_2.INDEX, C.TAB.CHART_2.Last))
            rowChart += TEXT_SPACE;
        } else {
            ReportPdf.fontSize(C.FONT.SIZE.NORMAL)
                .text("Dessert : " + "[0%] : " + 0,
                C.TAB.CHART_2.INDEX, rowChart, styles_font_left(C.TAB.CHART_2.INDEX, C.TAB.CHART_2.Last))
            rowChart += TEXT_SPACE;
        }

        if (detail_chart["Other"]) {
            ReportPdf.fontSize(C.FONT.SIZE.NORMAL)
                .text("Other : " + "[" + (detail_chart['Other'].Amount / data.Sales.Amount * 100).toFixed(2) + "%] : " + utils.numberWithCommas(detail_chart['Other'].Amount.toFixed(2)),
                C.TAB.CHART_2.INDEX, rowChart, styles_font_left(C.TAB.CHART_2.INDEX, C.TAB.CHART_2.Last))
            rowChart += TEXT_SPACE;
        } else {
            ReportPdf.fontSize(C.FONT.SIZE.NORMAL)
                .text("Other : " + "[0%] : " + 0,
                C.TAB.CHART_2.INDEX, rowChart, styles_font_left(C.TAB.CHART_2.INDEX, C.TAB.CHART_2.Last))
            rowChart += TEXT_SPACE;
        }

        var detail_deleted_chart = _.reduce(data.Sales.DeletedMenu, function (acc, deletedData) {

            if (acc["Deleted"] == undefined) {
                acc["Deleted"] = {
                    Amount: deletedData.Amount
                }
            } else {
                acc["Deleted"].Amount += deletedData.Amount
            }
            return acc;
        }, {})

        if (detail_deleted_chart["Deleted"].Amount > 0) {
            ReportPdf.fontSize(C.FONT.SIZE.NORMAL)
                .text("Deleted Menu : " + "[" + (detail_deleted_chart['Deleted'].Amount / data.Sales.Amount * 100).toFixed(2) + "%] : " + utils.numberWithCommas(detail_deleted_chart['Deleted'].Amount.toFixed(2)),
                C.TAB.CHART_2.INDEX, rowChart, styles_font_left(C.TAB.CHART_2.INDEX, C.TAB.CHART_2.Last))
            rowChart += TEXT_SPACE;
        } else {
            ReportPdf.fontSize(C.FONT.SIZE.NORMAL)
                .text("Deleted Menu : " + "[0%] : " + 0,
                C.TAB.CHART_2.INDEX, rowChart, styles_font_left(C.TAB.CHART_2.INDEX, C.TAB.CHART_2.Last))
            rowChart += TEXT_SPACE;
        }


    }

    function addItemGroup(itemgroup) {
        ReportPdf.font("font_style_bold").fontSize(C.FONT.SIZE.NORMAL)
            .text("Qty", C.TAB_TABLE_GROUP.ITEMS.QUANTITY + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER_HEADER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
            .text("Total", C.TAB_TABLE_GROUP.ITEMS.AMOUNT + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER_HEADER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
            .text("Percent", C.TAB_TABLE_GROUP.ITEMS.PERCENT + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER_HEADER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST));
        ReportPdf.font("font_style_normal");
        NewLine(TEXT_SPACE);

        _.forEach(C.TAB_TABLE_GROUP.ITEMS, function (tabValue, tabName) {
            addColumnLine(ReportPdf, tabValue)
        })

        ReportPdf.fontSize(C.FONT.SIZE.NORMAL)
            .text(itemgroup.Name + "  [" + itemgroup.Type + "]", C.TAB_TABLE_GROUP.ITEMS.INDEX + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))

        ReportPdf.font("font_style_bold").fontSize(C.FONT.SIZE.NORMAL)
            .text(itemgroup.Quantity, C.TAB_TABLE_GROUP.ITEMS.QUANTITY + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
        ReportPdf.font("font_style_bold_bath").fontSize(C.FONT.SIZE.NORMAL)
            .text("฿", C.TAB_TABLE_GROUP.ITEMS.AMOUNT + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.AMOUNT, C.TAB.ITEMS.PERCENT))
        ReportPdf.font("font_style_bold").fontSize(C.FONT.SIZE.NORMAL)
            .text("   " + utils.numberWithCommas(itemgroup.Amount.toFixed(2)), C.TAB_TABLE_GROUP.ITEMS.AMOUNT + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.AMOUNT, C.TAB.ITEMS.PERCENT))
            .text(itemgroup.Percent + "%", C.TAB_TABLE_GROUP.ITEMS.PERCENT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_right(C.TAB.ITEMS.PERCENT, C.TAB.ITEMS.LAST + C.TEXT_PADDING.RIGHT));
        ReportPdf.font("font_style_normal");
    }

    function addItems(item, index) {

        ReportPdf.fontSize(C.FONT.SIZE.NORMAL)
            .text(index + 1 + ". ", C.TAB.ITEMS.INDEX + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
            .text(item.Name, C.TAB.ITEMS.NAME + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
            .text(item.Quantity, C.TAB.ITEMS.QUANTITY + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
            .text("฿ " + utils.numberWithCommas(item.Amount.toFixed(2)), C.TAB.ITEMS.AMOUNT + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.AMOUNT, C.TAB.ITEMS.PERCENT))
            .text(item.Percent + "%", C.TAB.ITEMS.PERCENT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_right(C.TAB.ITEMS.PERCENT, C.TAB.ITEMS.LAST + C.TEXT_PADDING.RIGHT))
            ;
    }

    function addSubItems(subitem) {
        var tab_subitem = 20; //--fix  code
        ReportPdf.fontSize(C.FONT.SIZE.NORMAL)
            .text("- " + subitem.Name, C.TAB.ITEMS.NAME + tab_subitem + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
            .text(subitem.Quantity, C.TAB.ITEMS.QUANTITY + tab_subitem + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
            .text("฿ " + utils.numberWithCommas(subitem.Amount.toFixed(2)), C.TAB.ITEMS.AMOUNT + tab_subitem + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.AMOUNT, C.TAB.ITEMS.PERCENT))
            ;
    }

    function addToppingGroups(toppinggroup) {
        ReportPdf.font("font_style_bold").fontSize(C.FONT.SIZE.NORMAL)
            .text(toppinggroup.Name, C.TAB_TABLE_GROUP.TOPPING.INDEX + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER_HEADER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
            .text("Qty", C.TAB_TABLE_GROUP.TOPPING.QUANTITY + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER_HEADER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
            ;
        ReportPdf.font("font_style_normal");
    }

    function addToppingItems(item, index) {
        ReportPdf.fontSize(C.FONT.SIZE.NORMAL)
            .text(index + 1 + ". ", C.TAB.TOPPING.INDEX + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
            .text(item.Name, C.TAB.TOPPING.NAME + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
            .text(item.Quantity, C.TAB.TOPPING.QUANTITY + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
            ;

    }

    function addDeletedGroups(toppinggroup) {
        ReportPdf.font("font_style_bold").fontSize(C.FONT.SIZE.NORMAL)
            .text(toppinggroup.Name, C.TAB_TABLE_GROUP.DELETED.INDEX + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER_HEADER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
            .text("Qty", C.TAB_TABLE_GROUP.DELETED.QUANTITY + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER_HEADER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
            .text("Amount", C.TAB_TABLE_GROUP.DELETED.AMOUNT + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER_HEADER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
            ;
        ReportPdf.font("font_style_normal");
    }

    function addDeletedItems(item, index) {
        ReportPdf.fontSize(C.FONT.SIZE.NORMAL)
            .text(index + 1 + ". ", C.TAB.DELETED.INDEX + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
            .text(item.Name, C.TAB.DELETED.NAME + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_deleted(C.TAB.DELETED.NAME, C.TAB.DELETED.QUANTITY))
            .text(item.Quantity, C.TAB.DELETED.QUANTITY + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_deleted(C.TAB.DELETED.QUANTITY, C.TAB.DELETED.AMOUNT))
            .text(item.Amount, C.TAB.DELETED.AMOUNT + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_deleted(C.TAB.DELETED.AMOUNT, C.TAB.DELETED.LAST))
            ;

    }

    function addExpensesGroups(Expensesgroup) {
        ReportPdf.font("font_style_bold").fontSize(C.FONT.SIZE.NORMAL)
            .text("Amount", C.TAB_TABLE_GROUP.EXPENSE.AMOUNT + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER_HEADER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
            .text("Percent", C.TAB_TABLE_GROUP.EXPENSE.PERCENT + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER_HEADER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
            ;
        ReportPdf.font("font_style_normal");

        _.forEach(C.TAB_TABLE_GROUP.EXPENSE, function (tabValue, tabName) {
            addColumnLine(ReportPdf, tabValue)
        })

        NewLine(TEXT_SPACE);

        ReportPdf.fontSize(C.FONT.SIZE.NORMAL)
            .text(Expensesgroup.Name, C.TAB.EXPENSE.INDEX + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
            .text("฿ " + numberWithCommas(Expensesgroup.Amount.toFixed(2)), C.TAB.EXPENSE.AMOUNT + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.AMOUNT, C.TAB.ITEMS.PERCENT))
            .text((Expensesgroup.Percent * 100).toFixed(2) + "%", C.TAB.EXPENSE.PERCENT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_right(C.TAB.ITEMS.PERCENT, C.TAB.ITEMS.LAST + C.TEXT_PADDING.RIGHT))
            ;
    }

    function addExpensesItems(item, index) {

        ReportPdf.fontSize(C.FONT.SIZE.NORMAL)
            .text(index + 1 + ". ", C.TAB.EXPENSE.INDEX + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
            .text(item.Name, C.TAB.EXPENSE.NAME + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.INDEX, C.TAB.ITEMS.LAST))
            .text("฿ " + numberWithCommas(item.Amount.toFixed(2)), C.TAB.EXPENSE.AMOUNT + C.TEXT_PADDING.LEFT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_left(C.TAB.ITEMS.AMOUNT, C.TAB.ITEMS.PERCENT))
            .text((item.Percent * 100).toFixed(2) + "%", C.TAB.EXPENSE.PERCENT, ROW_CURRENT + TEXT_SPACE_UPPER, styles_font_right(C.TAB.ITEMS.PERCENT, C.TAB.ITEMS.LAST + C.TEXT_PADDING.RIGHT))
            ;

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