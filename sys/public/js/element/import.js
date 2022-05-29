/* Build not allowed */

export const importUMD = async (url, module = {exports:{}}) => {
    const response = await fetch(url);
    const script = await response.text();
    const func = Function("module", "exports", script)
    func.call(module, module, module.exports);
    return module.exports;
};
