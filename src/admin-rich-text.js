import { formattedText, editorValue } from './lib/formatted-text.js';

export function initRichTextEditors(root) {
  return [...root.querySelectorAll('textarea[data-rich-text]')].map(textarea => {
    const wrapper = document.createElement('div');
    wrapper.className = 'rich-text-editor';
    wrapper.innerHTML = '<div class="rich-text-toolbar" role="group" aria-label="Text formatting"><button type="button" data-format="bold" aria-label="Bold" title="Bold (Ctrl+B)"><strong>B</strong></button><button type="button" data-format="italic" aria-label="Italic" title="Italic (Ctrl+I)"><em>I</em></button></div><div class="rich-text-input" contenteditable="true" role="textbox" aria-multiline="true"></div><small>Select text, then choose Bold or Italic.</small><small class="rich-text-error" role="alert"></small>';
    textarea.after(wrapper);
    textarea.hidden = true;
    const editor = wrapper.querySelector('[contenteditable]');
    editor.id = textarea.id + '-editor';
    const label = root.querySelector(`label[for="${textarea.id}"]`);
    if (label) { label.id ||= textarea.id + '-label'; editor.setAttribute('aria-labelledby', label.id); label.onclick = () => editor.focus(); }
    else editor.setAttribute('aria-label', 'Text editor');
    let selection;
    const saveSelection = () => {
      const selected = window.getSelection();
      if (selected.rangeCount && editor.contains(selected.anchorNode)) selection = selected.getRangeAt(0).cloneRange();
      for (const button of wrapper.querySelectorAll('[data-format]'))
        button.setAttribute('aria-pressed', String(document.queryCommandState(button.dataset.format)));
    };
    const sync = () => {
      textarea.value = Array.from(editor.childNodes, editorValue).join('');
      textarea.dispatchEvent(new Event('input', {bubbles:true}));
    };
    editor.addEventListener('input', sync);
    editor.addEventListener('keyup', saveSelection);
    editor.addEventListener('mouseup', saveSelection);
    editor.addEventListener('blur', saveSelection);
    for (const button of wrapper.querySelectorAll('[data-format]')) {
      button.onmousedown = event => event.preventDefault();
      button.onclick = () => {
        editor.focus();
        if (selection && editor.contains(selection.commonAncestorContainer)) { const selected = window.getSelection(); selected.removeAllRanges(); selected.addRange(selection); }
        // shortcut: native commands preserve undo; replace if target browsers drop editing-command support.
        document.execCommand(button.dataset.format);
        sync(); saveSelection();
      };
    }
    editor.addEventListener('paste', event => {
      event.preventDefault();
      document.execCommand('insertText', false, event.clipboardData.getData('text/plain'));
      sync();
    });
    editor.addEventListener('drop', event => event.preventDefault());
    textarea.form?.addEventListener('submit', event => {
      sync();
      const invalid = textarea.maxLength >= 0 && textarea.value.length > textarea.maxLength;
      wrapper.querySelector('.rich-text-error').textContent = invalid ? `Keep this text under ${textarea.maxLength} characters, including formatting.` : '';
      if (invalid) { event.preventDefault(); event.stopImmediatePropagation(); editor.focus(); }
    }, true);
    const set = value => { textarea.value = value; editor.innerHTML = formattedText(value); selection = null; };
    set(textarea.value);
    return {set};
  });
}
