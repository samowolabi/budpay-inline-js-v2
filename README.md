
# BudPay Checkout Library

This library provides two main functions, `BudPayCheckout` and `BudPayCheckoutWithAccessCode`, to easily integrate BudPay's payment checkout modal into your website or application.


## Installation

To use the BudPay Checkout library, you need to include the BudPay script in your HTML file. Attach the following script link at the end of the `<body>` tag in your HTML file:

```html
<script src="https://budpay-inline-js-v2.vercel.app/v2/inline.js"></script>
```


## BudPayCheckout

The `BudPayCheckout` function allows you to initiate a payment checkout modal using your BudPay Public Key. This function provides a seamless integration for handling payments on your website or application.


### Example Usage

Here’s how you can use the `BudPayCheckout` function with a button to trigger the payment modal:

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>BudPay Checkout</title>
    </head>
    <body>
        <!-- Your content goes here -->

        <!-- Button to trigger the payment modal -->
        <button id="payWithBudPay">Pay with BudPay</button>

        <script src="https://budpay-inline-js-v2.vercel.app/v2/inline.js"></script>
        <script>
            document.getElementById('payWithBudPay').addEventListener('click', function () {
                BudPayCheckout({
                    api_key: "pk_test_1234567890",
                    amount: 1000,
                    currency: "NGN",
                    reference: "BUD_1234567890", // This is auto-generated, if not provided
                    customer: {
                        email: "johndoe@example.com",
                        first_name: "John",
                        last_name: "Doe",
                        phone: "08012345678"
                    },
                    callback_url: "https://yourwebsite.com/callback", // If callback_url is not provided, the onComplete function is called (if provided)
                    onComplete: (data) => { 
                        console.log('Payment completed, Status:', data.status) 
                        console.log('Payment completed, Reference:', data.reference) 
                    },
                    onCancel: (data) => { 
                        console.log('Payment cancelled, Status:', data.status) 
                        console.log('Payment cancelled, Reference:', data.reference) 
                    },
                    custom_fields: { custom_field_1: "value1", custom_field_2: "value2" },
                    debug: true // Show the debug modal to help you pass the write configs
                });
            });
        </script>
    </body>
</html>
```


### Parameters

| Parameter      | Type     | Required | Description                                                        | Example                                     |
|----------------|----------|----------|--------------------------------------------------------------------|---------------------------------------------|
| **api_key**    | `string` | Yes      | Your BudPay API Key.                                               | `"pk_test_1234567890"`                      |
| **amount**     | `number` | Yes      | The amount to charge.                                              | `100`                                      |
| **currency**   | `string` | Yes      | The currency in which to charge.                                   | `"NGN"`                                     |
| **reference**  | `string` | No       | A unique reference for the transaction.                            | `"BUD_1234567890"`                          |
| **customer**   | `object` | Yes      | The customer details.                                              | `{ email: "johndoe@example.com", first_name: "John", last_name: "Doe", phone: "08012345678" }` |
| **callback_url** | `string` | No     | The URL to redirect to after payment.                              | `"https://yourwebsite.com/callback"`        |
| **onComplete** | `function` | No     | A callback function to execute after payment is successful.        | `(data) => { console.log(data) }`           |
| **onCancel**   | `function` | No     | A callback function to execute if the payment is canceled.         | `(data) => { console.log(data) }`           |
| **custom_fields** | `object` | No   | Custom fields to include in the transaction.                       | `{ custom_field_1: "value1", custom_field_2: "value2" }` |
| **debug**      | `boolean` | No      | Enable or disable debug mode.                                      | `true`                                      |



<br/><br/>


## BudPayCheckoutWithAccessCode

The `BudPayCheckoutWithAccessCode` function allows you to initiate a payment checkout modal using an access code and reference obtained from the BudPay API.

### Obtaining Access Code and Reference

To obtain the access code and reference, make a CURL request to the BudPay API:


#### Example cURL Request

```bash copy
curl https://api.budpay.com/api/v2/transaction/initialize \
-H "Authorization: Bearer YOUR_SECRET_KEY" \
-H "Content-Type: application/json" \
-d '{ "email": "customer@email.com", "amount": "20000", "callback": "yourcallbackurl" }' \
-X POST
```


#### Example cURL Response

```html copy
{
  "status": true,
  "message": "Authorization URL created",
  "data": {
    "authorization_url": "https://www.budpay.com/checkout/wp5goiyvc1pt",
    "access_code": "wp5goiyvc1pt",
    "reference": "REF_61e469c330c2bc"
  }
}
```


### Example Usage

Here’s how you can use the `BudPayCheckoutWithAccessCode` function with a button to trigger the payment modal:

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>BudPay Checkout with Access Code</title>
    </head>
    <body>
        <!-- Your content goes here -->

        <!-- Button to trigger the payment modal -->
        <button id="payWithBudPayAccessCode">Pay with BudPay</button>

        <script src="https://budpay-inline-js-v2.vercel.app/v2/inline.js"></script>
        <script>
            document.getElementById('payWithBudPayAccessCode').addEventListener('click', function () {
                BudPayCheckoutWithAccessCode({
                    accessCode: 'your-access-code',
                    reference: 'your-reference', 
                    callback_url: 'https://your-callback-url.com', // If callback_url is not provided, the onComplete function is called (if provided)
                    onComplete: function (response) {
                        console.log('Payment completed:', response);
                    },
                    onCancel: function (response) {
                        console.log('Payment cancelled:', response);
                    },
                    debug: true // Show the debug modal to help you pass the write configs
                });
            });
        </script>
    </body>
</html>
```




### Parameters

| Parameter        | Type       | Required | Description                                               |
|------------------|------------|----------|-----------------------------------------------------------|
| **accessCode**   | `string`   | Yes      | Your BudPay access code.                                  |
| **reference**    | `string`   | Yes      | Unique reference for the transaction.                     |
| **callback_url** | `string`   | No       | URL to redirect to after payment.                         |
| **onComplete**   | `function` | No       | Callback function to execute after payment is successful. |
| **onCancel**     | `function` | No       | Callback function to execute after payment is cancelled.  |



## Last Updated
This documentation was last updated on August 19, 2024.
Version: 2.0.1