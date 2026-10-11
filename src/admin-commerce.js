import { adminApi } from './lib/admin-api.js';
import { businessFields, policyFields, validateCommerceConfig, launchChecks } from './lib/commerce-config.js';
import { escapeHTML as e } from './ui.js';
export async function loadCommerceTab() {
  const node=document.getElementById('admin-tab-content');
  try {
    const [settings,products]=await Promise.all([adminApi.fetchSiteSettings(true),adminApi.fetchProducts(true)]);
    const config=settings.commerce || {};
    node.innerHTML=`<h3>STORE POLICIES & LAUNCH CHECKS</h3><p>Publish your actual business details and policies. A completed field is not a legal review or a verified integration.</p><ul class="launch-checks">${launchChecks(config,products).map(check=>`<li class="${check.ready?'check-ready':'check-needed'}"><strong>${check.ready?'Entered':'Needs attention'}</strong> — ${e(check.label)}${check.external?' (external setup / verification)':''}</li>`).join('')}</ul><form id="commerce-settings-form" class="admin-form-grid">${businessFields.map(([key,label])=>`<div class="form-group full-width"><label for="commerce-${key}">${e(label)}</label><input id="commerce-${key}" name="${key}" type="${key==='support_email'?'email':'text'}" maxlength="1000" value="${e(config[key] || '')}" /></div>`).join('')}${policyFields.map(([key,label,help])=>`<div class="form-group full-width"><label for="commerce-${key}">${e(label)}</label><small>${e(help)}</small><textarea id="commerce-${key}" name="${key}" rows="7" maxlength="15000">${e(config[key] || '')}</textarea></div>`).join('')}<p id="commerce-feedback" role="status"></p><button class="btn-primary" type="submit">Save store information</button></form>`;
    node.querySelector('form').onsubmit=async(event)=>{
      event.preventDefault();const form=event.currentTarget, button=form.querySelector('button');button.disabled=true;
      try{
        const next=Object.fromEntries(new FormData(form));
        for(const key in next)next[key]=next[key].trim();
        validateCommerceConfig(next);
        await adminApi.saveSiteSetting('commerce',next);
        await loadCommerceTab();
        document.getElementById('commerce-feedback').textContent='Store information saved.';
      }catch(error){document.getElementById('commerce-feedback').textContent=error.message;button.disabled=false;}
    };
  }catch(error){node.innerHTML=`<p role="alert">${e(error.message)}</p>`;}
}
