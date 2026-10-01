MOONLIGHT JOURNALS — CUSTOM STOREFRONT & ORDER FORMS

FILES
- index.html: home page
- storefront.html: standard/custom order choice
- standard-order.html: standard size order form
- custom-order.html: custom dimension order form
- contact.html: contact details and message helper
- styles.css: responsive boutique/checkout styling
- order.js: dynamic choices, validation, and submission handling
- Code.gs: Google Apps Script email endpoint

IMPORTANT: The website is static HTML and cannot send email on its own. Before publishing, deploy Code.gs as a Google Apps Script Web App and paste its Web App URL into order.js where it says:
  PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE

SET UP THE EMAIL ENDPOINT
1. Sign in to the Google account that should send the order emails and open https://script.google.com/.
2. Create a new project. Replace the starter code with the contents of Code.gs.
3. Save the project.
4. Select Deploy > New deployment. Choose type: Web app.
5. Set “Execute as” to your account. Set access to “Anyone” so customers who visit the public GitHub Pages website can submit orders. This makes the endpoint public; keep the honeypot/validation in place and monitor email for spam.
6. Deploy and authorize the requested MailApp permission. Copy the Web app URL ending in /exec.
7. In order.js, replace PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE with that full URL. Commit/push all files to GitHub Pages.
8. Test a standard order and a custom order. Verify the email arrives at moonlightjournals.co@gmail.com and check reply-to is the customer's email.

IMPORTANT BEHAVIOR
- This setup emails order details to the shop owner. It does NOT submit answers into the original Google Forms or their response spreadsheets.
- The $35 deposit is not collected by the website. The form records the customer's acknowledgement only.
- The customer must choose a delivery address. Local drop-off is limited to within 15 miles of Detroit, MI; shipping is $7 and local drop-off is $5.
- Standard prices: Passport $50, B6 $55, A6 $60, A5 $65. Passport supports 2 or 4 journals only; other standard sizes support 2, 4, or 6. Custom orders request dimensions and are priced after review.
- The contact page's simple form opens the visitor's default email app; it does not send a message silently.

BEFORE GOING LIVE
- Confirm the owner email and prices are correct.
- Confirm whether Instagram should be required only when chosen as the preferred contact method (current behavior).
- Submit a test order and verify the email formatting, delivery choices, and mobile layout.
- Because the web app is public, do not collect payment card data or sensitive personal information in these forms.
