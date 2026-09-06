/* Submits the contact form to Netlify Forms via fetch, so visitors get an
   inline confirmation instead of a full page navigation. Falls back to a
   plain mailto suggestion if the request fails (e.g. offline, or running
   outside Netlify where the form endpoint doesn't exist). */

function encodeFormData(data) {
  return Object.keys(data)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
    .join("&");
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");
  if (!form || !status) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalLabel = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";

    const data = Object.fromEntries(new FormData(form).entries());

    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: encodeFormData(data),
    })
      .then((response) => {
        if (!response.ok) throw new Error(`Form submission failed: ${response.status}`);
        form.hidden = true;
        status.hidden = false;
        status.className = "form-status success";
        status.textContent = "Thanks — your message has been sent. We'll get back to you soon.";
      })
      .catch(() => {
        status.hidden = false;
        status.className = "form-status error";
        status.textContent =
          "Something went wrong sending your message. Please email us directly at techeasefl@gmail.com.";
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      });
  });
});
