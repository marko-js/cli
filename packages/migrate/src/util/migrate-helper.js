import enquirer from "enquirer";
export const AUTO_APPLY = Symbol("Auto Apply");

const STORES = new WeakMap();

export default class MigrateHelper {
  constructor() {
    STORES.set(this, new Map());
    Object.assign(this, enquirer);
  }

  has(name) {
    return STORES.get(this).has(name);
  }

  async run(name, ...args) {
    const migrations = STORES.get(this).get(name);

    if (!migrations) {
      return;
    }

    for (const { description, apply } of migrations) {
      if (description) {
        console.log(description);
      }

      await apply(this, ...args);
    }
  }
}

export function addMigration(
  helper,
  { name = AUTO_APPLY, description, apply }
) {
  const store = STORES.get(helper);
  const migrations = store.get(name);
  if (migrations) {
    migrations.push({ description, apply });
  } else {
    store.set(name, [{ description, apply }]);
  }
}

export function runAutoMigrations(helper) {
  return helper.run(AUTO_APPLY);
}
