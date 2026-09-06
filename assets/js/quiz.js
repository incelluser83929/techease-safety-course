/* Small, dependency-free knowledge-check renderer.
   Usage: renderQuiz(containerEl, [{ q, options: [...], correct: index, explanation }]) */

export function renderQuiz(container, questions) {
  if (!container) return;

  container.innerHTML = "";
  const form = document.createElement("form");
  form.noValidate = true;

  questions.forEach((item, qIndex) => {
    const block = document.createElement("div");
    block.className = "quiz-question";

    const qText = document.createElement("p");
    qText.className = "q-text";
    qText.textContent = `${qIndex + 1}. ${item.q}`;
    block.appendChild(qText);

    item.options.forEach((optionText, optIndex) => {
      const label = document.createElement("label");
      label.className = "quiz-option";

      const input = document.createElement("input");
      input.type = "radio";
      input.name = `q${qIndex}`;
      input.value = String(optIndex);

      const span = document.createElement("span");
      span.textContent = optionText;

      label.appendChild(input);
      label.appendChild(span);
      block.appendChild(label);
    });

    const feedback = document.createElement("div");
    feedback.className = "quiz-feedback";
    feedback.dataset.role = "feedback";
    block.appendChild(feedback);

    form.appendChild(block);
  });

  const submitRow = document.createElement("div");
  submitRow.style.marginTop = "18px";

  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.className = "btn btn-primary";
  submitBtn.textContent = "Check my answers";
  submitRow.appendChild(submitBtn);

  const result = document.createElement("p");
  result.className = "quiz-result";
  result.setAttribute("role", "status");

  form.appendChild(submitRow);
  form.appendChild(result);
  container.appendChild(form);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    let correctCount = 0;
    const blocks = form.querySelectorAll(".quiz-question");

    questions.forEach((item, qIndex) => {
      const block = blocks[qIndex];
      const options = block.querySelectorAll(".quiz-option");
      const selected = form.querySelector(`input[name="q${qIndex}"]:checked`);
      const feedback = block.querySelector('[data-role="feedback"]');

      options.forEach((optionEl, optIndex) => {
        optionEl.classList.remove("correct", "incorrect");
        if (optIndex === item.correct) optionEl.classList.add("correct");
        else if (selected && Number(selected.value) === optIndex) optionEl.classList.add("incorrect");
      });

      if (selected && Number(selected.value) === item.correct) correctCount += 1;

      feedback.textContent = item.explanation || "";
      feedback.classList.add("show");
    });

    result.textContent = `You got ${correctCount} of ${questions.length} correct.`;
  });
}
