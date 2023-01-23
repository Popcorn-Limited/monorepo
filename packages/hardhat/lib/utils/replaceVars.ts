export function replaceVars(objSource, pattern, objReplacer) {
  if (typeof objSource === "object") {
    if (objSource === null) return null;

    if (objSource instanceof Array) {
      for (var i = 0; i < objSource.length; i++) {
        objSource[i] = replaceVars(objSource[i], pattern, objReplacer);
      }
    } else {
      for (var property in objSource) {
        objSource[property] = replaceVars(objSource[property], pattern, objReplacer);
      }
    }

    return objSource;
  }

  if (typeof objSource === "string") {
    if (pattern === "bytes32" && objSource.length == 66) {
      return objSource.replace(objSource, objReplacer);
    }
    return objSource.replace(pattern, objReplacer);
  }

  return objSource;
}
