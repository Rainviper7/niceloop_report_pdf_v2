//------
const _ = require('lodash'),
    moment = require('moment')
    ;
//----------------------

var now = new Date(),
    datetime = moment(now).format("DDMMYY_HHmmSSS")
    ;

//--------product--------
var mockdata = require('./libs/product_report/mock_data').data,
    productPdf = require('./libs/product_report/index')
    ;
//--------product--------

var params = {},
    prefix_name = "product",
    ShopName = mockdata.ShopName||"Niceloop Test Lab",
    params_default = {
        filePath: '/tmp/' + filename, //cloud
        data: {},
        from: '2017-03-01T15:00:00',
        to: '2017-03-31T15:00:00',
        shopname: "" || ShopName,
        customerId: '4073'
    };
    var filename = './output/' + prefix_name + '_' + ShopName + '_' + datetime + '.pdf'
    ;

//-----------in dev mode
params_default.filePath = './output/' + prefix_name + '_' + ShopName + '_' + datetime + '.pdf'
params_default.data = mockdata;
params = _.assign({}, params_default)

//-------------------
new productPdf.Report(params, function (filePath) {
    console.log("Gen file pdf complete : " + filePath)
});


