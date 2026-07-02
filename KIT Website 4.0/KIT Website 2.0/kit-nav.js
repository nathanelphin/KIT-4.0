/* KIT — nav behaviour (mobile toggle + accordion dropdowns) */
(function () {
  function init() {
    var toggle = document.querySelector('.menu-toggle');
    var links = document.querySelector('.primary-links');
    if (toggle && links) {
      toggle.addEventListener('click', function () {
        links.classList.toggle('open');
      });
    }
    // accordion on mobile: tap a parent to reveal its dropdown
    document.querySelectorAll('.nav-item > a').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var item = a.closest('.nav-item');
        if (!item) return;
        var dd = item.querySelector('.dropdown');
        if (!dd) return;
        // only intercept on small screens
        if (window.matchMedia('(max-width: 1024px)').matches) {
          e.preventDefault();
          // close siblings
          document.querySelectorAll('.nav-item.open').forEach(function (el) {
            if (el !== item) el.classList.remove('open');
          });
          item.classList.toggle('open');
        }
      });
    });
    // close mobile menu when a leaf link is clicked
    document.querySelectorAll('.primary-links .dropdown a').forEach(function (a) {
      a.addEventListener('click', function () {
        if (links) links.classList.remove('open');
      });
    });
    // dynamic year in footer
    var yr = document.getElementById('yr');
    if (yr) yr.textContent = new Date().getFullYear();

    // Leader message "Read more / Read less" toggle
    document.querySelectorAll('.leader-toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var leader = btn.closest('.leader');
        if (!leader) return;
        var isOpen = leader.classList.toggle('open');
        var label = btn.querySelector('.label');
        if (label) label.textContent = isOpen ? 'Read less' : 'Read more';
        btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/* KIT — application form: validation + local submission handling */
(function () {
  function init() {
    var form = document.getElementById('kitApplyForm');
    if (!form) return; // form only lives on admission-apply.html

    var successPanel = document.getElementById('applySuccess');
    var confirmError = document.getElementById('confirmError');
    var applyAgainBtn = document.getElementById('applyAgainBtn');

    var fields = [
      { id: 'applyName', check: function (v) { return v.trim().length > 1; } },
      { id: 'applyEmail', check: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); } },
      { id: 'applyProgram', check: function (v) { return v !== ''; } },
      { id: 'applyEducation', check: function (v) { return v !== ''; } },
      { id: 'applyStatement', check: function (v) { return v.trim().length >= 40; } }
    ];

    function fieldWrap(el) {
      return el.closest('.field');
    }

    function validate() {
      var valid = true;

      fields.forEach(function (f) {
        var el = document.getElementById(f.id);
        var wrap = fieldWrap(el);
        if (!f.check(el.value)) {
          wrap.classList.add('invalid');
          valid = false;
        } else {
          wrap.classList.remove('invalid');
        }
      });

      var confirmBox = document.getElementById('applyConfirm');
      if (!confirmBox.checked) {
        confirmError.style.display = 'block';
        valid = false;
      } else {
        confirmError.style.display = 'none';
      }

      return valid;
    }

    function generateReference() {
      var year = new Date().getFullYear();
      var rand = Math.floor(100000 + Math.random() * 900000);
      return 'KIT-' + year + '-' + rand;
    }

    function saveSubmission(record) {
      var key = 'kit_applications';
      var existing = [];
      try {
        var raw = window.localStorage.getItem(key);
        if (raw) existing = JSON.parse(raw);
      } catch (e) {
        existing = [];
      }
      existing.push(record);
      try {
        window.localStorage.setItem(key, JSON.stringify(existing));
      } catch (e) {
        /* storage unavailable — submission still confirmed for this session */
      }
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!validate()) {
        var firstInvalid = form.querySelector('.field.invalid input, .field.invalid select, .field.invalid textarea');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var record = {
        reference: generateReference(),
        submittedAt: new Date().toISOString(),
        fullName: document.getElementById('applyName').value.trim(),
        email: document.getElementById('applyEmail').value.trim(),
        phone: document.getElementById('applyPhone').value.trim(),
        program: document.getElementById('applyProgram').value,
        education: document.getElementById('applyEducation').value,
        statement: document.getElementById('applyStatement').value.trim(),
        japanPathway: document.getElementById('applyJapan').checked
      };

      saveSubmission(record);

      document.getElementById('successName').textContent = record.fullName.split(' ')[0] || 'applicant';
      document.getElementById('successRef').textContent = record.reference;

      form.classList.add('hide');
      successPanel.classList.add('show');
      successPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    if (applyAgainBtn) {
      applyAgainBtn.addEventListener('click', function (e) {
        e.preventDefault();
        form.reset();
        fields.forEach(function (f) {
          fieldWrap(document.getElementById(f.id)).classList.remove('invalid');
        });
        confirmError.style.display = 'none';
        successPanel.classList.remove('show');
        form.classList.remove('hide');
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

