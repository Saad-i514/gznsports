export const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', 'One size'];

export function normalizeSizes(value) {
  return [...new Set((Array.isArray(value) ? value : String(value || '').split(','))
    .map(size => String(size).trim()).filter(Boolean))];
}

export function initSizePicker(root) {
  const select = root.querySelector('select');
  const chips = root.querySelector('.admin-size-chips');
  const status = root.querySelector('[role="status"]');
  let selected = [];
  function render() {
    select.replaceChildren(new Option('Select a size to add…', ''));
    for (const size of [...new Set([...SIZE_OPTIONS, ...selected])]) {
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
      button.setAttribute('aria-label', `Remove size ${size}`);
      button.onclick = () => {
        selected = selected.filter(item => item !== size);
        render(); select.focus();
        root.dispatchEvent(new Event('input', {bubbles:true}));
      };
      chips.append(button);
    }
    status.textContent = selected.length ? `${selected.length} sizes selected. First size is the default.` : 'Select at least one size. Use One size for bags and accessories.';
    select.setCustomValidity(selected.length ? '' : 'Select at least one size.');
  }
  select.addEventListener('change', () => {
    if (select.value && !selected.includes(select.value)) selected.push(select.value);
    render();
    root.dispatchEvent(new Event('input', {bubbles:true}));
  });
  render();
  return {set(value) {selected = normalizeSizes(value); render();}, get() {return [...selected];}};
}
