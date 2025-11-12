/**
 * HKMU CourseHub - Main Client-Side JavaScript
 */

(function() {
  'use strict';

  // ========== INITIALIZATION ==========
  document.addEventListener('DOMContentLoaded', function() {
    initFlashMessages();
    initDropdowns();
    initFormValidation();
    initTooltips();
  });

  // ========== FLASH MESSAGES ==========
  function initFlashMessages() {
    const flashMessages = document.querySelectorAll('.alert');

    flashMessages.forEach(function(alert) {
      // Auto-dismiss after 5 seconds
      setTimeout(function() {
        fadeOut(alert);
      }, 5000);
    });
  }

  function fadeOut(element) {
    let opacity = 1;
    const timer = setInterval(function() {
      if (opacity <= 0.1) {
        clearInterval(timer);
        element.remove();
      }
      element.style.opacity = opacity;
      opacity -= 0.1;
    }, 50);
  }

  // ========== DROPDOWNS ==========
  function initDropdowns() {
    const userMenus = document.querySelectorAll('.user-menu');

    userMenus.forEach(function(menu) {
      menu.addEventListener('click', function(e) {
        e.stopPropagation();
        this.classList.toggle('active');
      });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function() {
      userMenus.forEach(function(menu) {
        menu.classList.remove('active');
      });
    });
  }

  // ========== FORM VALIDATION ==========
  function initFormValidation() {
    const forms = document.querySelectorAll('form[data-validate]');

    forms.forEach(function(form) {
      form.addEventListener('submit', function(e) {
        if (!validateForm(this)) {
          e.preventDefault();
        }
      });
    });
  }

  function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');

    inputs.forEach(function(input) {
      if (!input.value.trim()) {
        showFieldError(input, 'This field is required');
        isValid = false;
      } else {
        clearFieldError(input);
      }
    });

    return isValid;
  }

  function showFieldError(input, message) {
    clearFieldError(input);

    input.classList.add('error');
    const errorMsg = document.createElement('span');
    errorMsg.className = 'field-error';
    errorMsg.textContent = message;
    input.parentNode.appendChild(errorMsg);
  }

  function clearFieldError(input) {
    input.classList.remove('error');
    const existingError = input.parentNode.querySelector('.field-error');
    if (existingError) {
      existingError.remove();
    }
  }

  // ========== TOOLTIPS ==========
  function initTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');

    tooltipElements.forEach(function(element) {
      element.addEventListener('mouseenter', function() {
        showTooltip(this);
      });

      element.addEventListener('mouseleave', function() {
        hideTooltip(this);
      });
    });
  }

  function showTooltip(element) {
    const tooltipText = element.getAttribute('data-tooltip');
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = tooltipText;

    document.body.appendChild(tooltip);

    const rect = element.getBoundingClientRect();
    tooltip.style.top = (rect.top - tooltip.offsetHeight - 10) + 'px';
    tooltip.style.left = (rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2)) + 'px';

    element._tooltip = tooltip;
  }

  function hideTooltip(element) {
    if (element._tooltip) {
      element._tooltip.remove();
      delete element._tooltip;
    }
  }

  // ========== SMOOTH SCROLL ==========
  const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');

  smoothScrollLinks.forEach(function(link) {
    link.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // ========== LOADING INDICATOR ==========
  window.showLoading = function() {
    const loader = document.createElement('div');
    loader.id = 'global-loader';
    loader.innerHTML = `
      <div class="loader-spinner"></div>
      <p>Loading...</p>
    `;
    document.body.appendChild(loader);
  };

  window.hideLoading = function() {
    const loader = document.getElementById('global-loader');
    if (loader) {
      loader.remove();
    }
  };

  // ========== CONFIRMATION DIALOGS ==========
  const confirmButtons = document.querySelectorAll('[data-confirm]');

  confirmButtons.forEach(function(button) {
    button.addEventListener('click', function(e) {
      const message = this.getAttribute('data-confirm');
      if (!confirm(message)) {
        e.preventDefault();
      }
    });
  });

  // ========== UTILITIES ==========
  window.CourseHub = {
    showNotification: function(message, type = 'info') {
      const notification = document.createElement('div');
      notification.className = `alert alert-${type}`;
      notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button class="close-btn" onclick="this.parentElement.remove()">
          <i class="fas fa-times"></i>
        </button>
      `;

      let container = document.querySelector('.flash-messages');
      if (!container) {
        container = document.createElement('div');
        container.className = 'flash-messages';
        document.body.appendChild(container);
      }

      container.appendChild(notification);

      setTimeout(function() {
        fadeOut(notification);
      }, 5000);
    },

    formatDate: function(dateString) {
      const date = new Date(dateString);
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    },

    formatFileSize: function(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }
  };

})();
