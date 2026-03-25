const copyButton = document.getElementById("copy-prompt");
const promptField = document.getElementById("prompt-text");
const feedback = document.getElementById("copy-feedback");
const proofItems = Array.from(document.querySelectorAll(".proof-item"));

function updateProofState(proofItem) {
  const checkbox = proofItem.querySelector('input[type="checkbox"]');
  const textInput = proofItem.querySelector('input[type="text"]');
  const checked = checkbox.checked;

  textInput.disabled = !checked;
  textInput.required = checked;
  textInput.placeholder = checked ? "Add proof note" : "Check the box to add proof";
  proofItem.style.borderColor = checked ? "rgba(139, 0, 0, 0.32)" : "rgba(17, 17, 17, 0.14)";
}

proofItems.forEach((proofItem) => {
  const checkbox = proofItem.querySelector('input[type="checkbox"]');
  checkbox.addEventListener("change", () => updateProofState(proofItem));
  updateProofState(proofItem);
});

copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(promptField.value);
    feedback.textContent = "Prompt copied for the next build step.";
  } catch (error) {
    feedback.textContent = "Copy failed. Select the prompt text and copy it manually.";
  }
});
