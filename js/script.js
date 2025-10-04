// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        console.log('Clicking link:', this.getAttribute('href'));
        console.log('Target found:', target);
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        } else {
            console.error('Target not found for:', this.getAttribute('href'));
        }
    });
});

// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 30px rgba(0, 0, 0, 0.15)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    // Add initial styles for animation
    const animatedElements = document.querySelectorAll('.product-card, .contact-item, .about-text, .about-image');
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });
});

// CTA Button click handler
const ctaButton = document.querySelector('.cta-button');
if (ctaButton) {
    ctaButton.addEventListener('click', () => {
        document.querySelector('#products').scrollIntoView({
            behavior: 'smooth'
        });
    });
}

// Contact form handling
const contactForm = document.querySelector('.contact-form form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const name = contactForm.querySelector('input[type="text"]').value;
        const email = contactForm.querySelector('input[type="email"]').value;
        const phone = contactForm.querySelector('input[type="tel"]').value;
        const message = contactForm.querySelector('textarea').value;
        
        // Simple validation
        if (!name || !email || !message) {
            showNotification('Please fill in all required fields.', 'error');
            return;
        }
        
        // Simulate form submission
        showNotification('Thank you for your message! We\'ll get back to you soon.', 'success');
        contactForm.reset();
    });
}

// Notification function
function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 350px;
    `;
    
    // Add close button styles
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        margin-left: auto;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 5 seconds
    const autoRemove = setTimeout(() => {
        removeNotification(notification);
    }, 5000);
    
    // Manual close
    closeBtn.addEventListener('click', () => {
        clearTimeout(autoRemove);
        removeNotification(notification);
    });
}

function removeNotification(notification) {
    notification.style.transform = 'translateX(400px)';
    setTimeout(() => {
        notification.remove();
    }, 300);
}

// Typing effect for hero title
function typeEffect(element, text, speed = 100) {
    element.textContent = '';
    let i = 0;
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing effect when page loads
document.addEventListener('DOMContentLoaded', () => {
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        setTimeout(() => {
            typeEffect(heroTitle, originalText, 80);
        }, 500);
    }
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    const heroImage = document.querySelector('.hero-image');
    
    if (hero && heroImage) {
        const rate = scrolled * -0.5;
        heroImage.style.transform = `translateY(${rate}px)`;
    }
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    
    // Add loaded class styles
    const style = document.createElement('style');
    style.textContent = `
        body {
            opacity: 0;
            transition: opacity 0.5s ease;
        }
        body.loaded {
            opacity: 1;
        }
        .hero-content > * {
            opacity: 0;
            transform: translateY(30px);
            animation: fadeInUp 0.8s ease forwards;
        }
        .hero-content > *:nth-child(1) { animation-delay: 0.2s; }
        .hero-content > *:nth-child(2) { animation-delay: 0.4s; }
        .hero-content > *:nth-child(3) { animation-delay: 0.6s; }
        .hero-content > *:nth-child(4) { animation-delay: 0.8s; }
        
        @keyframes fadeInUp {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
});

// Product card hover effects
document.addEventListener('DOMContentLoaded', () => {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
});

// Smooth reveal animation for sections
const revealElements = document.querySelectorAll('.about, .contact');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
        }
    });
}, {
    threshold: 0.1
});

revealElements.forEach(element => {
    revealObserver.observe(element);
});

// Add reveal styles
document.addEventListener('DOMContentLoaded', () => {
    const revealStyle = document.createElement('style');
    revealStyle.textContent = `
        .about, .contact {
            opacity: 0;
            transform: translateY(50px);
            transition: opacity 0.8s ease, transform 0.8s ease;
        }
        .products {
            opacity: 1;
            transform: translateY(0);
        }
        .about.revealed, .products.revealed, .contact.revealed {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(revealStyle);
});

// Category navigation functionality
document.addEventListener('DOMContentLoaded', () => {
    // Handle category link clicks
    const categoryLinks = document.querySelectorAll('.category-link');
    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            if (href && href !== '#') {
                window.location.href = href;
            }
        });
    });

    // Handle "View All Items" button clicks
    const viewMoreButtons = document.querySelectorAll('.view-more');
    viewMoreButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Find the parent category element
            const categoryElement = button.closest('.product-category');
            if (categoryElement) {
                const categoryLink = categoryElement.querySelector('.category-link');
                if (categoryLink) {
                    const href = categoryLink.getAttribute('href');
                    if (href && href !== '#') {
                        window.location.href = href;
                    }
                }
            }
        });
    });

    // Add hover effects for category previews
    const categoryPreviews = document.querySelectorAll('.category-preview');
    categoryPreviews.forEach(preview => {
        preview.addEventListener('mouseenter', () => {
            preview.style.transform = 'scale(1.02)';
            preview.style.borderColor = '#d4417a';
        });
        
        preview.addEventListener('mouseleave', () => {
            preview.style.transform = 'scale(1)';
            preview.style.borderColor = 'transparent';
        });
    });

    // Make entire category preview clickable
    categoryPreviews.forEach(preview => {
        preview.addEventListener('click', (e) => {
            // Don't trigger if clicking on the "View All Items" button specifically
            if (!e.target.closest('.view-more')) {
                const categoryElement = preview.closest('.product-category');
                if (categoryElement) {
                    const categoryLink = categoryElement.querySelector('.category-link');
                    if (categoryLink) {
                        const href = categoryLink.getAttribute('href');
                        if (href && href !== '#') {
                            window.location.href = href;
                        }
                    }
                }
            }
        });
    });
});

// Test function for cart system
function testCartSystem() {
    console.log('Testing cart system...');
    console.log('Cart array:', cart);
    console.log('Current item:', currentItem);
    
    // Test opening modal
    openOrderModal('Test Item', '₹100');
}

// Order System Functionality
let currentItem = null;
let orderCounter = 1;
let cart = []; // Shopping cart to store multiple items

// Open Order Modal
function openOrderModal(itemName, itemPrice, itemImage = null) {
    console.log('Opening modal for:', itemName, itemPrice);
    currentItem = {
        name: itemName,
        price: parseFloat(itemPrice.replace('₹', '').replace(',', '')),
        image: itemImage
    };
    
    document.getElementById('itemName').textContent = itemName;
    document.getElementById('itemPrice').textContent = '₹' + currentItem.price;
    document.getElementById('quantity').value = 1;
    updateTotalPrice();
    updateCartDisplay();
    
    document.getElementById('orderModal').style.display = 'block';
    console.log('Modal opened, cart has', cart.length, 'items');
}

// Add Item to Cart
function addToCart() {
    console.log('Add to cart clicked');
    if (!currentItem) {
        console.log('No current item selected');
        return;
    }
    
    const quantity = parseInt(document.getElementById('quantity').value);
    console.log('Adding to cart:', currentItem.name, 'qty:', quantity);
    
    const existingItemIndex = cart.findIndex(item => item.name === currentItem.name);
    
    if (existingItemIndex > -1) {
        // Item already exists, update quantity
        cart[existingItemIndex].quantity += quantity;
        console.log('Updated existing item, new qty:', cart[existingItemIndex].quantity);
    } else {
        // Add new item to cart
        cart.push({
            name: currentItem.name,
            price: currentItem.price,
            quantity: quantity,
            image: currentItem.image
        });
        console.log('Added new item to cart');
    }
    
    console.log('Cart now has', cart.length, 'items:', cart);
    updateCartDisplay();
    showAddToCartSuccess();
    
    // Reset quantity to 1 for next item
    document.getElementById('quantity').value = 1;
    updateTotalPrice();
}

// Remove Item from Cart
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartDisplay();
}

// Update Cart Quantity
function updateCartQuantity(index, change) {
    const newQuantity = cart[index].quantity + change;
    if (newQuantity <= 0) {
        removeFromCart(index);
    } else {
        cart[index].quantity = newQuantity;
        updateCartDisplay();
    }
}

// Show Add to Cart Success Message
function showAddToCartSuccess() {
    const successMsg = document.createElement('div');
    successMsg.className = 'cart-success-message';
    successMsg.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>Item added to cart!</span>
    `;
    document.body.appendChild(successMsg);
    
    setTimeout(() => {
        successMsg.remove();
    }, 2000);
}

// Update Cart Display
function updateCartDisplay() {
    console.log('Updating cart display, cart has', cart.length, 'items');
    const cartContainer = document.getElementById('cartItems');
    const cartSummary = document.getElementById('cartSummary');
    
    if (!cartContainer) {
        console.log('Cart container not found!');
        return;
    }
    
    if (cart.length === 0) {
        cartContainer.innerHTML = '<p class="empty-cart">No items in cart</p>';
        if (cartSummary) cartSummary.style.display = 'none';
        console.log('Cart is empty, hiding summary');
        return;
    }
    
    if (cartSummary) cartSummary.style.display = 'block';
    console.log('Cart has items, showing summary');
    
    let cartHTML = '';
    let cartTotal = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        cartTotal += itemTotal;
        
        cartHTML += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <span class="cart-item-price">₹${item.price} each</span>
                </div>
                <div class="cart-item-controls">
                    <div class="cart-quantity-control">
                        <button type="button" class="cart-qty-btn" onclick="updateCartQuantity(${index}, -1)">-</button>
                        <span class="cart-quantity">${item.quantity}</span>
                        <button type="button" class="cart-qty-btn" onclick="updateCartQuantity(${index}, 1)">+</button>
                    </div>
                    <span class="cart-item-total">₹${itemTotal}</span>
                    <button type="button" class="remove-cart-item" onclick="removeFromCart(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    cartContainer.innerHTML = cartHTML;
    
    // Update totals
    const deliveryCharges = 50;
    const grandTotal = cartTotal + deliveryCharges;
    
    const cartSubtotalElement = document.getElementById('cartSubtotal');
    const cartDeliveryChargesElement = document.getElementById('cartDeliveryCharges');
    const cartGrandTotalElement = document.getElementById('cartGrandTotal');
    
    if (cartSubtotalElement) cartSubtotalElement.textContent = cartTotal;
    if (cartDeliveryChargesElement) cartDeliveryChargesElement.textContent = deliveryCharges;
    if (cartGrandTotalElement) cartGrandTotalElement.textContent = grandTotal;
    
    console.log('Cart total:', cartTotal, 'Grand total:', grandTotal);
}

// Close Order Modal
function closeOrderModal() {
    document.getElementById('orderModal').style.display = 'none';
    document.getElementById('orderForm').reset();
    document.getElementById('quantity').value = 1;
}

// Close Success Modal
function closeSuccessModal() {
    document.getElementById('successModal').style.display = 'none';
}

// Change Quantity
function changeQuantity(change) {
    const quantityInput = document.getElementById('quantity');
    let currentQuantity = parseInt(quantityInput.value);
    let newQuantity = currentQuantity + change;
    
    if (newQuantity < 1) newQuantity = 1;
    if (newQuantity > 50) newQuantity = 50; // Max quantity limit
    
    quantityInput.value = newQuantity;
    updateTotalPrice();
}

// Update Total Price
function updateTotalPrice() {
    if (!currentItem) return;
    
    const quantity = parseInt(document.getElementById('quantity').value);
    const itemTotal = currentItem.price * quantity;
    const deliveryCharges = 50;
    const grandTotal = itemTotal + deliveryCharges;
    
    document.getElementById('totalPrice').textContent = itemTotal;
    document.getElementById('summaryTotal').textContent = itemTotal;
    document.getElementById('grandTotal').textContent = grandTotal;
}

// Generate Order Reference
function generateOrderRef() {
    const today = new Date();
    const dateStr = today.getFullYear().toString().substr(-2) + 
                   String(today.getMonth() + 1).padStart(2, '0') + 
                   String(today.getDate()).padStart(2, '0');
    return 'SAH-' + dateStr + '-' + String(orderCounter++).padStart(3, '0');
}

// Submit Order to Google Sheets
async function submitOrderToSheets(orderData) {
    // Google Apps Script Web App URL - Replace with your actual URL from Step 1C
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyN-0JInNgT_R2KU0yy1zOS31Wic5MJvaBXBtxQV6hpUBzQbye2eshGtF7DtmyCSju4Pw/exec';
    
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });
        
        return true; // no-cors mode doesn't allow reading response
    } catch (error) {
        console.error('Error submitting order:', error);
        return false;
    }
}

// Handle Order Form Submission
document.addEventListener('DOMContentLoaded', function() {
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (cart.length === 0) {
                alert('Please add items to your cart before placing an order.');
                return;
            }
            
            // Get form data
            const formData = new FormData(orderForm);
            const orderRef = generateOrderRef();
            
            // Calculate totals
            let cartTotal = 0;
            cart.forEach(item => {
                cartTotal += item.price * item.quantity;
            });
            
            const deliveryCharges = 50;
            const grandTotal = cartTotal + deliveryCharges;
            
            const orderData = {
                orderRef: orderRef,
                timestamp: new Date().toISOString(),
                items: cart, // Multiple items
                cartTotal: cartTotal,
                deliveryCharges: deliveryCharges,
                grandTotal: grandTotal,
                customerName: formData.get('customerName'),
                customerPhone: formData.get('customerPhone'),
                customerEmail: formData.get('customerEmail') || '',
                customerAddress: formData.get('customerAddress'),
                specialInstructions: formData.get('specialInstructions') || '',
                status: 'Pending'
            };
            
            // Show loading state
            const submitBtn = document.querySelector('.submit-order-btn');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            submitBtn.disabled = true;
            
            // Submit to Google Sheets
            const success = await submitOrderToSheets(orderData);
            
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            if (success) {
                // Clear cart after successful order
                cart = [];
                updateCartDisplay();
                
                // Close order modal
                closeOrderModal();
                
                // Show success modal
                document.getElementById('orderRef').textContent = orderRef;
                document.getElementById('successModal').style.display = 'block';
                
                // Create WhatsApp message with all items
                let itemsList = '';
                orderData.items.forEach(item => {
                    itemsList += `${item.name} (Qty: ${item.quantity}) - ₹${item.price * item.quantity}\n`;
                });
                
                const whatsappMessage = `New Order Received!\n\nOrder Ref: ${orderRef}\nCustomer: ${orderData.customerName}\nPhone: ${orderData.customerPhone}\n\nITEMS:\n${itemsList}\nCart Total: ₹${orderData.cartTotal}\nDelivery: ₹${orderData.deliveryCharges}\nGrand Total: ₹${orderData.grandTotal}\n\nPlease check your Google Sheet for full details.`;
                const whatsappUrl = `https://wa.me/918328299113?text=${encodeURIComponent(whatsappMessage)}`;
                
                // Auto-send WhatsApp notification (optional)
                // window.open(whatsappUrl, '_blank');
            } else {
                alert('There was an error submitting your order. Please try again or contact us directly.');
            }
        });
    }
    
    // Close modal when clicking outside
    window.onclick = function(event) {
        const orderModal = document.getElementById('orderModal');
        const successModal = document.getElementById('successModal');
        
        if (event.target === orderModal) {
            closeOrderModal();
        }
        if (event.target === successModal) {
            closeSuccessModal();
        }
    };
    
    // Quantity input change handler
    const quantityInput = document.getElementById('quantity');
    if (quantityInput) {
        quantityInput.addEventListener('input', updateTotalPrice);
    }
});

console.log('🍰 Soni\'s Sweet Shop website loaded successfully!');
console.log('Cart system initialized. Cart array:', cart);
console.log('Available functions: openOrderModal, addToCart, updateCartDisplay');

// Test the cart system on page load
if (typeof window !== 'undefined') {
    window.testCart = function() {
        console.log('Testing cart functions...');
        console.log('Cart:', cart);
        console.log('openOrderModal function:', typeof openOrderModal);
        console.log('addToCart function:', typeof addToCart);
    };
}