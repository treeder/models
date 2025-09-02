/**
 * 
 * @param {*} obj the object to parse
 * @param {*} clz the models with `properties` defined
 * @param {*} options 
 * @param {boolean} options.parseJSON: boolean - whether to parse JSON fields. Default false.
 * @returns 
 */
export function parseModel(obj, clz, options = {}) {
  if (!obj) return
  if (!clz) return
  if (Array.isArray(obj)) {
    for (let ob of obj) {
      parseProperties(ob, clz, options)
    }
  } else {
    parseProperties(obj, clz, options)
  }
  return obj
}

function parseProperties(ob, clz, options) {
  if (!ob) return
  if (!clz) return
  if (clz.properties) {
    for (const propName in clz.properties) {
      let val = ob[propName]
      // console.log("prop:", propName, val)
      if (!val) continue
      let prop = clz.properties[propName]
      ob[propName] = parseProp(val, prop, options)
    }
  } else {
    // the object might be wrapped, so go deeper
    for (const propName in clz) {
      let val = ob[propName]
      // console.log("wrap prop:", propName, val)
      if (!val) continue
      let prop = clz[propName]
      parseProperties(val, prop, options)
    }
  }
}

function parseProp(val, p, options = {}) {
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
    case Object:
    case JSON:
      let v = val
      if (options.parseJSON) {
        // Only parse JSON if this is the top level and hasn't been parsed before. 
        // Eg: SQLite or D1 wouldn't be parsed yet, but getting from an API or elsewhere already would be. 
        v = JSON.parse(val)
      }
      // check if there are any sub fields we need to parse
      for (const subProp in p) {
        // console.log("subProp:", subProp), v)
        v[subProp] = parseProp(v[subProp], p[subProp], { parseJSON: false })
        // console.log('after:', v)
      }
      return v
    case Array:
      return JSON.parse(val)
    default:
      return val
  }
}