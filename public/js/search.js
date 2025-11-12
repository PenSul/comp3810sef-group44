/**
 * HKMU CourseHub - Search & Filter Functionality
 */

(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    initSearchAutocomplete();
    initFilterPresets();
    initLiveSearch();
  });

  // ========== SEARCH AUTOCOMPLETE ==========
  function initSearchAutocomplete() {
    const searchInput = document.querySelector('.search-input');
    if (!searchInput) return;

    let autocompleteList = null;
    let debounceTimer = null;

    searchInput.addEventListener('input', function() {
      clearTimeout(debounceTimer);

      debounceTimer = setTimeout(() => {
        const query = this.value.trim();

        if (query.length < 2) {
          hideAutocomplete();
          return;
        }

        fetchSuggestions(query);
      }, 300);
    });

    searchInput.addEventListener('blur', function() {
      setTimeout(hideAutocomplete, 200);
    });

    function fetchSuggestions(query) {
      // In a real implementation, this would fetch from the API
      // For now, we'll show a simple autocomplete based on existing courses

      fetch(`/api/courses?search=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
          if (data.success && data.data.length > 0) {
            showAutocomplete(data.data.slice(0, 5));
          } else {
            hideAutocomplete();
          }
        })
        .catch(error => {
          console.error('Autocomplete error:', error);
          hideAutocomplete();
        });
    }

    function showAutocomplete(courses) {
      hideAutocomplete();

      autocompleteList = document.createElement('div');
      autocompleteList.className = 'autocomplete-list';

      courses.forEach(course => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item';
        item.innerHTML = `
          <strong>${course.courseCode}</strong>
          <span>${course.courseName}</span>
        `;
        item.addEventListener('click', function() {
          window.location.href = `/courses/${course.courseCode}`;
        });
        autocompleteList.appendChild(item);
      });

      searchInput.parentNode.appendChild(autocompleteList);
    }

    function hideAutocomplete() {
      if (autocompleteList) {
        autocompleteList.remove();
        autocompleteList = null;
      }
    }
  }

  // ========== FILTER PRESETS ==========
  function initFilterPresets() {
    const presets = [
      {
        name: 'Top Rated',
        filters: { minRating: '4', sort: 'rating-high' }
      },
      {
        name: 'Most Reviewed',
        filters: { sort: 'reviews-most' }
      },
      {
        name: 'Easiest',
        filters: { difficulty: 'easy', sort: 'difficulty-easy' }
      }
    ];

    const filtersContainer = document.querySelector('.filters');
    if (!filtersContainer) return;

    const presetsContainer = document.createElement('div');
    presetsContainer.className = 'filter-presets';
    presetsContainer.innerHTML = '<span class="presets-label">Quick Filters:</span>';

    presets.forEach(preset => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'preset-btn';
      button.textContent = preset.name;
      button.addEventListener('click', function() {
        applyFilterPreset(preset.filters);
      });
      presetsContainer.appendChild(button);
    });

    filtersContainer.parentNode.insertBefore(presetsContainer, filtersContainer);
  }

  function applyFilterPreset(filters) {
    const form = document.querySelector('.search-form');
    if (!form) return;

    Object.keys(filters).forEach(key => {
      const input = form.querySelector(`[name="${key}"]`);
      if (input) {
        input.value = filters[key];
      }
    });

    form.submit();
  }

  // ========== LIVE SEARCH ==========
  function initLiveSearch() {
    const searchForm = document.querySelector('.search-form');
    if (!searchForm) return;

    const liveSearchToggle = document.createElement('label');
    liveSearchToggle.className = 'live-search-toggle';
    liveSearchToggle.innerHTML = `
      <input type="checkbox" id="liveSearch">
      <span>Live Search</span>
    `;

    const searchBar = document.querySelector('.search-bar');
    if (searchBar) {
      searchBar.appendChild(liveSearchToggle);
    }

    const liveSearchCheckbox = document.getElementById('liveSearch');
    const searchInput = document.querySelector('.search-input');
    const filterSelects = document.querySelectorAll('.filter-select');

    if (liveSearchCheckbox && searchInput) {
      let searchTimeout = null;

      const performLiveSearch = function() {
        if (!liveSearchCheckbox.checked) return;

        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          updateResults();
        }, 500);
      };

      searchInput.addEventListener('input', performLiveSearch);

      filterSelects.forEach(select => {
        select.addEventListener('change', function() {
          if (liveSearchCheckbox.checked) {
            updateResults();
          }
        });
      });
    }

    function updateResults() {
      const formData = new FormData(searchForm);
      const params = new URLSearchParams(formData);

      fetch(`/api/courses?${params.toString()}`)
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            renderCourses(data.data);
          }
        })
        .catch(error => {
          console.error('Live search error:', error);
        });
    }

    function renderCourses(courses) {
      const coursesGrid = document.querySelector('.courses-grid');
      if (!coursesGrid) return;

      if (courses.length === 0) {
        coursesGrid.innerHTML = `
          <div class="empty-state" style="grid-column: 1 / -1;">
            <i class="fas fa-search"></i>
            <h3>No courses found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        `;
        return;
      }

      coursesGrid.innerHTML = courses.map(course => `
        <div class="course-card">
          <div class="course-header">
            <h3>${course.courseCode}</h3>
            <span class="course-program">${course.program}</span>
          </div>
          <h4 class="course-name">${course.courseName}</h4>
          <p class="course-description">
            ${course.description.substring(0, 120)}...
          </p>
          <div class="course-meta">
            <span><i class="fas fa-book"></i> ${course.credits} Credits</span>
          </div>
          <div class="course-stats">
            <div class="stat">
              <span class="stat-label">Rating</span>
              <span class="stat-value rating">
                <i class="fas fa-star"></i>
                ${course.averageRating > 0 ? course.averageRating.toFixed(1) : 'N/A'}
              </span>
            </div>
            <div class="stat">
              <span class="stat-label">Reviews</span>
              <span class="stat-value">${course.reviewCount}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Difficulty</span>
              <span class="stat-value">
                ${course.averageDifficulty > 0 ? course.averageDifficulty.toFixed(1) : 'N/A'}/5
              </span>
            </div>
            <div class="stat">
              <span class="stat-label">Workload</span>
              <span class="stat-value">
                ${course.averageWorkload > 0 ? course.averageWorkload.toFixed(1) : 'N/A'}/5
              </span>
            </div>
          </div>
          <a href="/courses/${course.courseCode}" class="btn btn-primary btn-block">
            View Details
          </a>
        </div>
      `).join('');
    }
  }

  // ========== EXPORT ==========
  window.CourseHubSearch = {
    clearFilters: function() {
      const form = document.querySelector('.search-form');
      if (form) {
        form.reset();
        form.submit();
      }
    }
  };

})();
