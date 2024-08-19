const BudPayCheckout = (configData) => {

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


    // Open Checkout Modal
    const openCheckoutModal = () => {
        let iframeDiv = document.createElement("iframe");
        iframeDiv.setAttribute('src', 'https://budpay-checkout.vercel.app');
        // iframeDiv.setAttribute('src', 'http://localhost:3000');
        iframeDiv.setAttribute("id", "budpay-iframe-container");
        iframeDiv.setAttribute("style", "position:fixed;top:0;left:0;z-index:99999999999999;border:none;opacity:0;pointer-events:none;width:100%;height:100%;");
        iframeDiv.setAttribute("allowTransparency", "true");
        iframeDiv.setAttribute("width", "100%");
        iframeDiv.setAttribute("height", "100%");
        iframeDiv.setAttribute("allow", "clipboard-read; clipboard-write");
        return iframeDiv;
    }

    // Email Regex Function
    function validateEmailAddress(value) {
        const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return value.match(emailRegex) ? true : false;
    }

    // Validate Email Function
    function verifyEmailData(value) {
        return (value !== '') && (value !== NaN) && (value !== 'undefined') && (value !== null) && (validateEmailAddress(value)) ? value : false;
    }

    // Validate Amount Function
    function verifyAmountData(value) {
        return (value !== '') && (value !== NaN) && (value !== 'undefined') && (value !== null) ? value : false;
    }

    // Validate API Configurations Data
    const verifyConfigData = () => {
        if ((!configData) || (configData === '') || (configData === NaN) || (configData === 'undefined') || (configData === null)) {
            return { status: false, message: 'Please set your API configurations, Please note: key, amount, email, currency is required' }
        }

        if (!configData.hasOwnProperty('key') || !configData.key) return { status: false, message: 'Please set your API key' }
        if (!configData.hasOwnProperty('amount') || !verifyAmountData(configData?.amount)) return { status: false, message: 'Please set your API amount, Please note data type must be number' }
        if (!configData.hasOwnProperty('email') || !verifyEmailData(configData?.email)) return { status: false, message: 'Please set your API email, Please ensure email entered is in correct format i.e example@gmail.com' }
        if (!configData.hasOwnProperty('currency') || !configData.currency) return { status: false, message: 'Please set your API currency' }

        return {
            status: true,
            type: 'merchant_integration',
            key: configData?.key || null,
            amount: configData?.amount || null,
            email: configData?.email || null,
            currency: configData?.currency || null,
            first_name: configData?.first_name || null,
            last_name: configData?.last_name || null,
            phone: configData?.phone || null,
            logo_url: configData?.logo_url || null,
            callback_url: configData?.callback_url || null,
            reference: configData?.reference || 'BUD_' + Math.floor((Math.random() * 1000000000) + 1) + new Date().getMilliseconds() + new Date().getSeconds()
        }
    }


    // Close Payment Modal (Success or Failed)
    const closePaymentModal = (data) => {
        const iFrameContainer = document.querySelector('iframe#budpay-iframe-container');

        if (document.body.contains(iFrameContainer)) {
            iFrameContainer.remove();
        }

        // If callback_url is set, redirect to callback_url, else use callback url set in the dashboard, if none is set, use calback function
        if (configData.hasOwnProperty('callback_url') && configData.callback_url && configData.callback_url !== null && configData.callback_url !== 'null') {
            // Redirect to callback_url
            configData.callback_url += (configData.callback_url.indexOf('?') > -1 ? '&' : '?') + 'reference=' + data.reference + '&status=' + data.status;
            window.location.href = configData.callback_url;
        } else {
            if (data.callback_url && data.callback_url !== null && data.callback_url !== 'null') {
                window.location.href = data.callback_url;
            } else {
                configData.hasOwnProperty('callback') && configData.callback(data);
            }
        }
    }


    // Cancel Payment Modal
    const cancelPaymentModal = (data) => {
        const iFrameContainer = document.querySelector('iframe#budpay-iframe-container');

        if (document.body.contains(iFrameContainer)) {
            iFrameContainer.remove();
        }

        // If callback_url is set, redirect to callback_url, else use callback url set in the dashboard, if none is set, use calback function
        if (configData.hasOwnProperty('callback_url') && configData.callback_url && configData.callback_url !== null && configData.callback_url !== 'null') {
            // Redirect to callback_url
            configData.callback_url += (configData.callback_url.indexOf('?') > -1 ? '&' : '?') + 'reference=' + data.reference + '&status=' + data.status;
            window.location.href = configData.callback_url;
        } else {
            if (data.callback_url && data.callback_url !== null && data.callback_url !== 'null') {
                window.location.href = data.callback_url;
            } else {
                configData.hasOwnProperty('callback') && configData.callback(data);
            }
        }
    }


    // Send postMessage to iFrame
    const sendPostMessageFunc = (selector, data) => {
        selector.contentWindow.postMessage(data, "*");
    }


    // Receive Data from Parent
    window.addEventListener('message', function (event) {
        if (!event.data) { return; }

        if (['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3003', 'https://budpay-checkout.vercel.app', 'https://budpay-inline-checkout-v2-main.budpay-cluster-prod.com'].includes(event.origin) === false) {
            console.error('You are accessing from untrust sources');
            return;
        }

        const eventData = event.data

        let iframeSelector = document.querySelector('iframe#budpay-iframe-container');

        if (eventData.type === 'initiateTransaction') {
            sendPostMessageFunc(iframeSelector, { type: 'initiateTransactionOnCheckout_BUD', data: verifyConfigData() });
        }
        if (eventData.type === 'closeTransaction') {
            closePaymentModal(eventData.data);
        }
        if (eventData.type === 'cancelTransaction') {
            cancelPaymentModal(eventData.data);
        }
    });

    // Initialize Transaction
    const initializeTransaction = () => {
        if (verifyConfigData().status) {
            document.body.appendChild(openSVGLoaderFuncBudPay());
            document.body.appendChild(openCheckoutModal());

            document.querySelector('iframe#budpay-iframe-container').onload = () => {
                removeSVGLoaderFuncBudPay(); // Remove SVG Loader

                let iframeSelector = document.querySelector('iframe#budpay-iframe-container');
                iframeSelector.style.opacity = 1;
                iframeSelector.style.pointerEvents = 'auto';
            }
        } else {
            console.log(verifyConfigData().message);
            console.error(verifyConfigData().message);
        }
    }

    // Initialize Transaction
    initializeTransaction();
}