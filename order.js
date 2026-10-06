
/* ==========================================================
   MOONLIGHT JOURNALS — ORDER FORM
   Supports standard-order.html and custom-order.html
   ========================================================== */

// Keep your existing Google Apps Script URL here.
// Do not change it if you have already configured it.
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx2t6UlKPffVu_AnkzylsAjaOQXFJXWgYtbUC2_4h6E3ndyHlUGQsfMd1YA4zBGEJ0R/exec';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('order-form');

  // This script is shared by pages that do not have an order form.
  if (!form) return;

  const kind =
    form.dataset.kind ||
    (form.querySelector('[name="orderType"]')?.value === 'Custom size'
      ? 'custom'
      : 'standard');

  // Main elements
  const message = document.getElementById('form-message');
  const submitButton = document.getElementById('submit-button');

  // Delivery and contact fields
  const addressField = document.getElementById('address-field');
  const address = document.getElementById('address');
  const addressHint = document.getElementById('address-hint');
  const instagramField = document.getElementById('instagram-field');
  const instagram = document.getElementById('instagram');

  // Journal selection fields
  const count = document.getElementById('journalCount');
  const dimensions = document.getElementById('dimensions');
  const countHint = document.getElementById('count-hint');

  // Summary fields
  const summaryCard = document.querySelector('.summary-card');
  const typeSummary = document.getElementById('summary-type');
  let sizeSummary = document.getElementById('summary-size');
  const deliverySummary = document.getElementById('summary-delivery');
  const feeSummary = document.getElementById('summary-fee');
  const priceText = document.getElementById('summary-price');

  /* ----------------------------------------------------------
     Repair the missing summary-size element if necessary.
     The original HTML had a literal {summary_size} placeholder.
     ---------------------------------------------------------- */

  if (!sizeSummary && summaryCard) {
    const walker = document.createTreeWalker(
      summaryCard,
      NodeFilter.SHOW_TEXT
    );

    let textNode;

    while ((textNode = walker.nextNode())) {
      if (textNode.nodeValue.includes('{summary_size}')) {
        const row = document.createElement('div');
        row.className = 'summary-line';

        const label = document.createElement('span');
        label.textContent = 'Size';

        sizeSummary = document.createElement('strong');
        sizeSummary.id = 'summary-size';
        sizeSummary.textContent = 'Not selected';

        row.append(label, sizeSummary);
        textNode.parentNode.replaceChild(row, textNode);
        break;
      }
    }

    // If the placeholder was removed but the element is still
    // missing, create the row after the cover-type row.
    if (!sizeSummary) {
      const row = document.createElement('div');
      row.className = 'summary-line';

      const label = document.createElement('span');
      label.textContent = 'Size';

      sizeSummary = document.createElement('strong');
      sizeSummary.id = 'summary-size';
      sizeSummary.textContent = 'Not selected';

      row.append(label, sizeSummary);

      const typeRow = typeSummary?.closest('.summary-line');

      if (typeRow) {
        typeRow.insertAdjacentElement('afterend', row);
      } else {
        summaryCard.appendChild(row);
      }
    }
  }

  // Display a message to the customer.
  function setMessage(text, isError = false) {
    if (!message) {
      window.alert(text);
      return;
    }

    message.textContent = text;
    message.classList.toggle('error', isError);
    message.style.display = 'block';

    message.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  }

  // Get the currently selected radio-button value.
  function selected(name) {
    return (
      form.querySelector(
        `input[name="${name}"]:checked`
      )?.value || ''
    );
  }

  /* ----------------------------------------------------------
     COVER TYPE SUMMARY
     ---------------------------------------------------------- */

  function updateType() {
    const foldStyle = selected('foldStyle');

    if (typeSummary) {
      typeSummary.textContent = foldStyle || 'Not selected';
    }
  }

  /* ----------------------------------------------------------
     SIZE AND PRICE SUMMARY
     ---------------------------------------------------------- */

  function updateSize() {
    if (kind === 'custom') {
      const enteredDimensions = dimensions?.value.trim() || '';

      if (sizeSummary) {
        sizeSummary.textContent =
          enteredDimensions || 'Not entered';
      }

      if (priceText) {
        priceText.textContent = 'Quote after review';
      }

      updateCountOptions();
      return;
    }

    const chosen = form.querySelector(
      'input[name="journalSize"]:checked'
    );

    if (!chosen) {
      if (sizeSummary) {
        sizeSummary.textContent = 'Not selected';
      }

      if (priceText) {
        priceText.textContent = 'From $50';
      }

      updateCountOptions();
      return;
    }

    if (sizeSummary) {
      sizeSummary.textContent = `${chosen.value} journal`;
    }

    if (priceText) {
      const price = chosen.dataset.price;

      priceText.textContent = price
        ? `$${price}`
        : 'Price to be confirmed';
    }

    updateCountOptions();
  }

  /* ----------------------------------------------------------
     JOURNAL CAPACITY
     Passport journals can fit only 2 or 4 journals.
     ---------------------------------------------------------- */

  function updateCountOptions() {
    if (!count) return;

    const isPassport =
      kind === 'standard' &&
      selected('journalSize') === 'Passport';

    const sixOption = count.querySelector(
      'option[value="6"]'
    );

    if (sixOption) {
      sixOption.disabled = isPassport;
      sixOption.hidden = isPassport;
    }

    if (isPassport && count.value === '6') {
      count.value = '';
    }

    if (countHint) {
      countHint.textContent = isPassport
        ? 'Passport covers fit 2 or 4 journals.'
        : 'Choose 2, 4, or 6 journals.';
    }
  }

  /* ----------------------------------------------------------
     DELIVERY SUMMARY AND ADDRESS FIELD
     ---------------------------------------------------------- */

  function updateDelivery() {
    const method = selected('deliveryMethod');
    const showAddress = Boolean(method);

    addressField?.classList.toggle(
      'hidden',
      !showAddress
    );

    if (address) {
      address.required = showAddress;
    }

    if (addressHint) {
      if (method === 'Local drop off') {
        addressHint.textContent =
          'Local drop-off must be within 15 miles of Detroit, Michigan.';
      } else if (method === 'Shipping') {
        addressHint.textContent =
          'Enter the full address where the order should be shipped.';
      } else {
        addressHint.textContent = '';
      }
    }

    if (deliverySummary) {
      deliverySummary.textContent =
        method || 'Choose below';
    }

    if (feeSummary) {
      if (method === 'Local drop off') {
        feeSummary.textContent = '$5';
      } else if (method === 'Shipping') {
        feeSummary.textContent = '$7';
      } else {
        feeSummary.textContent = '—';
      }
    }
  }

  /* ----------------------------------------------------------
     CONTACT METHOD AND INSTAGRAM FIELD
     ---------------------------------------------------------- */

  function updateContact() {
    const method = selected('contactMethod');
    const useInstagram = method === 'Instagram Handle';

    instagramField?.classList.toggle(
      'hidden',
      !useInstagram
    );

    if (instagram) {
      instagram.required = useInstagram;
    }
  }

  /* ----------------------------------------------------------
     COLOR BUTTONS
     Use each existing .swatch color as the full button color.
     ---------------------------------------------------------- */

  function initializeColorButtons() {
    const options = form.querySelectorAll('.swatch-option');

    options.forEach((option) => {
      const sample = option.querySelector('.swatch');

      if (!sample) return;

      const color = getComputedStyle(sample).backgroundColor;
      const values = color.match(/[\d.]+/g);

      if (!values || values.length < 3) return;

      const [r, g, b] = values.slice(0, 3).map(Number);

      const channels = [r, g, b].map((value) => {
        const normalized = value / 255;

        return normalized <= 0.04045
          ? normalized / 12.92
          : Math.pow(
              (normalized + 0.055) / 1.055,
              2.4
            );
      });

      const luminance =
        0.2126 * channels[0] +
        0.7152 * channels[1] +
        0.0722 * channels[2];

      const textColor =
        luminance > 0.42 ? '#211a20' : '#ffffff';

      option.style.setProperty('--swatch-color', color);
      option.style.setProperty('--swatch-ink', textColor);
    });
  }

  /* ----------------------------------------------------------
     INITIALIZE ALL SUMMARIES
     ---------------------------------------------------------- */

  function updateAll() {
    updateType();
    updateSize();
    updateDelivery();
    updateContact();
    updateCountOptions();
  }

  // Listen for changes to radio buttons, dropdowns and checkboxes.
  form.addEventListener('change', (event) => {
    const fieldName = event.target.name;

    if (fieldName === 'foldStyle') {
      updateType();
    }

    if (fieldName === 'journalSize') {
      updateSize();
    }

    if (fieldName === 'deliveryMethod') {
      updateDelivery();
    }

    if (fieldName === 'contactMethod') {
      updateContact();
    }

    if (fieldName === 'journalCount') {
      updateCountOptions();
    }
  });

  // Update custom dimensions as the customer types.
  dimensions?.addEventListener('input', updateSize);

  // Set the correct initial summary values.
  updateAll();
  initializeColorButtons();

  /* ----------------------------------------------------------
     FORM SUBMISSION
     ---------------------------------------------------------- */

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (message) {
      message.style.display = 'none';
    }

    // Refresh the summary and conditional fields before validation.
    updateAll();

    if (!form.reportValidity()) return;

    // Basic honeypot spam check.
    const honeypot = form.querySelector('[name="website"]');

    if (honeypot?.value) return;

    // Do not allow six journals for Passport covers.
    if (
      kind === 'standard' &&
      selected('journalSize') === 'Passport' &&
      count?.value === '6'
    ) {
      setMessage(
        'Passport covers can fit 2 or 4 journals only. Please update your selection.',
        true
      );
      return;
    }

    if (
      !APPS_SCRIPT_URL ||
      APPS_SCRIPT_URL.includes(
        'PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE'
      )
    ) {
      setMessage(
        'The order form is ready, but the shop email endpoint has not been configured yet. Please contact the shop directly for now.',
        true
      );
      return;
    }

    if (!submitButton) {
      setMessage(
        'The submit button could not be found. Please refresh the page and try again.',
        true
      );
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Sending your request…';

    let responseReceived = false;
    let timeoutId;

    function restoreButton() {
      submitButton.disabled = false;
      submitButton.innerHTML =
        'Send order request <span aria-hidden="true">→</span>';
    }

    function handleResponse(event) {
      const allowedOrigin =
        event.origin === 'https://script.google.com' ||
        event.origin === 'https://script.googleusercontent.com' ||
        event.origin.endsWith('.googleusercontent.com');

      if (!allowedOrigin) return;

      if (
        !event.data ||
        event.data.type !== 'moonlight-order-result'
      ) {
        return;
      }

      responseReceived = true;
      window.removeEventListener('message', handleResponse);
      window.clearTimeout(timeoutId);
      restoreButton();

      if (event.data.ok) {
        setMessage(
          'Thank you! Your order request has been emailed to Moonlight Journals. The maker will follow up using your preferred contact method.'
        );

        form.reset();
        updateAll();

        if (priceText) {
          priceText.textContent =
            kind === 'custom'
              ? 'Quote after review'
              : 'From $50';
        }

        if (sizeSummary) {
          sizeSummary.textContent =
            kind === 'custom'
              ? 'Not entered'
              : 'Not selected';
        }

        if (typeSummary) {
          typeSummary.textContent = 'Not selected';
        }
      } else {
        setMessage(
          'Sorry, the order could not be confirmed. Please contact the shop directly or try again.',
          true
        );
      }
    }

    // Listen before submitting to the hidden response iframe.
    window.addEventListener('message', handleResponse);

    const submitFrame = document.getElementById('submit-frame');

    if (!submitFrame) {
      window.removeEventListener('message', handleResponse);
      restoreButton();

      setMessage(
        'The submission frame is missing from this page. Please check the order page HTML.',
        true
      );
      return;
    }

    form.action = APPS_SCRIPT_URL;
    form.target = 'submit-frame';

    // Submit the form normally to avoid fetch/CORS issues.
    HTMLFormElement.prototype.submit.call(form);

    setMessage(
      'Your order request is being sent. Please keep this page open for a moment.'
    );

    timeoutId = window.setTimeout(() => {
      if (responseReceived) return;

      window.removeEventListener('message', handleResponse);
      restoreButton();

      setMessage(
        'The request was submitted, but this page could not confirm delivery. Please contact moonlightjournals.co@gmail.com to verify before sending payment.',
        true
      );
    }, 12000);
  });
});
