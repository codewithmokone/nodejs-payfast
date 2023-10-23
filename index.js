const express = require('express');
const app = express();

const crypto = require("crypto");
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

const generateSignature = (data, passPhrase = null) => {
    // Create parameter string
    let pfOutput = "";
    for (let key in data) {
        if (data.hasOwnProperty(key)) {
            console.log(key + " " + data[key])
            if (data[key] !== "") {
                pfOutput += `${key}=${encodeURIComponent(data[key].trim()).replace(/%20/g, "+")}&`
            }
        }
    }

    // Remove last ampersand
    let getString = pfOutput.slice(0, -1);
    if (passPhrase !== null) {
        getString += `&passphrase=${encodeURIComponent(passPhrase.trim()).replace(/%20/g, "+")}`;
    }

    return crypto.createHash("md5").update(getString).digest("hex");
};

const myData = [];
// Merchant details
myData["merchant_id"] = "10000100";
myData["merchant_key"] = "46f0cd694581a";
myData["return_url"] = "http://www.yourdomain.co.za/return_url";
myData["cancel_url"] = "http://www.yourdomain.co.za/cancel_url";
myData["notify_url"] = "http://www.yourdomain.co.za/notify_url";
// Buyer details
myData["name_first"] = "Simon";
myData["name_last"] = "Lephoto";
myData["email_address"] = "test@test.com";
// Transaction details
myData["m_payment_id"] = "1234";
myData["amount"] = "50.00";
myData["item_name"] = "Order#123";

// // Generate signature
// // const myPassphrase = "B31nCh3ck1ng";
const myPassphrase = "jt7NOE43FZPn";
myData["signature"] = generateSignature(myData, myPassphrase);

// let htmlForm = `<form action="https://sandbox.payfast.co.za/eng/process" method="post">`;
// for (let key in myData) {
//   if(myData.hasOwnProperty(key)){
//     value = myData[key];
//     if (value !== "") {
//       htmlForm +=`<input name="${key}" type="hidden" value="${value.trim()}" />`;
//     }
//   }
// }

// htmlForm += '<input type="submit" value="Pay Now" /></form>'; 

const ITN_Payload = {
    'm_payment_id': 'SuperUnique1',
    'pf_payment_id': '1089250',
    'payment_status': 'COMPLETE',
    'item_name': 'test+product',
    'item_description': 'test+description',
    'amount_gross': 200.00,
    'amount_fee': -4.60,
    'amount_net': 195.40,
    'custom_str1': '',
    'custom_str2': '',
    'custom_str3': '',
    'custom_str4': '',
    'custom_str5': '',
    'custom_int1': '',
    'custom_int2': '',
    'custom_int3': '',
    'custom_int4': '',
    'custom_int5': '',
    'name_first': '',
    'name_last': '',
    'email_address': '',
    'merchant_id': '10000100',
    'signature': 'ad8e7685c9522c24365d7ccea8cb3db7'
};

app.get('/', function (req, res) {
    res.send('Hello World!');
});

// Route for handling form submission
app.post('/pay', function (req, res) {

    const formData = req.body;

    const myPassphrase = "jt7NOE43FZPn";
    // formData["signature"] = generateSignature(formData, myPassphrase);

    // Construct the PayFast URL
    const payFastUrl = 'https://sandbox.payfast.co.za/eng/process';

    // Render a page that automatically submits the form to PayFast
    const htmlResponse = `
        <html>
        <body>
            <form action="${payFastUrl}" method="post">
                ${Object.entries(formData).map(([key, value]) => `
                    <input name="${key}" type="hidden" value="${value.trim()}" />
                `).join('')}
                <input type="submit" value="Pay Now" />
            </form>
        </body>
        <script>
            // Automatically submit the form when the page loads
            document.forms[0].submit();
        </script>
        </html>
    `;

    res.send(htmlResponse);
});

app.post('/success', function (req, res) {

    // Render a page that automatically submits the form to PayFast
    const htmlResponse = `
        <html>
        <body>
            <p>Thank you for shopping!</p>
        </body>
        <script>
            // Automatically submit the form when the page loads
            document.forms[0].submit();
        </script>
        </html>
    `;

    res.send(htmlResponse);
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});