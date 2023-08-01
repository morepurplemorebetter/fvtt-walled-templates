/* globals
game
*/

"use strict";

import { log } from "./util.js";
import { MODULE_ID, SHAPE_KEYS } from "./const.js";
import { registerAutotargeting } from "./patching.js";
import { WalledTemplateShapeSettings } from "./WalledTemplateShapeSettings.js";

export const SETTINGS = {
  DEFAULT_WALLS_BLOCK: {},
  DEFAULT_WALL_RESTRICTIONS: {},
  DIAGONAL_SCALING: {},
  DEFAULT_HEIGHT: {},
  DEFAULT_HEIGHT_CUSTOM_VALUE: {},
  DEFAULT_HEIGHT_TOKEN_OVERRIDE: {},

  AUTOTARGET: {},

  CHANGELOG: "changelog"
};

SETTINGS.AUTOTARGET = {
  ENABLED: "autotarget-enabled",
  MENU: "autotarget-menu",
  METHOD: "autotarget-method",
  AREA: "autotarget-area",
  CHOICES: {
    NO: "no",
    TOGGLE_OFF: "toggle-off",
    TOGGLE_ON: "toggle-on",
    YES: "yes"
  },

  METHODS: {
    CENTER: "center",
    OVERLAP: "overlap"
  }
};

SETTINGS.DEFAULT_WALLS_BLOCK.CHOICES = {
  UNWALLED: "unwalled",
  WALLED: "walled",
  RECURSE: "recurse"
};

SETTINGS.DEFAULT_WALL_RESTRICTIONS.CHOICES = {
  LIGHT: "light",
  MOVE: "move",
  SIGHT: "sight",
  SOUND: "sound"
};

SETTINGS.DEFAULT_HEIGHT.CHOICES = {
  MINOR: "minor-axis",
  MAJOR: "major-axis",
  CUSTOM: "custom"
};

for ( const shapeKey of SHAPE_KEYS ) {
  SETTINGS.DEFAULT_WALLS_BLOCK[shapeKey] = `default_${shapeKey}`;
  SETTINGS.DEFAULT_WALL_RESTRICTIONS[shapeKey] = `default-${shapeKey}-wall-restriction`;
  SETTINGS.DIAGONAL_SCALING[shapeKey] = `diagonal-scaling-${shapeKey}`;
  SETTINGS.DEFAULT_HEIGHT[shapeKey] = `default-height-${shapeKey}`;
  SETTINGS.DEFAULT_HEIGHT_CUSTOM_VALUE[shapeKey] = `default-height-custom-${shapeKey}`;
  SETTINGS.DEFAULT_HEIGHT_TOKEN_OVERRIDE[shapeKey] = `default-height-token-override-${shapeKey}`;
}

export function getSetting(settingName) {
  return game.settings.get(MODULE_ID, settingName);
}

export async function toggleSetting(settingName) {
  const curr = getSetting(settingName);
  return await game.settings.set(MODULE_ID, settingName, !curr);
}

export async function setSetting(settingName, value) {
  return await game.settings.set(MODULE_ID, settingName, value);
}

export function registerSettings() {
  log("Registering walled template switch");

  game.settings.registerMenu(MODULE_ID, "menu", {
    name: "Walled Templates Settings Menu",
    label: `${MODULE_ID}.settings.menu.title`,
    icon: "fas fa-cog",
    type: WalledTemplateShapeSettings,
    restricted: true
  });

  game.settings.register(MODULE_ID, SETTINGS.AUTOTARGET.ENABLED, {
    name: "Enable autotargeting",
    config: false,
    scope: "client",
    type: Boolean,
    default: false
  });

  const CHOICES = SETTINGS.AUTOTARGET.CHOICES;
  game.settings.register(MODULE_ID, SETTINGS.AUTOTARGET.MENU, {
    name: game.i18n.localize(`${MODULE_ID}.settings.${SETTINGS.AUTOTARGET.MENU}.Name`),
    hint: game.i18n.localize(`${MODULE_ID}.settings.${SETTINGS.AUTOTARGET.MENU}.Hint`),
    scope: "client",
    config: true,
    type: String,
    choices: {
      [SETTINGS.AUTOTARGET.CHOICES.NO]: game.i18n.localize(`${MODULE_ID}.settings.${SETTINGS.AUTOTARGET.MENU}.Choice.${CHOICES.NO}`),
      [SETTINGS.AUTOTARGET.CHOICES.TOGGLE_OFF]: game.i18n.localize(`${MODULE_ID}.settings.${SETTINGS.AUTOTARGET.MENU}.Choice.${CHOICES.TOGGLE_OFF}`),
      [SETTINGS.AUTOTARGET.CHOICES.TOGGLE_ON]: game.i18n.localize(`${MODULE_ID}.settings.${SETTINGS.AUTOTARGET.MENU}.Choice.${CHOICES.TOGGLE_ON}`),
      [SETTINGS.AUTOTARGET.CHOICES.YES]: game.i18n.localize(`${MODULE_ID}.settings.${SETTINGS.AUTOTARGET.MENU}.Choice.${CHOICES.YES}`)
    },
    default: SETTINGS.AUTOTARGET.CHOICES.TOGGLE_OFF,
    onChange: value => {
      const enabled = value === SETTINGS.AUTOTARGET.CHOICES.TOGGLE_ON
      || value === SETTINGS.AUTOTARGET.CHOICES.YES;
      setSetting(SETTINGS.AUTOTARGET.ENABLED, enabled);
      registerAutotargeting();
    }
  });

  const METHODS = SETTINGS.AUTOTARGET.METHODS;
  game.settings.register(MODULE_ID, SETTINGS.AUTOTARGET.METHOD, {
    name: game.i18n.localize(`${MODULE_ID}.settings.${SETTINGS.AUTOTARGET.METHOD}.Name`),
    hint: game.i18n.localize(`${MODULE_ID}.settings.${SETTINGS.AUTOTARGET.METHOD}.Hint`),
    scope: "world",
    config: true,
    default: "center",
    type: String,
    choices: {
      [SETTINGS.AUTOTARGET.METHODS.CENTER]: game.i18n.localize(`${MODULE_ID}.settings.${SETTINGS.AUTOTARGET.METHOD}.Method.${METHODS.CENTER}`),
      [SETTINGS.AUTOTARGET.METHODS.OVERLAP]: game.i18n.localize(`${MODULE_ID}.settings.${SETTINGS.AUTOTARGET.METHOD}.Method.${METHODS.OVERLAP}`)
    }
  }); // See class TokenLayer.targetObjects

  game.settings.register(MODULE_ID, SETTINGS.AUTOTARGET.AREA, {
    name: game.i18n.localize(`${MODULE_ID}.settings.${SETTINGS.AUTOTARGET.AREA}.Name`),
    hint: game.i18n.localize(`${MODULE_ID}.settings.${SETTINGS.AUTOTARGET.AREA}.Hint`),
    range: {
      max: 1,
      min: 0,
      step: 0.01
    },
    type: Number,
    default: 0,
    scope: "world",
    config: true
  });

  for ( const shape of SHAPE_KEYS ) {
    game.settings.register(MODULE_ID, SETTINGS.DEFAULT_WALLS_BLOCK[shape], {
      name: game.i18n.localize(`${MODULE_ID}.settings.${SETTINGS.DEFAULT_WALLS_BLOCK[shape]}.Name`),
      hint: game.i18n.localize(`${MODULE_ID}.settings.${SETTINGS.DEFAULT_WALLS_BLOCK[shape]}.Hint`),
      scope: "world",
      config: false,
      default: SETTINGS.DEFAULT_WALLS_BLOCK.CHOICES.UNWALLED,
      type: String,
      choices: {
        [SETTINGS.DEFAULT_WALLS_BLOCK.CHOICES.UNWALLED]: game.i18n.localize(`${MODULE_ID}.settings.${SETTINGS.DEFAULT_WALLS_BLOCK.CHOICES.UNWALLED}`),
        [SETTINGS.DEFAULT_WALLS_BLOCK.CHOICES.WALLED]: game.i18n.localize(`${MODULE_ID}.settings.${SETTINGS.DEFAULT_WALLS_BLOCK.CHOICES.WALLED}`),
        [SETTINGS.DEFAULT_WALLS_BLOCK.CHOICES.RECURSE]: game.i18n.localize(`${MODULE_ID}.settings.${SETTINGS.DEFAULT_WALLS_BLOCK.CHOICES.RECURSE}`)
      }
    });

    game.settings.register(MODULE_ID, SETTINGS.DEFAULT_WALL_RESTRICTIONS[shape], {
      name: game.i18n.localize(`${MODULE_ID}.settings.${SETTINGS.DEFAULT_WALL_RESTRICTIONS[shape]}.Name`),
      hint: game.i18n.localize(`${MODULE_ID}.settings.${SETTINGS.DEFAULT_WALL_RESTRICTIONS[shape]}.Hint`),
      scope: "world",
      config: false,
      default: SETTINGS.DEFAULT_WALL_RESTRICTIONS.CHOICES.MOVE,
      type: String,
      choices: {
        // Use the default Foundry en.json WALLS version
        [SETTINGS.DEFAULT_WALL_RESTRICTIONS.CHOICES.LIGHT]: game.i18n.localize("WALLS.Light"),
        [SETTINGS.DEFAULT_WALL_RESTRICTIONS.CHOICES.MOVE]: game.i18n.localize("WALLS.Movement"),
        [SETTINGS.DEFAULT_WALL_RESTRICTIONS.CHOICES.SIGHT]: game.i18n.localize("WALLS.Sight"),
        [SETTINGS.DEFAULT_WALL_RESTRICTIONS.CHOICES.SOUND]: game.i18n.localize("WALLS.Sound")
      }
    });

    game.settings.register(MODULE_ID, SETTINGS.DIAGONAL_SCALING[shape], {
      name: game.i18n.localize(`${MODULE_ID}.settings.${SETTINGS.DIAGONAL_SCALING[shape]}.Name`),
      hint: game.i18n.localize(`${MODULE_ID}.settings.${SETTINGS.DIAGONAL_SCALING[shape]}.Hint`),
      type: Boolean,
      default: false,
      scope: "world",
      config: false
    });

    game.settings.register(MODULE_ID, SETTINGS.DEFAULT_HEIGHT[shape], {
      name: game.i18n.localize(`${MODULE_ID}.settings.${SETTINGS.DEFAULT_WALL_RESTRICTIONS[shape]}.Name`),
      hint: game.i18n.localize(`${MODULE_ID}.settings.${SETTINGS.DEFAULT_WALL_RESTRICTIONS[shape]}.Hint`),
      scope: "world",
      config: false,
      default: SETTINGS.DEFAULT_WALL_RESTRICTIONS.CHOICES.MOVE,
      type: String,
      choices: {
        // Use the default Foundry en.json WALLS version
        [SETTINGS.DEFAULT_HEIGHT.CHOICES.MINOR]: game.i18n.localize(`${MODULE_ID}.settings.${SETTINGS.DEFAULT_HEIGHT.CHOICES.MINOR}`),
        [SETTINGS.DEFAULT_HEIGHT.CHOICES.MAJOR]: game.i18n.localize(`${MODULE_ID}.settings.${SETTINGS.DEFAULT_HEIGHT.CHOICES.MAJOR}`),
        [SETTINGS.DEFAULT_HEIGHT.CHOICES.CUSTOM]: game.i18n.localize(`${MODULE_ID}.settings.${SETTINGS.DEFAULT_HEIGHT.CHOICES.CUSTOM}`)
      }
    });

    game.settings.register(MODULE_ID, SETTINGS.DEFAULT_HEIGHT_CUSTOM_VALUE[shape], {
      name: game.i18n.localize(`${MODULE_ID}.settings.${SETTINGS.DEFAULT_HEIGHT_CUSTOM_VALUE[shape]}.Name`),
      hint: game.i18n.localize(`${MODULE_ID}.settings.${SETTINGS.DEFAULT_HEIGHT_CUSTOM_VALUE[shape]}.Hint`),
      type: Number,
      default: 1,
      scope: "world",
      config: false
    });

    game.settings.register(MODULE_ID, SETTINGS.DEFAULT_HEIGHT_TOKEN_OVERRIDE[shape], {
      name: game.i18n.localize(`${MODULE_ID}.settings.${SETTINGS.DEFAULT_HEIGHT_TOKEN_OVERRIDE[shape]}.Name`),
      hint: game.i18n.localize(`${MODULE_ID}.settings.${SETTINGS.DEFAULT_HEIGHT_TOKEN_OVERRIDE[shape]}.Hint`),
      type: Boolean,
      default: false,
      scope: "world",
      config: false
    });

  }

  log("Done registering settings.");
}

export function debugPolygons() {
  return game.modules.get("_dev-mode")?.api?.getPackageDebugValue(MODULE_ID);
}
