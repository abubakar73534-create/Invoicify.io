const itemsContainer = document.getElementById('items-container');
const addItemBtn = document.getElementById('add-item-btn');
const subtotalEl = document.getElementById('subtotal');
const discountRateInput = document.getElementById('discount-rate');
const taxRateInput = document.getElementById('tax-rate');
const grandTotalEl = document.getElementById('grand-total');

function formatCurrency(amount) {
    const num = parseFloat(amount);
    if (isNaN(num)) return '0';
    const currencySelect = document.getElementById('currency-select');
    const currency = currencySelect ? currencySelect.value : 'USD';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(num);
}

function calculateTotals() {
    let subtotal = 0;
    const rows = itemsContainer.querySelectorAll('.item-row');
    
    rows.forEach(row => {
        const qty = parseFloat(row.querySelector('.qty-input').value) || 0;
        const rateStr = row.querySelector('.rate-input').value || '0';
        const rate = parseFloat(rateStr.replace(/[^0-9.]/g, '')) || 0;
        const amount = qty * rate;
        
        row.querySelector('.amount').textContent = formatCurrency(amount);
        subtotal += amount;
    });

    const discountRateStr = discountRateInput ? (discountRateInput.value || '0') : '0';
    const discountRate = parseFloat(discountRateStr.replace(/[^0-9.]/g, '')) || 0;
    const discountAmount = subtotal * (discountRate / 100);

    const taxRateStr = taxRateInput ? (taxRateInput.value || '0') : '0';
    const taxRate = parseFloat(taxRateStr.replace(/[^0-9.]/g, '')) || 0;
    const taxAmount = (subtotal - discountAmount) * (taxRate / 100);
    const grandTotal = subtotal - discountAmount + taxAmount;

    if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);
    if (grandTotalEl) grandTotalEl.textContent = formatCurrency(grandTotal);

    // Live update the preview side panel whenever totals change
    const pSub = document.getElementById('preview-subtotal');
    if (pSub) pSub.textContent = formatCurrency(subtotal);
    
    const pDisc = document.getElementById('preview-discount');
    if (pDisc) pDisc.textContent = formatCurrency(discountAmount);
    
    const pTax = document.getElementById('preview-tax');
    if (pTax) pTax.textContent = formatCurrency(taxAmount);
    
    const pGrand = document.getElementById('preview-grand-total');
    if (pGrand) pGrand.textContent = formatCurrency(grandTotal);
    
    const previewDiscountPercent = document.getElementById('preview-discount-percent');
    if (previewDiscountPercent) previewDiscountPercent.textContent = discountRateInput && discountRateInput.value ? `(${discountRateInput.value})` : '';
    
    const previewTaxPercent = document.getElementById('preview-tax-percent');
    if (previewTaxPercent) previewTaxPercent.textContent = taxRateInput && taxRateInput.value ? `(${taxRateInput.value})` : '';
    
    renderPreviewItems();
}

function renderPreviewItems() {
    const previewItemsContainer = document.getElementById('preview-items-container');
    if (!previewItemsContainer) return;
    previewItemsContainer.innerHTML = '';
    
    const rows = itemsContainer.querySelectorAll('.item-row');
    rows.forEach(row => {
        const desc = row.querySelector('.desc-input').value || 'Item description';
        const qtyStr = row.querySelector('.qty-input').value;
        const qty = qtyStr === '' ? 0 : (parseFloat(qtyStr) || 0); // show zero default
        const rateInputStr = row.querySelector('.rate-input').value || '';
        const rate = parseFloat(rateInputStr.replace(/[^0-9.]/g, '')) || 0;
        const amount = qty * rate;

        const previewRow = document.createElement('div');
        previewRow.style = "display: flex; justify-content: space-between; padding: 16px 0; border-bottom: 1px solid #333333; font-size: 0.95rem; color: #d1d5db; align-items: center; gap: 20px; width: 100%;";
        previewRow.innerHTML = `
            <div style="flex: 3; font-weight: 500; word-break: break-word; padding-right: 10px; color: #ffffff; text-align: left;">${desc}</div>
            <div style="flex: 1; text-align: center;">${qtyStr === '' ? '0' : qty}</div>
            <div style="flex: 1; text-align: right;">${rateInputStr === '' ? '0' : rateInputStr}</div>
            <div style="flex: 1; text-align: right; font-weight: 600; color: #ffffff;">${!amount || isNaN(amount) ? '0' : formatCurrency(amount)}</div>
        `;
        previewItemsContainer.appendChild(previewRow);
    });
}

function updatePreview() {
    const fieldMap = {
        'invoice-title': { previewId: 'preview-title', fallback: 'Invoice' },
        'your-name': { previewId: 'preview-your-name', fallback: 'Your Name / Business' },
        'your-email': { previewId: 'preview-your-email', fallback: 'you@example.com' },
        'your-address': { previewId: 'preview-your-address', fallback: 'Your Address' },
        'your-city': { previewId: 'preview-your-city', fallback: 'City, State' },
        'your-country': { previewId: 'preview-your-country', fallback: 'Country' },
        'client-name': { previewId: 'preview-client-name', fallback: 'Client Name' },
        'client-email': { previewId: 'preview-client-email', fallback: 'client@example.com' },
        'client-address': { previewId: 'preview-client-address', fallback: 'Client Address' },
        'client-city': { previewId: 'preview-client-city', fallback: 'City, State' },
        'client-country': { previewId: 'preview-client-country', fallback: 'Country' },
        'invoice-number': { previewId: 'preview-invoice-number', fallback: 'INV-001' },
        'bank-name': { previewId: 'preview-bank', fallback: 'Bank Name' },
        'bank-account': { previewId: 'preview-account', fallback: 'Account Number' },
    };

    for (const [inputId, { previewId, fallback }] of Object.entries(fieldMap)) {
        const inputEl = document.getElementById(inputId);
        const previewEl = document.getElementById(previewId);
        if (inputEl && previewEl) {
            previewEl.textContent = inputEl.value || fallback;
        }
    }
    
    // Safe date rendering using UTC to avoid timezone drift
    const invDateInput = document.getElementById('invoice-date');
    const invDateElText = invDateInput ? invDateInput.value : '';
    const invDateEl = document.getElementById('preview-date');
    if (invDateEl) invDateEl.textContent = invDateElText ? new Date(invDateElText).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }) : 'Issue Date';

    const dueDateInput = document.getElementById('due-date');
    const dueDateElText = dueDateInput ? dueDateInput.value : '';
    const dueDateEl = document.getElementById('preview-due-date');
    if (dueDateEl) dueDateEl.textContent = dueDateElText ? new Date(dueDateElText).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }) : 'Due Date';
    
    const notesEl = document.getElementById('notes');
    const previewNotesEl = document.getElementById('preview-notes');
    if (notesEl && previewNotesEl) {
        previewNotesEl.textContent = notesEl.value || '';
    }
}

function createItemRow() {
    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML = `
        <div class="col-desc"><input type="text" placeholder="Item description" class="desc-input dark-input"></div>
        <div class="col-qty"><input type="number" placeholder="1" class="qty-input dark-input" min="0" step="1"></div>
        <div class="col-rate"><input type="text" placeholder="e.g. 50" class="rate-input dark-input"></div>
        <div class="col-amount" style="padding: 14px 18px; display:flex; align-items:center; justify-content:flex-end;"><span class="amount" style="color: #ffffff; font-weight: 600;">0</span></div>
        <div class="col-action"><button class="btn-remove" title="Remove Item">&times;</button></div>
    `;
    
    // Attach input events for live calculation
    const inputs = row.querySelectorAll('input');
    inputs.forEach(input => input.addEventListener('input', calculateTotals));
    
    // Attach remove event
    row.querySelector('.btn-remove').addEventListener('click', function() {
        if (itemsContainer.querySelectorAll('.item-row').length > 1) {
            row.remove();
            calculateTotals();
        } else {
            // If it's the last row, just clear the inputs
            inputs.forEach(input => input.value = '');
            calculateTotals();
        }
    });

    if (itemsContainer) itemsContainer.appendChild(row);
}

// Auto-generate invoice number
function generateInvoiceNumber() {
    let lastInvoiceNumber = localStorage.getItem('lastInvoiceNumber');
    let newNumber = 1;
    
    if (lastInvoiceNumber) {
        newNumber = parseInt(lastInvoiceNumber, 10) + 1;
    }
    
    return `INV-${newNumber.toString().padStart(3, '0')}`;
}

function initInvoiceNumber() {
    const invoiceNumberInput = document.getElementById('invoice-number');
    if (invoiceNumberInput && !invoiceNumberInput.value) {
        invoiceNumberInput.value = generateInvoiceNumber();
    }
}

// Initial Setup
createItemRow();
initInvoiceNumber();
updatePreview();

// Event Listeners
if (addItemBtn) addItemBtn.addEventListener('click', createItemRow);
if (discountRateInput) discountRateInput.addEventListener('input', calculateTotals);
if (taxRateInput) taxRateInput.addEventListener('input', calculateTotals);

const currencySelect = document.getElementById('currency-select');
if (currencySelect) {
    currencySelect.addEventListener('change', calculateTotals);
}

const allInputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="date"], textarea');
allInputs.forEach(input => {
    input.addEventListener('input', updatePreview);
});

// Handle Logo Upload via FileReader
const logoUploadBtn = document.getElementById('logo-upload');
const removeLogoBtn = document.getElementById('remove-logo-btn');

if (logoUploadBtn) {
    logoUploadBtn.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const logoPlaceholder = document.querySelector('.preview-logo-placeholder');
                logoPlaceholder.style.background = 'transparent';
                logoPlaceholder.style.border = 'none';
                logoPlaceholder.innerHTML = `<img src="${event.target.result}" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 6px;">`;
                
                if (removeLogoBtn) removeLogoBtn.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });
}

if (removeLogoBtn) {
    removeLogoBtn.addEventListener('click', function() {
        if (logoUploadBtn) logoUploadBtn.value = '';
        removeLogoBtn.style.display = 'none';
        
        const logoPlaceholder = document.querySelector('.preview-logo-placeholder');
        logoPlaceholder.style.background = '#1a1a1a';
        logoPlaceholder.style.border = '1px dashed #333333';
        logoPlaceholder.innerHTML = `<span>LOGO</span>`;
    });
}

// Download Invoice as PDF
const downloadPdfBtn = document.getElementById('download-pdf-btn');
if (downloadPdfBtn) {
    downloadPdfBtn.addEventListener('click', () => {
        const invoiceElement = document.getElementById('invoice-preview');
        
        html2canvas(invoiceElement, {
            scale: 2, 
            backgroundColor: '#0a0a0a',
            logging: false,
            useCORS: true
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            const { jsPDF } = window.jspdf;
            
            // Calculate a proper PDF size matching the canvas ratio
            const pdf = new jsPDF({
                orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });
            
            // Save the current invoice number to increment next time
            const currentInvoiceNumber = document.getElementById('invoice-number').value || 'INV-001';
            const match = currentInvoiceNumber.match(/INV-(\d+)/);
            if (match) {
                localStorage.setItem('lastInvoiceNumber', parseInt(match[1], 10));
            }

            pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
            const inputNode = document.getElementById('invoice-number');
            pdf.save(`Invoice-${inputNode ? inputNode.value : '0'}.pdf`);
        }).catch(err => {
            console.error('Error generating PDF:', err);
            alert('Could not generate the invoice PDF. Please try again.');
        });
    });
}

// Download Invoice as JPG
const downloadJpgBtn = document.getElementById('download-jpg-btn');
if (downloadJpgBtn) {
    downloadJpgBtn.addEventListener('click', () => {
        const invoiceElement = document.getElementById('invoice-preview');
        
        // Temporarily change background color specifically for the snapshot
        // in case html2canvas has artifacts with dark backgrounds
        html2canvas(invoiceElement, {
            scale: 2, // Higher quality
            backgroundColor: '#0a0a0a',
            logging: false,
            useCORS: true
        }).then(canvas => {
            // Convert canvas to JPG
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            
            // Save the current invoice number to increment next time
            const currentInvoiceNumber = document.getElementById('invoice-number').value || 'INV-001';
            const match = currentInvoiceNumber.match(/INV-(\d+)/);
            if (match) {
                localStorage.setItem('lastInvoiceNumber', parseInt(match[1], 10));
            }

            // Create a fake link to trigger the download
            const link = document.createElement('a');
            const inputNode2 = document.getElementById('invoice-number');
            link.download = `Invoice-${inputNode2 ? inputNode2.value : 'INV-001'}.jpg`;
            link.href = imgData;
            link.click();
        }).catch(err => {
            console.error('Error generating image:', err);
            alert('Could not generate the invoice image. Please try again.');
        });
    });
}
