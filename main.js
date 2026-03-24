const copyButton = document.querySelector("#copyPrompt");
const promptBox = document.querySelector(".prompt-box");

if (copyButton && promptBox) {
  copyButton.addEventListener("click", async () => {
    const promptText = promptBox.textContent.trim();

    try {
      await navigator.clipboard.writeText(promptText);
      copyButton.textContent = "Copied";

      window.setTimeout(() => {
        copyButton.textContent = "Copy Prompt";
      }, 1800);
    } catch (error) {
      copyButton.textContent = "Copy Unavailable";

      window.setTimeout(() => {
        copyButton.textContent = "Copy Prompt";
      }, 1800);
    }
  });
}
