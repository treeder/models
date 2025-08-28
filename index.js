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
      return new Number(val)
    case Boolean:
      return val == 1
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
          v[subProp] = this.parseProp(v[subProp], p[subProp], true)
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