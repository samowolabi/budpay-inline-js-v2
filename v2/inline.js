/* 
    The `BudPayCheckout` function allows you to initiate a payment checkout modal using your BudPay Public Key. 
    This function provides a seamless integration for handling payments on your website or application.
*/

const BudPayCheckout = (config) => {
    const libraryConfig = {
        checkoutUrl: "https://budpay-checkout.vercel.app",
        checkoutSources: ["https://budpay-checkout.vercel.app", "https://budpay-inline-checkout-v2-main.budpay-cluster-prod.com"],
    }

    /* 
        For the sake of those using the first version of the library, 
        we will need to make sure their config is properly set, 
        so they can use the new version without any issues.
    */

    // In v1, key is used instead of api_key
    if (config.key) {
        config.api_key = config.key;
        delete config.key;
    }

    // In v1, amount is used as a string instead of a number
    if (config.amount && typeof config.amount === "string") {
        config.amount = parseFloat(config.amount);
    }

    // In v1, first_name, last_name, and phone are used as strings instead of object in customer
    if (config.email || config.first_name || config.last_name || config.phone) {
        config.customer = {
            email: config.email || '',
            first_name: config.first_name || '',
            last_name: config.last_name || '',
            phone: config.phone || ''
        }
        delete config.email;
        delete config.first_name;
        delete config.last_name;
        delete config.phone;
    }

    // In v1, callback is used instead of onComplete
    if (config.callback) {
        config.onComplete = config.callback;
        delete config.callback;
    }

    // In v1, onClose is used instead of onCancel
    if (config.onClose) {
        config.onCancel = config.onClose;
        delete config.onClose;
    }


    // Create Validate config function, with the following checks:
    const validateConfig = () => {
        let errors = [];

        if (!config.api_key) {
            errors.push("api_key is required");
        }
        if (!config.amount || typeof config.amount !== "number") {
            errors.push("amount is required and must be a number");
        }
        if (!config.currency || typeof config.currency !== "string") {
            errors.push("currency is required and must be a string");
        }
        if (config.reference && typeof config.reference !== "string") {
            errors.push("reference must be a string");
        }
        if (!config.customer) {
            errors.push("customer is required");
        } else {
            if (!config.customer.email || typeof config.customer.email !== "string") {
                errors.push("customer.email is required and must be a string");
            }
            if (config.customer.first_name && typeof config.customer.first_name !== "string") {
                errors.push("customer.first_name must be a string");
            }
            if (config.customer.last_name && typeof config.customer.last_name !== "string") {
                errors.push("customer.last_name must be a string");
            }
            if (config.customer.phone && typeof config.customer.phone !== "string") {
                errors.push("customer.phone must be a string");
            }
        }
        if (config.callback_url && typeof config.callback_url !== "string") {
            errors.push("callback_url must be a string");
        }
        if (config.onComplete && typeof config.onComplete !== "function") {
            errors.push("onComplete must be a function");
        }
        if (config.onCancel && typeof config.onCancel !== "function") {
            errors.push("onCancel must be a function");
        }
        if (config.custom_fields && typeof config.custom_fields !== "object") {
            errors.push("custom_fields must be an object");
        }

        return errors;
    }


    // Open Checkout Modal
    const openCheckoutModal = () => {
        let iframeDiv = document.createElement("iframe");
        iframeDiv.setAttribute("src", `${libraryConfig.checkoutUrl}`);
        iframeDiv.setAttribute("id", "budpay-iframe-container");
        iframeDiv.setAttribute("style", "position:fixed;top:0;left:0;z-index:99999999999999;border:none;opacity:0;pointer-events:none;width:100%;height:100%;");
        iframeDiv.setAttribute("allowTransparency", "true");
        iframeDiv.setAttribute("width", "100%");
        iframeDiv.setAttribute("height", "100%");
        iframeDiv.setAttribute("allow", "clipboard-read; clipboard-write");
        return iframeDiv;
    }


    // Receive Data from Parent
    window.addEventListener('message', function (event) {
        try {
            if (!event.data || !event.origin) { return }

            if (!libraryConfig.checkoutSources.includes(event.origin)) {
                throw new Error("Invalid origin");
            }

            let eventData = {
                type: event.data?.type || '',
                data: event.data?.data || {}
            };

            let iframeSelector = document.querySelector('iframe#budpay-iframe-container');

            switch (eventData.type) {
                case 'initiateTransaction':
                    let errors = validateConfig();
                    if (errors.length > 0) {
                        console.error(errors.join(", "));
                        return;
                    }

                    let initiateTransactionData = {
                        status: true,
                        type: 'merchant_integration',
                        key: config.api_key,
                        amount: config.amount.toString(),
                        currency: config.currency,
                        reference: config.reference || 'BUD_' + Math.floor((Math.random() * 1000000000) + 1) + new Date().getMilliseconds() + new Date().getSeconds(),
                        email: config.customer.email,
                        first_name: config.customer?.first_name || '',
                        last_name: config.customer?.last_name || '',
                        phone: config.customer?.phone || '',
                        callback_url: config.callback_url || '',
                        custom_fields: config.custom_fields || {}
                    }

                    sendPostMessageFuncBudPay(iframeSelector, { type: 'initiateTransactionOnCheckout_BUD', data: initiateTransactionData }, libraryConfig.checkoutUrl);
                    break;

                case 'closeTransaction':
                    closePaymentModalBudPay('iframe#budpay-iframe-container', eventData.data, config);
                    break;

                case 'cancelTransaction':
                    cancelPaymentModalBudPay('iframe#budpay-iframe-container', eventData.data, config);
                    break;

                default:
                    throw new Error("Unknown event type");
            }
        } catch (error) {
            console.error(error);
        }
    });


    // Initiate Payment Checkout Modal Function
    const initiatePayment = () => {
        try {
            let errors = validateConfig();
            if (errors.length > 0) {
                console.error(errors.join(", "));

                // Create Debug Screen if debug is set to true
                if (config.debug && config.debug === true) {
                    createDebugScreenBudPay(errors);
                }

                return;
            }

            // Open SVG Loader
            openSVGLoaderFuncBudPay();

            // Create iFrame
            let checkoutIframe = document.body.appendChild(openCheckoutModal());

            checkoutIframe.onload = () => {
                removeSVGLoaderFuncBudPay(); // Close SVG Loader

                // Set iFrame to visible
                checkoutIframe.style.opacity = "1";
                checkoutIframe.style.pointerEvents = "auto";
            }
        } catch (error) {
            console.error(error);
        }
    }

    // Initialize Payment
    initiatePayment();
}




/*
    The `BudPayCheckoutWithAccessCode` function allows you to initiate a payment checkout modal using an 
    access code and reference obtained from the BudPay API.
*/


const BudPayCheckoutWithAccessCode = (config) => {
    const libraryConfig = {
        checkoutUrl: `https://budpay-checkout.vercel.app/pay/api?reference=${config?.reference || ''}`,
        checkoutSources: ["https://budpay-checkout.vercel.app", "https://budpay-inline-checkout-v2-main.budpay-cluster-prod.com"],
    }

    const validateConfig = () => {
        let errors = [];

        if (!config.access_code || typeof config.access_code !== "string") {
            errors.push("access_code is required and must be a string");
        }
        if (!config.reference || typeof config.reference !== "string") {
            errors.push("reference is required and must be a string");
        }
        if (config.callback_url && typeof config.callback_url !== "string") {
            errors.push("callback_url must be a string");
        }
        if (config.onComplete && typeof config.onComplete !== "function") {
            errors.push("onComplete must be a function");
        }
        if (config.onCancel && typeof config.onCancel !== "function") {
            errors.push("onCancel must be a function");
        }

        return errors;
    }


    // Create SVG Loader Function
    const openSVGLoaderFuncBudPay = () => {
        let svgLoaderDiv = document.createElement("div");
        svgLoaderDiv.setAttribute("id", "budpay-svg-loader-container");
        svgLoaderDiv.setAttribute("style", "position:fixed;top:0;left:0;z-index:99999999999999;border:none;pointer-events:none;width:100%;height:100%;background:rgba(0,0,0,0.65);display:flex;justify-content:center;align-items:center;");
        svgLoaderDiv.innerHTML = `
                        <svg version="1.1" id="L9" width="80" height="80" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 0 0" xml:space="preserve">
                            <path fill="#fff" d="M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50">
                            <animateTransform attributeName="transform" attributeType="XML" type="rotate" dur="0.7s" from="0 50 50" to="360 50 50" repeatCount="indefinite"></animateTransform>
                            </path>
                        </svg>
                    `;
        document.body.appendChild(svgLoaderDiv);
    }

    // Remove SVG Loader Function
    const removeSVGLoaderFuncBudPay = () => {
        if (document.body.contains(document.getElementById('budpay-svg-loader-container'))) {
            document.getElementById('budpay-svg-loader-container').remove();
        }
    }

    // Create Debug Screen Overlay
    const createDebugScreenBudPay = (errors) => {
        // Add span to the first word of the error message
        let configErrors = errors.map((error) => {
            let words = error.split(" ");
            let firstWord = words[0];
            let restOfWords = words.slice(1).join(" ");
            return `<li><span style="border: 1px solid #dedee4;padding: 0.25rem 0.35rem;border-radius: 6px;background-color: #ffffff;font-weight: 400;">${firstWord}</span> ${restOfWords}</li>`;
        }).join("");


        let debugScreenDiv = document.createElement("div");
        debugScreenDiv.setAttribute("id", "budpay-debug-screen-container");
        debugScreenDiv.setAttribute("style", "position:fixed;top:0;left:0;z-index:99999999999999;border:none;width:100%;height:100%;background:rgba(0,0,0,0.65);display:flex;justify-content:center;align-items:center;padding:6px 3px;");
        debugScreenDiv.innerHTML = `
                <div style="border:1.5px solid #cf7488;background:#FFF1F2;padding:16px;border-radius:8px;min-width:380px;max-width:380px;">
                    <h3 style="font-size:1rem;font-weight:500">Kindly review the following configuration issues</h3>
                    
                    <ul style="display:flex;flex-direction: column;row-gap: 0.75rem;margin-top:1rem;font-size:12px;list-style:disc;margin-left:1.15rem;">
                        ${configErrors}
                    </ul>

                    <div style="display:flex;justify-content:center;">
                        <button style="font-size:13px;border:none;outline:none;background:#E11D48;color:#ffffff;padding:0.6rem 1.5rem;border-radius:6px;margin-top:1.5rem;cursor:pointer;" onclick="document.getElementById('budpay-debug-screen-container').remove()">Close</button>
                    </div>

                    <p style="color:#4d4d4d;text-align:center;font-size:10px;margin-top:1rem;">Debug mode is active. Remember to set debug to <strong>false</strong> or remove it in the production environment. <br /><br /> If you need help, please contact <a href="mailto:hi@budpay.com" style="text-decoration:underline;font-weight:600">BudPay Support</a></p>
                    <p style="color:#4d4d4d;text-align:center;font-size:10px;">Powered by <a href="https://budpay.com" target="_blank" style="text-decoration:underline;font-weight:600">BudPay</a></p>
                </div>
            `;
        document.body.prepend(debugScreenDiv);
    }


    // Open Checkout Modal
    const openCheckoutModal = () => {
        let iframeDiv = document.createElement("iframe");
        iframeDiv.setAttribute("src", `${libraryConfig.checkoutUrl}`);
        iframeDiv.setAttribute("id", "budpay-iframe-container");
        iframeDiv.setAttribute("style", "position:fixed;top:0;left:0;z-index:99999999999999;border:none;opacity:0;pointer-events:none;width:100%;height:100%;");
        iframeDiv.setAttribute("allowTransparency", "true");
        iframeDiv.setAttribute("width", "100%");
        iframeDiv.setAttribute("height", "100%");
        iframeDiv.setAttribute("allow", "clipboard-read; clipboard-write");
        return iframeDiv;
    }


    // Receive Data from Parent
    window.addEventListener('message', function (event) {
        try {
            if (!event.data || !event.origin) { return }

            if (!libraryConfig.checkoutSources.includes(event.origin)) {
                throw new Error("Invalid origin");
            }

            let eventData = {
                type: event.data?.type || '',
                data: event.data?.data || {}
            };

            switch (eventData.type) {
                case 'closeTransaction':
                    closePaymentModalBudPay('iframe#budpay-iframe-container', eventData.data, config);
                    break;

                case 'cancelTransaction':
                    cancelPaymentModalBudPay('iframe#budpay-iframe-container', eventData.data, config);
                    break;

                default:
                    throw new Error("Unknown event type");
            }
        } catch (error) {
            console.error(error);
        }
    });


    // Initiate Payment
    const initiatePayment = () => {
        try {
            let errors = validateConfig();
            if (errors.length > 0) {
                console.error(errors.join(", "));

                // Create Debug Screen if debug is set to true
                if (config.debug && config.debug === true) {
                    createDebugScreenBudPay(errors);
                }

                return;
            }

            // Open SVG Loader
            openSVGLoaderFuncBudPay();

            // Create iFrame
            let checkoutIframe = document.body.appendChild(openCheckoutModal());

            checkoutIframe.onload = () => {
                removeSVGLoaderFuncBudPay(); // Close SVG Loader

                // Set iFrame to visible
                checkoutIframe.style.opacity = "1";
                checkoutIframe.style.pointerEvents = "auto";
            }
        } catch (error) {
            console.error(error);
        }
    }

    // Initialize Payment
    initiatePayment();
}






// Helpers Functions

// Create SVG Loader Function BudPay
const openSVGLoaderFuncBudPay = () => {
    let svgLoaderDiv = document.createElement("div");
    svgLoaderDiv.setAttribute("id", "budpay-svg-loader-container");
    svgLoaderDiv.setAttribute("style", "position:fixed;top:0;left:0;z-index:99999999999999;border:none;pointer-events:none;width:100%;height:100%;background:rgba(0,0,0,0.65);display:flex;justify-content:center;align-items:center;");
    svgLoaderDiv.innerHTML = `
                    <svg version="1.1" id="L9" width="80" height="80" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 0 0" xml:space="preserve">
                        <path fill="#fff" d="M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50">
                        <animateTransform attributeName="transform" attributeType="XML" type="rotate" dur="0.7s" from="0 50 50" to="360 50 50" repeatCount="indefinite"></animateTransform>
                        </path>
                    </svg>
                `;
    document.body.appendChild(svgLoaderDiv);
}

// Remove SVG Loader Function BudPay
const removeSVGLoaderFuncBudPay = () => {
    if (document.body.contains(document.getElementById('budpay-svg-loader-container'))) {
        document.getElementById('budpay-svg-loader-container').remove();
    }
}


// Create Debug Screen Overlay
const createDebugScreenBudPay = (errors) => {
    // Add span to the first word of the error message
    let configErrors = errors.map((error) => {
        let words = error.split(" ");
        let firstWord = words[0];
        let restOfWords = words.slice(1).join(" ");
        return `<li><span style="border: 1px solid #dedee4;padding: 0.25rem 0.35rem;border-radius: 6px;background-color: #ffffff;font-weight: 400;">${firstWord}</span> ${restOfWords}</li>`;
    }).join("");


    let debugScreenDiv = document.createElement("div");
    debugScreenDiv.setAttribute("id", "budpay-debug-screen-container");
    debugScreenDiv.setAttribute("style", "position:fixed;top:0;left:0;z-index:99999999999999;border:none;width:100%;height:100%;background:rgba(0,0,0,0.65);display:flex;justify-content:center;align-items:center;padding:6px 3px;");
    debugScreenDiv.innerHTML = `
                <div style="border:1.5px solid #cf7488;background:#FFF1F2;padding:16px;border-radius:8px;min-width:380px;max-width:380px;">
                    <h3 style="font-size:1rem;font-weight:500">Kindly review the following configuration issues</h3>
                    
                    <ul style="display:flex;flex-direction: column;row-gap: 0.75rem;margin-top:1rem;font-size:12px;list-style:disc;margin-left:1.15rem;">
                        ${configErrors}
                    </ul>

                    <div style="display:flex;justify-content:center;">
                        <button style="font-size:13px;border:none;outline:none;background:#E11D48;color:#ffffff;padding:0.6rem 1.5rem;border-radius:6px;margin-top:1.5rem;cursor:pointer;" onclick="document.getElementById('budpay-debug-screen-container').remove()">Close</button>
                    </div>

                    <p style="color:#4d4d4d;text-align:center;font-size:10px;margin-top:1rem;">Debug mode is active. Remember to set debug to <strong>false</strong> or remove it in the production environment. <br /><br /> If you need help, please contact <a href="mailto:hi@budpay.com" style="text-decoration:underline;font-weight:600">BudPay Support</a></p>
                    <p style="color:#4d4d4d;text-align:center;font-size:10px;">Powered by <a href="https://budpay.com" target="_blank" style="text-decoration:underline;font-weight:600">BudPay</a></p>
                </div>
            `;
    document.body.prepend(debugScreenDiv);
}


// Add reference and status to callback_url
const appendQueryParamsBudPay = (url, reference, status) => {
    let urlObject = new URL(url);
    urlObject.searchParams.append('reference', reference);
    urlObject.searchParams.append('status', status);
    return urlObject.href;
}


// Send postMessage to iFrame
const sendPostMessageFuncBudPay = (selector, data, childIframeURL) => {
    if (selector && selector.contentWindow) {
        selector.contentWindow.postMessage(data, childIframeURL);
    }
}


// Close Payment Modal (Success or Failed)
const closePaymentModalBudPay = (selector, data, config) => {
    const iFrameContainer = document.querySelector(selector);

    if (document.body.contains(iFrameContainer)) {
        iFrameContainer.remove();
    }

    // Check if callback_url is set in config
    if (config.hasOwnProperty('callback_url') && config.callback_url) {
        let callbackURL = config.callback_url;
        window.location.href = appendQueryParamsBudPay(callbackURL, data.reference, data.status);
    } else {
        // Check if callback_url is set in data
        if (data.callback_url && data.callback_url !== null && data.callback_url !== 'null') {
            window.location.href = data.callback_url;
        } else {
            config.hasOwnProperty('onComplete') && config.onComplete && config.onComplete({
                reference: data.reference,
                status: data.status
            });
        }
    }
}


// Cancel Payment Modal
const cancelPaymentModalBudPay = (selector, data, config) => {
    const iFrameContainer = document.querySelector(selector);

    if (document.body.contains(iFrameContainer)) {
        iFrameContainer.remove();
    }

    // Check if callback_url is set in config
    if (config.hasOwnProperty('callback_url') && config.callback_url) {
        let callbackURL = config.callback_url;

        if (window) {
            window.location.href = appendQueryParamsBudPay(callbackURL, data.reference, data.status);
        }
    } else {
        // Check if callback_url is set in data
        if (data.callback_url && data.callback_url !== null && data.callback_url !== 'null') {
            window.location.href = data.callback_url;
        } else {
            config.hasOwnProperty('onCancel') && config.onCancel && config.onCancel({
                reference: data.reference,
                status: data.status
            });
        }
    }
}
