// aHPay_version: 1.0

// Global variables and configuration
const config = {
    upiIds: [
        'ayushhardeniya@oksbi',
        'ayushhardeniya@okaxis',
        'ayushhardeniya@okicici',
        'ayushhardeniya@okhdfcbank',
        'ayushhardeniya@ybl',
        'ayushhardeniya@axl',
        'ayushhardeniya@ibl'
    ],
    bankDetails: {
        accountName: '-',
        accountNumber: '-',
        ifscCode: '-',
        bankName: '-',
        branch: '-'
    },
    qrCodePath: 'assets/GooglePayQR.png'
};

// DOM Elements
let paymentModal = null;
let modalTitle = null;
let modalBody = null;
let toastNotification = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    addSmoothScrolling();
});

// Initialize app components
function initializeApp() {
    paymentModal = document.getElementById('payment-modal');
    modalTitle = document.getElementById('modal-title');
    modalBody = document.getElementById('modal-body');
    toastNotification = document.getElementById('toast-notification');
    
    // Add loading states
    setupLoadingStates();
    
    // Check for URL parameters
    checkUrlParameters();
    
    console.log('aHPay Portal initialized successfully');
}

// Setup event listeners
function setupEventListeners() {
    // Close modal when clicking outside
    if (paymentModal) {
        paymentModal.addEventListener('click', function(e) {
            if (e.target === paymentModal) {
                closePaymentModal();
            }
        });
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && paymentModal.style.display === 'block') {
            closePaymentModal();
        }
    });
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Show payment details modal
function showPaymentDetails(paymentType) {
    if (!paymentModal || !modalTitle || !modalBody) {
        showToast('Error: Modal elements not found', 'error');
        return;
    }
    
    let title = '';
    let content = '';
    
    switch (paymentType) {
        case 'upi':
            title = 'UPI Payment Details';
            content = generateUpiContent();
            break;
        case 'qr':
            title = 'QR Code Payment';
            content = generateQrContent();
            break;
        case 'bank':
            title = 'Bank Transfer Details';
            content = generateBankContent();
            break;
        default:
            showToast('Invalid payment type', 'error');
            return;
    }
    
    modalTitle.textContent = title;
    modalBody.innerHTML = content;
    paymentModal.style.display = 'block';
    
    // Focus management for accessibility
    setTimeout(() => {
        const firstFocusable = modalBody.querySelector('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
            firstFocusable.focus();
        }
    }, 100);
    
    // Track modal opening
    console.log(`Opened ${paymentType} payment modal`);
}

// Generate UPI content
function generateUpiContent() {
    const primaryUpiId = config.upiIds[0];
    const upiLink = `upi://pay?pa=${primaryUpiId}&pn=Ayush%20Hardeniya&cu=INR`;
    
    let content = `
        <div class="upi-details">
            <p class="modal-description">Choose your preferred method to pay via UPI:</p>
            
            <a href="${upiLink}" class="upi-link-btn">
                <i class="fas fa-mobile-alt"></i>
                Open UPI App
            </a>
            
            <div class="divider">
                <span>OR</span>
            </div>
            
            <h4 style="margin: 20px 0 15px; color: #2c3e50;">Copy UPI ID:</h4>
            <ul class="upi-list">
    `;
    
    config.upiIds.forEach((upiId, index) => {
        const maskedId = maskUpiId(upiId);
        content += `
            <li class="upi-item">
                <div class="upi-id-container">
                    <span class="upi-id" id="upi-${index}">${maskedId}</span>
                    <small class="upi-provider">${getUpiProvider(upiId)}</small>
                </div>
                <button class="copy-btn" onclick="copyUpiId('${upiId}', ${index})">
                    <i class="fas fa-copy"></i> Copy
                </button>
            </li>
        `;
    });
    
    content += `
            </ul>
            <div class="payment-note">
                <i class="fas fa-info-circle"></i>
                <p>Amount can be entered in your UPI app. All UPI IDs belong to Ayush Hardeniya.</p>
            </div>
        </div>
    `;
    
    return content;
}

// Generate QR content
function generateQrContent() {
    return `
        <div class="qr-details">
            <p class="modal-description">Scan this QR code with any UPI-enabled app:</p>
            
            <div class="qr-code-container">
                <img src="${config.qrCodePath}" alt="UPI QR Code" class="qr-code-img" 
                     onerror="handleQrError(this)">
                <p class="qr-instructions">
                    <i class="fas fa-camera"></i>
                    Point your camera at the QR code
                </p>
            </div>
            
            <a href="${config.qrCodePath}" download="aHPay-QR-Code.png" class="download-btn">
                <i class="fas fa-download"></i>
                Download QR Code
            </a>
            
            <div class="payment-note">
                <i class="fas fa-shield-alt"></i>
                <p>This QR code is linked to Ayush Hardeniya's verified UPI account.</p>
            </div>
        </div>
    `;
}

// Generate bank transfer content
/*function generateBankContent() {
    const { accountName, accountNumber, ifscCode, bankName, branch } = config.bankDetails;
    
    return `
        <div class="bank-details">
            <p class="modal-description">Use these details for NEFT/IMPS/RTGS transfers:</p>
            
            <div class="bank-info">
                <div class="bank-field">
                    <span class="field-label">Account Holder:</span>
                    <div class="field-container">
                        <span class="field-value" id="account-name">${accountName}</span>
                        <button class="copy-btn-small" onclick="copyBankDetail('${accountName}', 'Account Name')">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                </div>
                
                <div class="bank-field">
                    <span class="field-label">Account Number:</span>
                    <div class="field-container">
                        <span class="field-value" id="account-number">${accountNumber}</span>
                        <button class="copy-btn-small" onclick="copyBankDetail('${accountNumber}', 'Account Number')">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                </div>
                
                <div class="bank-field">
                    <span class="field-label">IFSC Code:</span>
                    <div class="field-container">
                        <span class="field-value" id="ifsc-code">${ifscCode}</span>
                        <button class="copy-btn-small" onclick="copyBankDetail('${ifscCode}', 'IFSC Code')">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                </div>
                
                <div class="bank-field">
                    <span class="field-label">Bank Name:</span>
                    <div class="field-container">
                        <span class="field-value">${bankName}</span>
                    </div>
                </div>
                
                <div class="bank-field">
                    <span class="field-label">Branch:</span>
                    <div class="field-container">
                        <span class="field-value">${branch}</span>
                    </div>
                </div>
            </div>
            
            <div class="payment-note">
                <i class="fas fa-clock"></i>
                <p>Bank transfers may take 1-4 hours to process depending on your bank and transfer method.</p>
            </div>
        </div>
    `;
}*/

function generateBankContent() {
    return `
        <div class="bank-details secure-message">
            <p class="modal-description">
                ⚠️ For security reasons, my bank transfer details are not shared publicly.
            </p>
            
            <div class="secure-instruction">
                <p>If you'd like to support me via <strong>NEFT / IMPS / RTGS</strong>, kindly send an email:</p>
                <a href="mailto:connect@ayushhardeniya.in?subject=Requesting Bank Transfer Details&body=Hi Ayush, I’d like to support you via bank transfer. Please share the account details." class="email-request-link">
                    📩 Request via Email
                </a>
                <p class="secure-note">
                    I’ll reply personally with the details. Thanks for your support and understanding. 🙏
                </p>
            </div>

            <div class="payment-note">
                <i class="fas fa-lock"></i>
                <p>Your trust and privacy matter. This step helps prevent misuse of payment data.</p>
            </div>
        </div>
    `;
}


// Close payment modal
function closePaymentModal() {
    if (paymentModal) {
        paymentModal.style.display = 'none';
        
        // Return focus to the button that opened the modal
        const activeElement = document.activeElement;
        if (activeElement && activeElement.tagName === 'BUTTON') {
            activeElement.blur();
        }
    }
}

// Copy UPI ID to clipboard
function copyUpiId(upiId, index) {
    copyToClipboard(upiId)
        .then(() => {
            showToast(`UPI ID copied: ${upiId}`, 'success');
            
            // Visual feedback
            const copyBtn = event.target.closest('.copy-btn');
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            copyBtn.classList.add('copy-success');
            
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
                copyBtn.classList.remove('copy-success');
            }, 2000);
        })
        .catch(err => {
            console.error('Copy failed:', err);
            showToast('Failed to copy UPI ID', 'error');
        });
}

// Copy bank detail to clipboard
function copyBankDetail(detail, fieldName) {
    copyToClipboard(detail)
        .then(() => {
            showToast(`${fieldName} copied successfully`, 'success');
            
            // Visual feedback
            const copyBtn = event.target.closest('.copy-btn-small');
            const originalHtml = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check"></i>';
            copyBtn.style.background = '#2ecc71';
            
            setTimeout(() => {
                copyBtn.innerHTML = originalHtml;
                copyBtn.style.background = '';
            }, 1500);
        })
        .catch(err => {
            console.error('Copy failed:', err);
            showToast('Failed to copy details', 'error');
        });
}

// Generic copy to clipboard function
async function copyToClipboard(text) {
    if (navigator.clipboard) {
        try {
            await navigator.clipboard.writeText(text);
            return Promise.resolve();
        } catch (err) {
            console.warn('Clipboard API failed, falling back to execCommand');
            return fallbackCopyToClipboard(text);
        }
    } else {
        return fallbackCopyToClipboard(text);
    }
}

// Fallback copy method for older browsers
function fallbackCopyToClipboard(text) {
    return new Promise((resolve, reject) => {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            
            if (successful) {
                resolve();
            } else {
                reject(new Error('execCommand copy failed'));
            }
        } catch (err) {
            document.body.removeChild(textArea);
            reject(err);
        }
    });
}

// Show toast notification
function showToast(message, type = 'success') {
    if (!toastNotification) return;
    
    const toastIcon = toastNotification.querySelector('.toast-icon');
    const toastMessage = toastNotification.querySelector('.toast-message');
    
    // Set icon based on type
    if (type === 'success') {
        toastIcon.className = 'toast-icon fas fa-check-circle';
        toastNotification.className = 'toast-notification show';
    } else if (type === 'error') {
        toastIcon.className = 'toast-icon fas fa-exclamation-circle';
        toastNotification.className = 'toast-notification show error';
    }
    
    toastMessage.textContent = message;
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        toastNotification.classList.remove('show');
    }, 3000);
}

// Handle QR code loading error
function handleQrError(imgElement) {
    imgElement.style.display = 'none';
    const container = imgElement.parentElement;
    container.innerHTML = `
        <div class="qr-error">
            <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #e74c3c; margin-bottom: 15px;"></i>
            <h4>QR Code Not Available</h4>
            <p>Please use the UPI ID option or contact for assistance.</p>
        </div>
    `;
}

// Mask UPI ID for display
function maskUpiId(upiId) {
    const [username, domain] = upiId.split('@');
    if (username.length <= 5) {
        return `${username.substring(0, 2)}***@${domain}`;
    }
    return `${username.substring(0, 5)}***@${domain}`;
}

// Get UPI provider name
function getUpiProvider(upiId) {
    const domain = upiId.split('@')[1];
    const providers = {
        'oksbi': 'SBI',
        'okaxis': 'Axis Bank',
        'okicici': 'ICICI Bank',
        'okhdfcbank': 'HDFC Bank',
        'ybl': 'PhonePe',
        'axl': 'Axis Bank',
        'ibl': 'IDBI Bank'
    };
    return providers[domain] || domain.toUpperCase();
}

// Open Razorpay payment (placeholder)
function openRazorpay() {
    showToast('Razorpay integration coming soon!', 'info');
    // TODO: Implement Razorpay integration
}

// Add smooth scrolling behavior
function addSmoothScrolling() {
    // Smooth scroll to sections
    const scrollLinks = document.querySelectorAll('a[href^="#"]');
    scrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.getBoundingClientRect().top + window.pageYOffset - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Check URL parameters for direct payment method
function checkUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentMethod = urlParams.get('method');
    
    if (paymentMethod && ['upi', 'qr', 'bank'].includes(paymentMethod)) {
        setTimeout(() => {
            showPaymentDetails(paymentMethod);
        }, 500);
    }
}

// Setup loading states for buttons
function setupLoadingStates() {
    const buttons = document.querySelectorAll('.primary-btn, .copy-btn');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            if (!this.classList.contains('btn-loading')) {
                this.classList.add('btn-loading');
                setTimeout(() => {
                    this.classList.remove('btn-loading');
                }, 1000);
            }
        });
    });
}

// Utility function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}

// Analytics tracking (placeholder)
function trackEvent(eventName, eventData = {}) {
    // TODO: Implement analytics tracking
    console.log(`Event: ${eventName}`, eventData);
}

// Performance monitoring
function measurePerformance() {
    if ('performance' in window) {
        window.addEventListener('load', () => {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            console.log(`Page load time: ${loadTime}ms`);
        });
    }
}

// Initialize performance monitoring
measurePerformance();

// Service Worker registration (if available)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Export functions for global access
window.showPaymentDetails = showPaymentDetails;
window.closePaymentModal = closePaymentModal;
window.copyUpiId = copyUpiId;
window.copyBankDetail = copyBankDetail;
window.handleQrError = handleQrError;
window.openRazorpay = openRazorpay;
