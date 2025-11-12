/**
 * HKMU CourseHub - Review Interactions
 */

(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    initHelpfulButtons();
    initReviewSorting();
    initReviewFilters();
  });

  // ========== HELPFUL BUTTON ==========
  function initHelpfulButtons() {
    const helpfulButtons = document.querySelectorAll('.helpful-btn');

    helpfulButtons.forEach(button => {
      button.addEventListener('click', function() {
        const reviewId = this.getAttribute('data-review-id');
        markReviewHelpful(reviewId, this);
      });
    });
  }

  function markReviewHelpful(reviewId, button) {
    // Check if already marked
    if (button.classList.contains('marked')) {
      return;
    }

    fetch(`/reviews/${reviewId}/helpful`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Update button state
          button.classList.add('marked');

          // Increment count
          const currentCount = parseInt(button.textContent.match(/\d+/)[0]);
          button.innerHTML = `
            <i class="fas fa-thumbs-up"></i>
            Helpful (${currentCount + 1})
          `;

          // Store in localStorage to prevent multiple clicks
          const markedReviews = JSON.parse(localStorage.getItem('markedHelpful') || '[]');
          markedReviews.push(reviewId);
          localStorage.setItem('markedHelpful', JSON.stringify(markedReviews));

          // Show feedback
          window.CourseHub.showNotification('Thank you for your feedback!', 'success');
        }
      })
      .catch(error => {
        console.error('Error marking review helpful:', error);
        window.CourseHub.showNotification('Something went wrong. Please try again.', 'error');
      });
  }

  // Check for already marked reviews on page load
  const markedReviews = JSON.parse(localStorage.getItem('markedHelpful') || '[]');
  document.querySelectorAll('.helpful-btn').forEach(button => {
    const reviewId = button.getAttribute('data-review-id');
    if (markedReviews.includes(reviewId)) {
      button.classList.add('marked');
      button.style.opacity = '0.6';
      button.style.cursor = 'default';
    }
  });

  // ========== REVIEW SORTING ==========
  function initReviewSorting() {
    const sortSelect = document.getElementById('reviewSort');
    if (!sortSelect) return;

    sortSelect.addEventListener('change', function() {
      const sortBy = this.value;
      const reviewsList = document.querySelector('.reviews-list');
      const reviews = Array.from(reviewsList.querySelectorAll('.review-card'));

      reviews.sort((a, b) => {
        switch(sortBy) {
          case 'rating-high':
            return getRating(b) - getRating(a);
          case 'rating-low':
            return getRating(a) - getRating(b);
          case 'helpful':
            return getHelpfulCount(b) - getHelpfulCount(a);
          case 'recent':
          default:
            return getDate(b) - getDate(a);
        }
      });

      reviewsList.innerHTML = '';
      reviews.forEach(review => reviewsList.appendChild(review));
    });

    function getRating(reviewCard) {
      const stars = reviewCard.querySelectorAll('.rating-stars i.filled').length;
      return stars;
    }

    function getHelpfulCount(reviewCard) {
      const helpfulBtn = reviewCard.querySelector('.helpful-btn');
      const match = helpfulBtn.textContent.match(/\d+/);
      return match ? parseInt(match[0]) : 0;
    }

    function getDate(reviewCard) {
      const dateText = reviewCard.querySelector('.review-date').textContent;
      return new Date(dateText);
    }
  }

  // ========== REVIEW FILTERS ==========
  function initReviewFilters() {
    const filterButtons = document.querySelectorAll('.review-filter-btn');
    if (filterButtons.length === 0) return;

    filterButtons.forEach(button => {
      button.addEventListener('click', function() {
        const filterType = this.getAttribute('data-filter');
        const filterValue = this.getAttribute('data-value');

        filterReviews(filterType, filterValue);

        // Update active state
        filterButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
      });
    });
  }

  function filterReviews(type, value) {
    const reviews = document.querySelectorAll('.review-card');

    reviews.forEach(review => {
      let shouldShow = true;

      if (type === 'rating' && value !== 'all') {
        const rating = review.querySelectorAll('.rating-stars i.filled').length;
        shouldShow = rating >= parseInt(value);
      }

      if (type === 'semester' && value !== 'all') {
        const semester = review.querySelector('.review-date').textContent;
        shouldShow = semester.includes(value);
      }

      review.style.display = shouldShow ? 'block' : 'none';
    });
  }

  // ========== REVIEW FORM ENHANCEMENTS ==========
  const reviewForm = document.getElementById('reviewForm');
  if (reviewForm) {
    // Character counter
    const reviewText = document.getElementById('reviewText');
    const charCount = document.getElementById('charCount');

    if (reviewText && charCount) {
      reviewText.addEventListener('input', function() {
        charCount.textContent = this.value.length;

        if (this.value.length < 50) {
          charCount.style.color = 'var(--danger-color)';
        } else if (this.value.length > 1900) {
          charCount.style.color = 'var(--warning-color)';
        } else {
          charCount.style.color = 'var(--success-color)';
        }
      });
    }

    // Form submission confirmation
    reviewForm.addEventListener('submit', function(e) {
      const rating = document.getElementById('rating').value;
      const reviewLength = reviewText.value.length;

      if (reviewLength < 50) {
        e.preventDefault();
        window.CourseHub.showNotification('Review must be at least 50 characters long', 'error');
        return false;
      }

      if (rating < 3) {
        const confirmed = confirm('You gave a low rating. Are you sure you want to submit this review?');
        if (!confirmed) {
          e.preventDefault();
          return false;
        }
      }
    });
  }

  // ========== EXPORT ==========
  window.CourseHubReviews = {
    sortReviews: function(sortBy) {
      const sortSelect = document.getElementById('reviewSort');
      if (sortSelect) {
        sortSelect.value = sortBy;
        sortSelect.dispatchEvent(new Event('change'));
      }
    },

    filterByRating: function(minRating) {
      filterReviews('rating', minRating.toString());
    }
  };

})();
