/* globals
canvas,
foundry,
fromUuidSync,
game,
renderTemplate,
ui
*/
/* eslint no-unused-vars: ["error", { "argsIgnorePattern": "^_" }] */
"use strict";

import { log, tokenName } from "./util.js";
import { MODULE_ID, FLAGS, LABELS, NOTIFICATIONS } from "./const.js";

export const PATCHES = {};
PATCHES.BASIC = {};

// ----- Note: Hooks ----- //
function renderMeasuredTemplateConfigHook(app, html, data) {
  // Look up the token. If present in the scene, consider it attached for the config.
  const template = app.object.object;
  const attachedToken = template.attachedToken;
  let rotateWithToken = template.document.getFlag(MODULE_ID, FLAGS.ATTACHED_TOKEN.ROTATE);
  if (typeof rotateWithToken === 'undefined') {
    rotateWithToken = true;
  }
  const renderData = {};
  renderData[MODULE_ID] = {
    blockoptions: LABELS.WALLS_BLOCK,
    walloptions: LABELS.WALL_RESTRICTION,
    hideoptions: LABELS.TEMPLATE_HIDE,
    attachedTokenName: tokenName(attachedToken) || game.i18n.localize("None"),
    hasAttachedToken: Boolean(attachedToken),
    rotateWithToken: Boolean(rotateWithToken)
  };

  foundry.utils.mergeObject(data, renderData, { inplace: true });
  renderMeasuredTemplateConfig(app, html, data);
  activateListeners(app, html);
}

PATCHES.BASIC.HOOKS = { renderMeasuredTemplateConfig: renderMeasuredTemplateConfigHook };

// ----- Note: Wraps ----- //

/**
 * Wrapper for MeasuredTemplateConfig.defaultOptions
 * Make the template config window resize height automatically, to accommodate
 * different parameters.
 * @param {Function} wrapper
 * @return {Object} See MeasuredTemplateConfig.defaultOptions.
 */
export function defaultOptions(wrapper) {
  const options = wrapper();
  return foundry.utils.mergeObject(options, {
    height: "auto"
  });
}

PATCHES.BASIC.STATIC_WRAPS = { defaultOptions };


// ----- Note: Helper functions ----- //

/**
 * Catch when the user clicks a button to attach a token.
 */
function activateListeners(app, html) {
  html.on("click", "#walledtemplates-useSelectedToken", onSelectedTokenButton.bind(app));
  html.on("click", "#walledtemplates-useTargetedToken", onTargetedTokenButton.bind(app));
  html.on("click", "#walledtemplates-removeAttachedToken", onRemoveTokenButton.bind(app));
}

/**
 * Inject html to add controls to the measured template configuration:
 * 1. Switch to have the template be blocked by walls.
 *
 * templates/scene/template-config.html
 */
async function renderMeasuredTemplateConfig(app, html, data) {
  log("walledTemplatesRenderMeasuredTemplateConfig data", data);
  log(`enabled flag is ${data.document.getFlag(MODULE_ID, FLAGS.WALLS_BLOCK)}`);
  log("walledTemplatesRenderMeasuredTemplateConfig data after", data);

  const template = `modules/${MODULE_ID}/templates/walled-templates-measured-template-config.html`;
  const myHTML = await renderTemplate(template, data);
  log("config rendered HTML", myHTML);
  html.find(".form-group").last().after(myHTML);

  app.setPosition(app.position);
}

/**
 * Handle when user clicks the "Attach last selected token" button.
 * @param {Event} event
 */
async function onSelectedTokenButton(_event) {
  const token = fromUuidSync(game.user._lastSelected)?.object;
  if (!token) {
    ui.notifications.notify(game.i18n.localize(NOTIFICATIONS.NOTIFY.ATTACH_TOKEN_NOT_SELECTED));
    return;
  }
  const template = this.document.object;
  await template.attachToken(token);
  ui.notifications.notify(`${tokenName(token)} attached!`);
  this.render();
}

/**
 * Handle when user clicks the "Attach last targeted token" button.
 * @param {Event} event
 */
async function onTargetedTokenButton(_event) {
  const tokenId = game.user.targets.ids.at(-1);
  if (!tokenId) {
    ui.notifications.notify(game.i18n.localize(NOTIFICATIONS.NOTIFY.ATTACH_TOKEN_NOT_TARGETED));
    return;
  }
  const token = canvas.tokens.documentCollection.get(tokenId)?.object;
  if (!token) {
    ui.notifications.error(`Targeted token for id ${tokenId} not found.`);
    return;
  }
  const template = this.document.object;
  await template.attachToken(token);
  ui.notifications.notify(`${tokenName(token)} attached!`);
}

/**
 * Handle when user clicks "Remove attached token" button
 * @param {Event} event
 */
async function onRemoveTokenButton(_event) {
  const template = this.document.object;
  await template.detachToken();
  this.render();
  ui.notifications.notify("Token detached!");
}
