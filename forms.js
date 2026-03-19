/* ═══════════════════════════════════════════════════════════════
   FORMS.JS — Form Submission Handler
   Prevents default form submission behavior on all forms.
   This is a placeholder until a real backend (like Formspree
   or Stripe) is connected. Without this, the page would
   reload on every form submit.
   ═══════════════════════════════════════════════════════════════ */

/* Select all <form> elements on the page and prevent their
   default submit action (which would cause a page reload) */
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', e => e.preventDefault());
});
