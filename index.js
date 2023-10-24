const express = require('express');
const app = express();
const axios = require('axios');
const crypto = require("crypto");
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(cors());
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

// const myData = [];
// // Merchant details
// myData["merchant_id"] = "10000100";
// myData["merchant_key"] = "46f0cd694581a";
// myData["return_url"] = "http://www.yourdomain.co.za/return_url";
// myData["cancel_url"] = "http://www.yourdomain.co.za/cancel_url";
// myData["notify_url"] = "http://www.yourdomain.co.za/notify_url";
// // Buyer details
// myData["name_first"] = "Simon";
// myData["name_last"] = "Lephoto";
// myData["email_address"] = "test@test.com";
// // Transaction details
// myData["m_payment_id"] = "1234";
// myData["amount"] = "50.00";
// myData["item_name"] = "Order#123";

// // // Generate signature
// const myPassphrase = "jt7NOE43FZPn";
// myData["signature"] = generateSignature(myData, myPassphrase);

// app.get('/', function (req, res) {
//     res.send('Hello World!');
// });

const payfastMerchantId = '10031519';
const payfastMerchantKey = 'chicm4ug5ts86';

const secureKey = 'your_secret_key';


app.post('/payfast/callback', (req, res) => {
    const postData = req.body;
    const signature = req.get('pf_signature');

    const data = JSON.stringify(postData);
    const calculatedSignature = crypto
        .createHmac('md5', secureKey)
        .update(data)
        .digest('hex');

    if (calculatedSignature === signature) {
        console.log('PayFast callback received and validated');
        console.log('Subscription data:', postData);

        res.send('OK');
    } else {
        console.error('Invalid PayFast callback signature');
        res.status(400).send('Invalid Signature');
    }
});

app.post('/subscribe', async (req, res) => {

    const { subscription_type, frequency, cycles } = req.body;

    const subscriptionData = {
        "merchant_id": "10000100",
        "merchant_key": "46f0cd694581a",
        "amount": "100",
        "item_name": "reading_classes",
        "subscription_type": "1",
        "frequency": "3",
        "cycles": "12",
    };

    // const signature = generateSignature(payfastMerchantKey)

    // console.log("Client data", signature)

    try {
        const response = await axios.get(`https://sandbox.payfast.co.za/eng/process`, subscriptionData);
        res.redirect(response.data);
    } catch (error) {
        console.error('Error initiating PayFast subscription:', error);
        res.status(500).send('Failed to initiate subscription');
    }
});


app.post('/pay', function (req, res) {

    const formData = req.body;

    const payFastUrl = 'https://sandbox.payfast.co.za/eng/process';

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

const port = process.env.PORT || 3000

app.listen(port, function () {
    console.log('Example app listening on port 3000!');
});