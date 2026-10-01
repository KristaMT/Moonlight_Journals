/* Moonlight Journals order form interactions.
   Configure the Apps Script URL in this file before publishing. */
const APPS_SCRIPT_URL = 'PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE';
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('order-form');
  if (!form) return;
  const kind = form.dataset.kind || (form.querySelector('[name="orderType"]')?.value === 'Custom size' ? 'custom' : 'standard');
  const message = document.getElementById('form-message');
  const submitButton = document.getElementById('submit-button');
  const addressField = document.getElementById('address-field');
  const address = document.getElementById('address');
  const instagramField = document.getElementById('instagram-field');
  const instagram = document.getElementById('instagram');
  const count = document.getElementById('journalCount');
  const sizeRadios = [...form.querySelectorAll('[name="journalSize"]')];
  const priceText = document.getElementById('summary-price');
  const sizeSummary = document.getElementById('summary-size');
  const deliverySummary = document.getElementById('summary-delivery');
  const feeSummary = document.getElementById('summary-fee');
  const countHint = document.getElementById('count-hint');
  const addressHint = document.getElementById('address-hint');
  const setMessage = (text, error=false) => { message.textContent=text; message.classList.toggle('error',error); message.style.display='block'; message.scrollIntoView({behavior:'smooth',block:'center'}); };
  const selected = name => form.querySelector(`[name="${name}"]:checked`)?.value || '';
  const updateCountOptions = () => {
    if (!count) return;
    const passport = selected('journalSize') === 'Passport';
    const six = count.querySelector('option[value="6"]');
    if (six) six.disabled = passport;
    if (passport && count.value === '6') count.value = '';
    countHint.textContent = passport ? 'Passport covers fit 2 or 4 journals.' : 'Choose 2, 4, or 6 journals.';
  };
  const updateDelivery = () => {
    const method = selected('deliveryMethod');
    const show = Boolean(method);
    addressField?.classList.toggle('hidden', !show);
    if (address) address.required = show;
    if (addressHint) addressHint.textContent = method === 'Local drop off' ? 'Local drop-off must be within 15 miles of Detroit, Michigan.' : method === 'Shipping' ? 'Enter the full address where the order should be shipped.' : '';
    if (deliverySummary) deliverySummary.textContent = method || 'Choose below';
    if (feeSummary) feeSummary.textContent = method === 'Local drop off' ? '$5' : method === 'Shipping' ? '$7' : '—';
  };
  const updateContact = () => {
    const method = selected('contactMethod');
    const show = method === 'Instagram Handle';
    instagramField?.classList.toggle('hidden', !show);
    if (instagram) instagram.required = show;
  };
   
const updateType = () => {
  const foldStyle = selected('foldStyle');
  const typeSummary = document.getElementById('summary-type');

  if (typeSummary) {
    typeSummary.textContent = foldStyle || 'Not selected';
  }
};


const updateSize = () => {
  const chosen = form.querySelector('[name="journalSize"]:checked');

  if (chosen) {
    if (sizeSummary) {
      sizeSummary.textContent = `${chosen.value} journal`;
    }

    if (priceText) {
      priceText.textContent = `$${chosen.dataset.price}`;
    }

    updateCountOptions();
  }
};

  form.addEventListener('change', e => {
   if (e.target.name === 'foldStyle') updateType();
    if (e.target.name === 'deliveryMethod') updateDelivery();
    if (e.target.name === 'contactMethod') updateContact();
    if (e.target.name === 'journalSize') updateSize();
  });
 updateDelivery();
updateContact();
updateCountOptions();
updateType();
  if (kind === 'custom') {
    const dimensions = document.getElementById('dimensions');
   dimensions?.addEventListener('input', () => {
  if (sizeSummary) {
    sizeSummary.textContent =
      dimensions.value.trim() || 'Not entered';
  }
});
  form.addEventListener('submit', e => {
    e.preventDefault();
    message.style.display='none';
    updateDelivery();
updateContact();
updateCountOptions();
updateType();
    if (!form.reportValidity()) return;
    if (form.querySelector('[name="website"]').value) return;
    if (APPS_SCRIPT_URL.includes('PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE')) {
      setMessage('This order form is designed and ready, but the owner still needs to connect the email endpoint in order.js before it can send orders. Please contact the shop directly for now.', true);
      return;
    }
    if (selected('journalSize') === 'Passport' && count?.value === '6') { setMessage('Passport covers can fit 2 or 4 journals only. Please update your selection.', true); return; }
    submitButton.disabled = true; submitButton.textContent = 'Sending your request…';
    // Post as a normal HTML form into a hidden iframe, avoiding cross-origin fetch/CORS issues.
    form.action = APPS_SCRIPT_URL;
    form.target = 'submit-frame';
    form.submit();
    setMessage('Your order request is being sent. Please keep this page open for a moment.');
    window.addEventListener('message', function handler(event) {
      if (!['https://script.google.com','https://script.googleusercontent.com'].includes(event.origin) && !event.origin.endsWith('.googleusercontent.com')) return;
      if (event.data && event.data.type === 'moonlight-order-result') {
        window.removeEventListener('message', handler);
        submitButton.disabled = false; submitButton.textContent = 'Send order request →';
        if (event.data.ok) { setMessage('Thank you! Your order request has been emailed to Moonlight Journals. The maker will follow up using your preferred contact method.'); form.reset(); updateDelivery();
updateContact();
updateCountOptions();
updateType(); if (priceText && kind==='standard') priceText.textContent='From $50'; if (sizeSummary) sizeSummary.textContent=kind==='custom'?'Not entered':'Not selected'; }
        else setMessage('Sorry, the order could not be confirmed. Please contact the shop directly or try again.', true);
      }
    });
    // If the response cannot message this page, do not falsely claim delivery; keep status cautious.
    window.setTimeout(() => { if (submitButton.disabled) { submitButton.disabled=false; submitButton.textContent='Send order request →'; setMessage('The request was submitted, but this page could not confirm delivery. Please contact moonlightjournals.co@gmail.com to verify before sending payment.', true); } }, 12000);
  });
});


/* Use each existing swatch color for its entire option button */
document.addEventListener("DOMContentLoaded", () => {
  const colorOptions = document.querySelectorAll(".swatch-option");

  colorOptions.forEach((option) => {
    const sample = option.querySelector(".swatch");

    if (!sample) return;

    const color = getComputedStyle(sample).backgroundColor;
    const rgb = color.match(/[\d.]+/g);

    if (!rgb || rgb.length < 3) return;

    const [r, g, b] = rgb.slice(0, 3).map(Number);

    // Calculate brightness so text stays readable on light
    // and dark colors.
    const channels = [r, g, b].map((value) => {
      const normalized = value / 255;

      return normalized <= 0.04045
        ? normalized / 12.92
        : Math.pow((normalized + 0.055) / 1.055, 2.4);
    });

    const luminance =
      0.2126 * channels[0] +
      0.7152 * channels[1] +
      0.0722 * channels[2];

    const textColor = luminance > 0.42 ? "#211a20" : "#ffffff";

    option.style.setProperty("--swatch-color", color);
    option.style.setProperty("--swatch-ink", textColor);
  });
});
