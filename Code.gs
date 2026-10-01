const OWNER_EMAIL = 'moonlightjournals.co@gmail.com';

function doPost(e) {
  try {
    const p = (e && e.parameter) ? e.parameter : {};
    // Quietly ignore likely bot submissions.
    if (p.website) return response_({ ok: true, message: 'Received' });
    const required = ['orderType', 'customerName', 'email', 'contactMethod', 'deliveryMethod', 'foldStyle', 'leatherColor', 'grommetColor', 'cordPlacement', 'corners', 'stringColor', 'notebookPaper', 'acknowledgement'];
    const missing = required.filter(k => !String(p[k] || '').trim());
    if (missing.length) return response_({ ok: false, message: 'Missing required fields: ' + missing.join(', ') });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) return response_({ ok: false, message: 'Invalid email address' });
    if (p.acknowledgement !== 'Yes') return response_({ ok: false, message: 'Acknowledgement is required' });
    if (!['Local drop off', 'Shipping'].includes(p.deliveryMethod)) return response_({ ok: false, message: 'Invalid delivery method' });
    if (!String(p.address || '').trim()) return response_({ ok: false, message: 'Delivery address is required' });
    if (p.orderType === 'Standard size') {
      if (!['Passport', 'B6', 'A6', 'A5'].includes(p.journalSize)) return response_({ ok: false, message: 'Invalid journal size' });
      if (!['2','4','6'].includes(p.journalCount) || (p.journalSize === 'Passport' && p.journalCount === '6')) return response_({ ok: false, message: 'Invalid journal capacity for selected size' });
    } else if (p.orderType === 'Custom size') {
      if (!String(p.dimensions || '').trim()) return response_({ ok: false, message: 'Dimensions are required' });
    } else return response_({ ok: false, message: 'Invalid order type' });

    const deliveryFee = p.deliveryMethod === 'Shipping' ? '$7' : '$5';
    const price = p.orderType === 'Standard size' ? ({ Passport: '$50', B6: '$55', A6: '$60', A5: '$65' }[p.journalSize]) : 'Custom quote required';
    const lines = [
      'MOONLIGHT JOURNALS — NEW ORDER REQUEST',
      '',
      'CUSTOMER DETAILS',
      'Name: ' + p.customerName,
      'Email: ' + p.email,
      'Preferred contact: ' + p.contactMethod,
      'Instagram handle: ' + (p.instagram || 'Not provided'),
      '',
      'ORDER DETAILS',
      'Order type: ' + p.orderType,
      'Journal size: ' + (p.journalSize || 'Custom size'),
      'Dimensions: ' + (p.dimensions || 'Not applicable'),
      'Cover price / quote: ' + price,
      'Fold style: ' + p.foldStyle,
      'Journals to fit: ' + p.journalCount,
      'Leather color: ' + p.leatherColor,
      'Grommet color: ' + p.grommetColor,
      'Cord placement: ' + p.cordPlacement,
      'Corners: ' + p.corners,
      'String color: ' + p.stringColor,
      'Included notebook paper: ' + p.notebookPaper,
      '',
      'DELIVERY',
      'Method: ' + p.deliveryMethod,
      'Delivery fee: ' + deliveryFee,
      'Address: ' + p.address,
      '',
      'ACKNOWLEDGEMENT',
      'Customer acknowledged 2–3 week processing time and non-refundable $35 leather deposit: ' + p.acknowledgement,
      '',
      'This is an email order request from the Moonlight Journals website. It is not a payment receipt.'
    ];
    const subject = '[' + p.orderType + '] New Moonlight Journals order from ' + p.customerName;
    MailApp.sendEmail({ to: OWNER_EMAIL, replyTo: p.email, subject: subject, body: lines.join('\n') });
    return response_({ ok: true, message: 'Order request emailed' });
  } catch (err) {
    return response_({ ok: false, message: String(err) });
  }
}

function response_(result) {
  const html = '<!doctype html><html><head><meta charset="utf-8"></head><body><script>' +
    'try { window.top.postMessage(' + JSON.stringify({ type: 'moonlight-order-result', ok: !!result.ok, message: result.message || '' }) + ', "*"); } catch(e) {}' +
    '</script>' + (result.ok ? 'Request processed.' : 'Unable to process request.') + '</body></html>';
  return HtmlService.createHtmlOutput(html).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
