//------
const _ = require('lodash'),
    moment = require('moment')
    ;
//----------------------

var now = new Date(),
    datetime = moment(now).format("DDMMYY_HHmmSSS")
    ;

var params = {},
    prefix_name = "",
    ShopName = "" || "Niceloop Test Lab",
    filename = './output/' + prefix_name + '_' + ShopName + '_' + datetime + '.pdf';
    params_default = {
        filePath: '/tmp/' + filename, //cloud
        data: {},
        from: '2017-03-01T15:00:00',
        to: '2017-03-31T15:00:00',
        shopname: "" || ShopName,
        customerId: '4073'
    };

//----main---
// dailyemailPDF();
// voidPDF();
// billsPDF();
// detailbillsPDF();
// memberPDF();
// orderrangePDF();
// productbydaysPDF();
productPDF();
// salebyemployeePDF();
// salePDF();
// stockPDF();



//-------------------
function dailyemailPDF() {

    //--------dailyEmail--------
    var mockdata = require('./libs/daily_email_report/mock_data').data,
        dailyEmailPdf = require('./libs/daily_email_report/index')
        ;

    //-----------in dev mode
    if (process.env.DEV_MODE == 'true') {
        prefix_name = "daily_email",
            ShopName = "Niceloop Test Lab",
            filename = './output/' + prefix_name + '_' + ShopName + '_' + datetime + '.pdf';

            params_default.shopname = "Niceloop Test Lab"
        params_default.filePath = filename
        params_default.data = mockdata;
        params = _.assign({}, params_default)

    }

    new dailyEmailPdf.Report(params, function (filePath) {
        console.log("Gen file pdf complete : " + filePath)
    });
}



function voidPDF() {

    //--------void--------
    var voidReport = require('./libs/void_report/index')
        ;

    //-----------in dev mode
    if (process.env.DEV_MODE == 'true') {

        prefix_name = "void",
            ShopName = "Niceloop Test Lab",
            filename = './output/' + prefix_name + '_' + ShopName + '_' + datetime + '.pdf';

            params_default.shopname = "Niceloop Test Lab"
        params_default.filePath = filename
        // params_default.data = mockdata||{};
        params = _.assign({}, params_default)

    }

    new voidReport.Report(params, function (filePath) {
        console.log("Gen file pdf complete : " + filePath)
    });
}

function billsPDF() {

    //--------void--------
    var billsReport = require('./libs/bills_report/index')
        ;

    //-----------in dev mode
    if (process.env.DEV_MODE == 'true') {

        prefix_name = "bills",
            ShopName = "Niceloop Test Lab",
            filename = './output/' + prefix_name + '_' + ShopName + '_' + datetime + '.pdf';

            params_default.shopname = "Niceloop Test Lab"
        params_default.filePath = filename
        // params_default.data = mockdata||{};
        params = _.assign({}, params_default)

    }

    new billsReport.Report(params, function (filePath) {
        console.log("Gen file pdf complete : " + filePath)
    });
}

function detailbillsPDF() {

    //--------void--------
    var detailbillsReport = require('./libs/detail_bills_report/index')
        ;

    //-----------in dev mode
    if (process.env.DEV_MODE == 'true') {

        prefix_name = "detailbills",
            ShopName = "Niceloop Test Lab",
            filename = './output/' + prefix_name + '_' + ShopName + '_' + datetime + '.pdf';

            params_default.shopname = "Niceloop Test Lab"
        params_default.filePath = filename
        // params_default.data = mockdata||{};
        params = _.assign({}, params_default)

    }

    new detailbillsReport.Report(params, function (filePath) {
        console.log("Gen file pdf complete : " + filePath)
    });
}

function memberPDF() {

    //--------void--------
    var memberReport = require('./libs/member_report/index')
        ;

    //-----------in dev mode
    if (process.env.DEV_MODE == 'true') {

        prefix_name = "member",
            ShopName = "Niceloop Test Lab",
            filename = './output/' + prefix_name + '_' + ShopName + '_' + datetime + '.pdf';

            params_default.shopname = "Niceloop Test Lab"
        params_default.filePath = filename
        // params_default.data = mockdata||{};
        params = _.assign({}, params_default)

    }

    new memberReport.Report(params, function (filePath) {
        console.log("Gen file pdf complete : " + filePath)
    });
}

function orderrangePDF() {

    //--------void--------
    var orderrangeReport = require('./libs/order_on_time_range_report/index')
        ;

    //-----------in dev mode
    if (process.env.DEV_MODE == 'true') {

        prefix_name = "orderrange",
            ShopName = "Niceloop Test Lab",
            filename = './output/' + prefix_name + '_' + ShopName + '_' + datetime + '.pdf';

            params_default.shopname = "Niceloop Test Lab"
        params_default.filePath = filename
        // params_default.data = mockdata||{};
        params = _.assign({}, params_default)

    }

    new orderrangeReport.Report(params, function (filePath) {
        console.log("Gen file pdf complete : " + filePath)
    });
}

function productbydaysPDF() {

    //--------void--------
    var productbydaysReport = require('./libs/product_by_day_report/index')
        ;

    //-----------in dev mode
    if (process.env.DEV_MODE == 'true') {

        prefix_name = "productbydays",
            ShopName = "Niceloop Test Lab",
            filename = './output/' + prefix_name + '_' + ShopName + '_' + datetime + '.pdf';

            params_default.shopname = "Niceloop Test Lab"
        params_default.filePath = filename
        // params_default.data = mockdata||{};
        params = _.assign({}, params_default)

    }

    new productbydays.Report(params, function (filePath) {
        console.log("Gen file pdf complete : " + filePath)
    });
}

function productPDF() {

    //--------void--------
    var productReport = require('./libs/product-pdf/index'),
        mockdata = require('./libs/product-pdf/mock_data').data
        ;

    //-----------in dev mode
    if (process.env.DEV_MODE == 'true') {

         prefix_name = "product",
            ShopName = "Niceloop Test Lab",
            filename = './output/' + prefix_name + '_' + ShopName + '_' + datetime + '.pdf'
            ;

        params_default.shopname = mockdata.ShopName||"Niceloop Test Lab"
        params_default.filePath = filename
        params_default.data = mockdata||{};
        params = _.assign({}, params_default)

    }

    new productReport.Report(params, function (filePath) {
        console.log("Gen file pdf complete : " + filePath)
    });
}


function salebyemployeePDF() {

    //--------void--------
    var salebyemployeeReport = require('./libs/sale_by_employee/index')
        ;

    //-----------in dev mode
    if (process.env.DEV_MODE == 'true') {

        prefix_name = "salebyemployee",
            ShopName = "Niceloop Test Lab",
            filename = './output/' + prefix_name + '_' + ShopName + '_' + datetime + '.pdf';

            params_default.shopname = "Niceloop Test Lab"
        params_default.filePath = filename
        // params_default.data = mockdata||{};
        params = _.assign({}, params_default)

    }

    new salebyemployeeReport.Report(params, function (filePath) {
        console.log("Gen file pdf complete : " + filePath)
    });
}

function salePDF() {

    //--------void--------
    var saleReport = require('./libs/sale_report/index')
        ;

    //-----------in dev mode
    if (process.env.DEV_MODE == 'true') {

        prefix_name = "sale",
            ShopName = "Niceloop Test Lab",
            filename = './output/' + prefix_name + '_' + ShopName + '_' + datetime + '.pdf';

            params_default.shopname = "Niceloop Test Lab"
        params_default.filePath = filename
        // params_default.data = mockdata||{};
        params = _.assign({}, params_default)

    }

    new saleReport.Report(params, function (filePath) {
        console.log("Gen file pdf complete : " + filePath)
    });
}

function stockPDF() {

    //--------void--------
    var stockReport = require('./libs/stock/index')
        ;

    //-----------in dev mode
    if (process.env.DEV_MODE == 'true') {

        prefix_name = "stock",
            ShopName = "Niceloop Test Lab",
            filename = './output/' + prefix_name + '_' + ShopName + '_' + datetime + '.pdf';

            params_default.shopname = "Niceloop Test Lab"
        params_default.filePath = filename
        // params_default.data = mockdata||{};
        params = _.assign({}, params_default)

    }

    new stockReport.Report(params, function (filePath) {
        console.log("Gen file pdf complete : " + filePath)
    });
}