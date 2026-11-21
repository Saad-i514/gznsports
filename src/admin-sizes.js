export const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', 'One size'];

export function normalizeSizes(value) {
  return [...new Set((Array.isArray(value) ? value : String(value || '').split(','))
    .map(size => String(size).trim()).filter(Boolean))];
}

export function initOptionPicker(root, {options = SIZE_OPTIONS, kind = 'size', required = true} = {}) {
  const select = root.querySelector('select');
  const chips = root.querySelector('.admin-size-chips');
  const status = root.querySelector('[role="status"]');
  let selected = [];
  function render() {
    select.replaceChildren(new Option(`Select a ${kind} to add…`, ''));
    for (const size of [...new Set([...options, ...selected])]) {
      const option = new Option(size, size);
      option.disabled = selected.includes(size);
      select.add(option);
    }
    chips.replaceChildren();
    for (const size of selected) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'admin-size-chip';
      button.textContent = `${size} ×`;
      button.setAttribute('aria-label', `Remove ${kind} ${size}`);
      button.onclick = () => {
        selected = selected.filter(item => item !== size);
        render(); select.focus();
        root.dispatchEvent(new Event('input', {bubbles:true}));
      };
      chips.append(button);
    }
    status.textContent = selected.length ? `${selected.length} ${kind}${selected.length === 1 ? "" : "s"} selected. First ${kind} is the default.` : required ? 'Select at least one size. Use One size for bags and accessories.' : 'No colors selected. Customers will see As pictured.';
    select.setCustomValidity(!required || selected.length ? '' : 'Select at least one size.');
  }
  select.addEventListener('change', () => {
    if (select.value && !selected.includes(select.value)) selected.push(select.value);
    render();
    root.dispatchEvent(new Event('input', {bubbles:true}));
  });
  const custom = root.querySelector('[data-custom-option]');
  root.querySelector('[data-add-option]')?.addEventListener('click', () => {
    const value = custom.value.trim();
    if (!value) return;
    if (value.length > 60 || value.includes(',')) { custom.setCustomValidity('Enter one color, up to 60 characters, without commas.'); custom.reportValidity(); return; }
    custom.setCustomValidity('');
    if (!selected.includes(value)) selected.push(value);
    custom.value = ''; render();
    root.dispatchEvent(new Event('input', {bubbles:true}));
  });
  custom?.addEventListener('input', () => custom.setCustomValidity(''));
  custom?.addEventListener('keydown', event => {
    if (event.key === 'Enter') { event.preventDefault(); root.querySelector('[data-add-option]').click(); }
  });
  render();
  return {set(value) {selected = normalizeSizes(value); render();}, get() {return [...selected];}};
}

export const initSizePicker = root => initOptionPicker(root);
