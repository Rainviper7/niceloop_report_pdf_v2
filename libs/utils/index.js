const moment = require("moment")

exports.numberWithCommas = function (x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

exports.addTableLine = function (pdfReport, currentRow, fromX, toX) {

    if (!pdfReport || !pdfReport) {
        throw Error("you didn't pass the pdfReport instance or current row")
    }

    var _default = {
        sx: fromX || 50,
        sy: currentRow,
        ex: toX || 550,
        ey: currentRow
    }

    pdfReport.moveTo(_default.sx, _default.sy).lineTo(_default.ex, _default.ey).lineWidth(0.4).strokeColor('gray').stroke();
}

exports.addGennerateDateFormat = function () {
    return moment().format("DD MMMM YYYY, HH:mm:ss")
}

exports.addGennerateDate = function (pdfReport, currentRow, fontSize, hexColor) {
    var datetime = moment().format("DD MMMM YYYY, HH:mm:ss")

    pdfReport.fontSize(fontSize || 9.5).fillColor(hexColor || '#333333')
        .text("Generated at : " + datetime
        , 50, currentRow, {
            width: 550 - 50,
            align: 'left'
        });
}