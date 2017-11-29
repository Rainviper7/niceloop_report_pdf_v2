const moment = require("moment")

//--number

exports.addGennerateDateFormat = function () {
    return moment().format("DD MMMM YYYY, HH:mm:ss")
}

exports.addGennerateDate = function (pdfReport, tabTable, currentRow, fontSize, hexColor) {
    var datetime = moment().format("DD MMMM YYYY, HH:mm:ss")

    pdfReport.fontSize(fontSize || 9.5).fillColor(hexColor || '#333333')
        .text("Generated at : " + datetime
        , 50, currentRow, {
            width: tabTable.LAST - tabTable.INDEX,
            align: 'left'
        });
}

exports.numberWithCommas = function (number) {
    var parts = number.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

//--draw vector

exports.addTableLine = function (pdfReport, currentRow, fromX, toX, fromY, toY) {

    if (!pdfReport || !pdfReport) {

        throw Error("you didn't pass the pdfReport instance or current row")
    }

    var _default = {
        sx: fromX || 50,
        sy: fromY || currentRow,
        ex: toX || 550,
        ey: toY || currentRow
    }

    pdfReport.moveTo(_default.sx, _default.sy).lineTo(_default.ex, _default.ey).lineWidth(0.4).strokeColor('gray').stroke();
}

exports.addDashLine = function (pdfReport, currentRow, fromX, toX, fromY, toY) {

    var _default = {
        sx: fromX || 50,
        sy: fromY || currentRow,
        ex: toX || 550,
        ey: toY || currentRow
    }
    pdfReport.moveTo(_default.sx, _default.sy).lineTo(_default.ex, _default.ey).lineWidth(0.4).dash(5, { space: 5 }).strokeColor('drakgray').strokeOpacity(0.2).stroke().undash();
    pdfReport.strokeColor('black').strokeOpacity(1).lineWidth(1);
}

exports.addHilight = function (pdfReport, tabTable, currentRow, rowHeight, hexColor) {

    pdfReport.rect(tabTable.INDEX, currentRow, (tabTable.LAST - tabTable.INDEX), rowHeight).fill(hexColor || '#f0f0f0');

    pdfReport.fill('black');
}

// exports.addHilight = function (pdfReport,startX, startY, tabTable, rowHeight, hexColor) {

//         pdfReport.rect(startX, startY, (tabTable.LAST - tabTable.INDEX), rowHeight).fill(hexColor || '#f0f0f0');

//         pdfReport.fill('black');
//     }