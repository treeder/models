export function parseModel(obj, clz) {
  if (!obj) return
  if (!clz) return
  if (Array.isArray(obj)) {
    for (let ob of obj) {
      parseProperties(ob, clz)
    }
  } else {
    parseProperties(obj, clz)
  }
  return obj
}

function parseProperties(ob, clz) {
  if (!ob) return
  if (!clz) return
  if (clz.properties) {
    for (const propName in clz.properties) {
      let val = ob[propName]
      // console.log("prop:", propName, val)
      if (!val) continue
      let prop = clz.properties[propName]
      ob[propName] = parseProp(val, prop)
    }
  } else {
    // the object might be wrapped, so go deeper
    for (const propName in clz) {
      let val = ob[propName]
      // console.log("wrap prop:", propName, val)
      if (!val) continue
      let prop = clz[propName]
      parseProperties(val, prop)
    }
  }
}

function parseProp(val, p, sub = false) {
  if (!val || !p) return val
  if (p.parse) {
    // custom parse function
    return p.parse(val)
  }
  switch (p.type) {
    case Number:
      return Number(val)
    case Boolean:
      return Boolean(val)
    case Date:
      return new Date(val)
    case BigInt:
      return BigInt(val)
  }
  if (!sub) {
    // then parse JSON objects
    switch (p.type) {
      case Object:
        let v = JSON.parse(val)
        // check if there are any sub fields we need to parse
        for (const subProp in p) {
          // console.log("subProp:", subProp)
          // console.log(v)
          v[subProp] = parseProp(v[subProp], p[subProp], true)
          // console.log('after:', v)
        }
        return v
      case JSON:
        return JSON.parse(val)
      case Array:
        return JSON.parse(val)
      default:
        return val
    }
  }
}

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
