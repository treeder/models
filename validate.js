/**
 * Validates ob against clz
 * @param {*} ob
 * @param {*} model
 * @returns
 */
export function validate(ob, model) {
  function formatError(props, p, val) {
    let t = props[p].type
    if (typeof t == "function") {
      t = t.name
    }
    return `${p} has type ${t} but got value ${val} of type ${typeof val}`
  }

  const props = model.properties
  let errors = []
  for (const p in props) {
    const val = ob[p]
    if (val === undefined || val === null) {
      // TODO: might want to add notnull to property definition?
      continue
    }
    switch (props[p].type) {
      case String:
        break
      case Number:
        if (typeof val != "number") {
          errors.push(formatError(props, p, val))
        }
        break
      case Boolean:
        if (typeof val != "boolean") {
          errors.push(formatError(props, p, val))
        }
        break
      case Date:
        if (typeof val != "object" || !(val instanceof Date)) {
          errors.push(formatError(props, p, val))
        }
        break
      case BigInt:
        if (typeof val != "object" || !(val instanceof BigInt)) {
          errors.push(formatError(props, p, val))
        }
        break
      case Object:
        if (typeof val != "object") {
          errors.push(formatError(props, p, val))
        }
        break
      case JSON:
        break
      case Array:
        if (typeof val != "object" || !(val instanceof Array)) {
          errors.push(formatError(props, p, val))
        }
        break
    }
  }
  if (errors.length != 0) {
    throw new Error(errors.join("\n"))
  }
  if (model.validate !== undefined) {
    model.validate(ob)
  }
}
